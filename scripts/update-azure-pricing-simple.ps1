# Azure Container Apps Pricing Data Updater - Simple Version
# This script fetches the latest pricing data from Azure Retail Prices API

param(
    [string]$OutputPath = "../src/data/azure-pricing.json",
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

$apiUrl = "https://prices.azure.com/api/retail/prices?api-version=2023-01-01-preview&`$filter=serviceName eq 'Azure Container Apps'"

Write-Host "🔄 Fetching Azure Container Apps pricing data..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method Get
    $items = $response.Items
    
    Write-Host "✅ Fetched $($items.Count) pricing records" -ForegroundColor Green
    Write-Host "🔄 Processing pricing data..." -ForegroundColor Yellow

    # Find specific pricing items
    $standardVCPUActive = $items | Where-Object { $_.meterName -eq "Standard vCPU Active Usage" -and $_.unitOfMeasure -eq "1 Second" -and $_.currencyCode -eq "USD" } | Select-Object -First 1
    $standardMemoryActive = $items | Where-Object { $_.meterName -eq "Standard Memory Active Usage" -and $_.unitOfMeasure -eq "1 GiB Second" -and $_.currencyCode -eq "USD" } | Select-Object -First 1
    $standardVCPUIdle = $items | Where-Object { $_.meterName -eq "Standard vCPU Idle Usage" -and $_.unitOfMeasure -eq "1 Second" -and $_.currencyCode -eq "USD" } | Select-Object -First 1
    $standardMemoryIdle = $items | Where-Object { $_.meterName -eq "Standard Memory Idle Usage" -and $_.unitOfMeasure -eq "1 GiB Second" -and $_.currencyCode -eq "USD" } | Select-Object -First 1
    $standardRequests = $items | Where-Object { $_.meterName -match "Request" -and $_.currencyCode -eq "USD" } | Select-Object -First 1
    $dedicatedVCPU = $items | Where-Object { $_.meterName -eq "Dedicated vCPU Usage" -and $_.unitOfMeasure -eq "1 Hour" -and $_.currencyCode -eq "USD" } | Select-Object -First 1
    $dedicatedMemory = $items | Where-Object { $_.meterName -eq "Dedicated Memory Usage" -and $_.unitOfMeasure -eq "1 Hour" -and $_.currencyCode -eq "USD" } | Select-Object -First 1

    # Create regions hash table
    $regions = @{}
    $items | Group-Object -Property armRegionName | ForEach-Object {
        $regionItem = $_.Group[0]
        $regions[$regionItem.armRegionName] = @{
            name = $regionItem.location
            currency = $regionItem.currencyCode
            multiplier = 1.0
        }
    }

    # Create the pricing structure
    $pricingData = @{
        lastUpdated = Get-Date -Format "yyyy-MM-dd"
        source = "Azure Retail Prices API"
        apiVersion = "2023-01-01-preview"
        totalRecords = $items.Count
        consumptionPlan = @{
            activeUsage = @{
                freeAllowances = @{
                    vcpuSeconds = 180000
                    memoryGibSeconds = 360000
                    requests = 2000000
                }
                pricing = @{
                    vcpu = @{
                        usd = @{
                            perSecond = if ($standardVCPUActive) { $standardVCPUActive.unitPrice } else { 0 }
                            description = "vCPU usage per second"
                        }
                        eur = @{
                            perSecond = if ($standardVCPUActive) { $standardVCPUActive.unitPrice * 0.85 } else { 0 }
                            description = "vCPU usage per second"
                        }
                    }
                    memory = @{
                        usd = @{
                            perSecond = if ($standardMemoryActive) { $standardMemoryActive.unitPrice } else { 0 }
                            perGibPerSecond = if ($standardMemoryActive) { $standardMemoryActive.unitPrice } else { 0 }
                            description = "Memory (GiB) usage per second"
                        }
                        eur = @{
                            perSecond = if ($standardMemoryActive) { $standardMemoryActive.unitPrice * 0.85 } else { 0 }
                            perGibPerSecond = if ($standardMemoryActive) { $standardMemoryActive.unitPrice * 0.85 } else { 0 }
                            description = "Memory (GiB) usage per second"
                        }
                    }
                }
            }
            idleUsage = @{
                pricing = @{
                    vcpu = @{
                        usd = @{
                            perSecond = if ($standardVCPUIdle) { $standardVCPUIdle.unitPrice } else { 0 }
                        }
                        eur = @{
                            perSecond = if ($standardVCPUIdle) { $standardVCPUIdle.unitPrice * 0.85 } else { 0 }
                        }
                    }
                    memory = @{
                        usd = @{
                            perSecond = if ($standardMemoryIdle) { $standardMemoryIdle.unitPrice } else { 0 }
                            perGibPerSecond = if ($standardMemoryIdle) { $standardMemoryIdle.unitPrice } else { 0 }
                        }
                        eur = @{
                            perSecond = if ($standardMemoryIdle) { $standardMemoryIdle.unitPrice * 0.85 } else { 0 }
                            perGibPerSecond = if ($standardMemoryIdle) { $standardMemoryIdle.unitPrice * 0.85 } else { 0 }
                        }
                    }
                }
            }
            requests = @{
                usd = @{
                    perMillionRequests = if ($standardRequests) { $standardRequests.unitPrice * 1000000 } else { 0.40 }
                    freeRequestsPerMonth = 2000000
                }
            }
        }
        dedicatedPlan = @{
            management = @{
                usd = @{
                    perHour = 0.244
                }
            }
            compute = @{
                vcpu = @{
                    usd = @{
                        perHour = if ($dedicatedVCPU) { $dedicatedVCPU.unitPrice } else { 0 }
                    }
                }
                memory = @{
                    usd = @{
                        perGibPerHour = if ($dedicatedMemory) { $dedicatedMemory.unitPrice } else { 0 }
                    }
                }
            }
        }
        regions = $regions
        currencies = @{
            USD = @{
                symbol = "$"
                name = "US Dollar"
                rates = @{
                    EUR = 0.85
                    GBP = 0.75
                    CHF = 0.88
                    JPY = 110.0
                    AUD = 1.35
                    BRL = 5.0
                    CAD = 1.25
                    KRW = 1200.0
                    INR = 75.0
                }
            }
            EUR = @{
                symbol = "€"
                name = "Euro"
                rates = @{
                    USD = 1.18
                    GBP = 0.88
                    CHF = 1.03
                    JPY = 130.0
                    AUD = 1.59
                    BRL = 5.88
                    CAD = 1.47
                    KRW = 1412.0
                    INR = 88.2
                }
            }
        }
        rawApiData = $items | Select-Object -First 10 | ForEach-Object {
            @{
                meterName = $_.meterName
                skuName = $_.skuName
                productName = $_.productName
                unitPrice = $_.unitPrice
                currencyCode = $_.currencyCode
                unitOfMeasure = $_.unitOfMeasure
                region = $_.armRegionName
                location = $_.location
                effectiveStartDate = $_.effectiveStartDate
                tierMinimumUnits = $_.tierMinimumUnits
            }
        }
    }

    # Get the absolute path for the output file
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    $outputFile = Join-Path $scriptDir $OutputPath
    $outputFile = [System.IO.Path]::GetFullPath($outputFile)

    Write-Host "💾 Saving pricing data to: $outputFile" -ForegroundColor Yellow

    # Convert to JSON and save
    $jsonOutput = $pricingData | ConvertTo-Json -Depth 10
    
    # Create directory if it doesn't exist
    $outputDir = Split-Path -Parent $outputFile
    if (-not (Test-Path $outputDir)) {
        New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
    }
    
    # Save the file
    $jsonOutput | Out-File -FilePath $outputFile -Encoding UTF8

    Write-Host "✅ Successfully updated pricing data!" -ForegroundColor Green
    Write-Host "📊 Summary:" -ForegroundColor Cyan
    Write-Host "   • Total records processed: $($items.Count)" -ForegroundColor White
    Write-Host "   • Regions found: $($regions.Count)" -ForegroundColor White
    Write-Host "   • Output file: $outputFile" -ForegroundColor White
    Write-Host "   • Last updated: $($pricingData.lastUpdated)" -ForegroundColor White
    
    Write-Host "💰 Sample Pricing (USD):" -ForegroundColor Cyan
    if ($standardVCPUActive) {
        Write-Host "   • vCPU Active: `$$($standardVCPUActive.unitPrice) per second" -ForegroundColor White
    }
    if ($standardMemoryActive) {
        Write-Host "   • Memory Active: `$$($standardMemoryActive.unitPrice) per GiB per second" -ForegroundColor White
    }
    if ($standardVCPUIdle) {
        Write-Host "   • vCPU Idle: `$$($standardVCPUIdle.unitPrice) per second" -ForegroundColor White
    }

} catch {
    Write-Error "❌ Failed to update pricing data: $($_.Exception.Message)"
    exit 1
}
