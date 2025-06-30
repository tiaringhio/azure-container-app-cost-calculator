# Azure Container Apps Pricing Data Updater
# This script fetches the latest pricing data from Azure Retail Prices API
# and updates the azure-pricing.json file

param(
    [string]$OutputPath = "../src/data/azure-pricing.json",
    [switch]$Verbose
)

# Set error action preference
$ErrorActionPreference = "Stop"

# API Configuration
$apiUrl = "https://prices.azure.com/api/retail/prices?api-version=2023-01-01-preview&`$filter=serviceName eq 'Azure Container Apps'"
$maxPages = 50  # Prevent infinite loops

Write-Host "🔄 Fetching Azure Container Apps pricing data..." -ForegroundColor Yellow

try {
    # Initialize collections
    $allPriceData = @()
    $currentUrl = $apiUrl
    $pageCount = 0

    # Fetch all pages of pricing data
    do {
        $pageCount++
        Write-Host "📄 Fetching page $pageCount..." -ForegroundColor Cyan
        
        $response = Invoke-RestMethod -Uri $currentUrl -Method Get
        $allPriceData += $response.Items
        $currentUrl = $response.NextPageLink
        
        if ($Verbose) {
            Write-Host "   Found $($response.Items.Count) items on this page" -ForegroundColor Gray
        }
        
        if ($pageCount -ge $maxPages) {
            Write-Warning "Reached maximum page limit ($maxPages). Some data might be missing."
            break
        }
    } while ($currentUrl)

    Write-Host "✅ Fetched $($allPriceData.Count) pricing records from $pageCount pages" -ForegroundColor Green

    # Process and organize the data
    Write-Host "🔄 Processing pricing data..." -ForegroundColor Yellow

    # Initialize the pricing structure
    $pricingData = @{
        lastUpdated = Get-Date -Format "yyyy-MM-dd"
        source = "Azure Retail Prices API"
        apiVersion = "2023-01-01-preview"
        totalRecords = $allPriceData.Count
        consumptionPlan = @{
            activeUsage = @{
                freeAllowances = @{
                    vcpuSeconds = 180000
                    memoryGibSeconds = 360000
                    requests = 2000000
                }
                pricing = @{}
            }
            idleUsage = @{
                pricing = @{}
            }
            requests = @{}
        }
        dedicatedPlan = @{
            management = @{
                usd = @{
                    perHour = 0.244
                }
            }
            compute = @{}
        }
        regions = @{}
        currencies = @{}
        rawApiData = @()
    }

    # Group data by meter name and region
    $groupedData = $allPriceData | Group-Object -Property meterName, armRegionName

    # Process each pricing item
    foreach ($item in $allPriceData) {
        # Skip items without essential data
        if (-not $item.unitPrice -or -not $item.currencyCode -or -not $item.armRegionName) {
            continue
        }

        # Add to raw data for reference
        $pricingData.rawApiData += @{
            meterName = $item.meterName
            skuName = $item.skuName
            productName = $item.productName
            unitPrice = $item.unitPrice
            currencyCode = $item.currencyCode
            unitOfMeasure = $item.unitOfMeasure
            region = $item.armRegionName
            location = $item.location
            effectiveStartDate = $item.effectiveStartDate
            tierMinimumUnits = $item.tierMinimumUnits
        }

        # Add region information
        if (-not $pricingData.regions.ContainsKey($item.armRegionName)) {
            $pricingData.regions[$item.armRegionName] = @{
                name = $item.location
                currency = $item.currencyCode
                multiplier = 1.0
            }
        }

        # Add currency information
        if (-not $pricingData.currencies.ContainsKey($item.currencyCode)) {
            $pricingData.currencies[$item.currencyCode] = @{
                symbol = switch ($item.currencyCode) {
                    "USD" { "$" }
                    "EUR" { "€" }
                    "GBP" { "£" }
                    "CHF" { "CHF" }
                    "JPY" { "¥" }
                    "AUD" { "A$" }
                    "BRL" { "R$" }
                    "CAD" { "C$" }
                    "KRW" { "₩" }
                    "INR" { "₹" }
                    default { $item.currencyCode }
                }
                name = $item.currencyCode
            }
        }

        # Process consumption plan pricing (Standard SKU)
        if ($item.skuName -eq "Standard") {
            $currencyLower = $item.currencyCode.ToLower()
            
            # Active vCPU usage
            if ($item.meterName -match "vCPU Active Usage" -and $item.unitOfMeasure -eq "1 Second") {
                if (-not $pricingData.consumptionPlan.activeUsage.pricing.ContainsKey("vcpu")) {
                    $pricingData.consumptionPlan.activeUsage.pricing.vcpu = @{}
                }
                if (-not $pricingData.consumptionPlan.activeUsage.pricing.vcpu.ContainsKey($currencyLower)) {
                    $pricingData.consumptionPlan.activeUsage.pricing.vcpu[$currencyLower] = @{}
                }
                $pricingData.consumptionPlan.activeUsage.pricing.vcpu[$currencyLower].perSecond = $item.unitPrice
                $pricingData.consumptionPlan.activeUsage.pricing.vcpu[$currencyLower].description = "vCPU usage per second"
            }
            
            # Active Memory usage
            if ($item.meterName -match "Memory Active Usage" -and $item.unitOfMeasure -eq "1 Second") {
                if (-not $pricingData.consumptionPlan.activeUsage.pricing.ContainsKey("memory")) {
                    $pricingData.consumptionPlan.activeUsage.pricing.memory = @{}
                }
                if (-not $pricingData.consumptionPlan.activeUsage.pricing.memory.ContainsKey($currencyLower)) {
                    $pricingData.consumptionPlan.activeUsage.pricing.memory[$currencyLower] = @{}
                }
                $pricingData.consumptionPlan.activeUsage.pricing.memory[$currencyLower].perSecond = $item.unitPrice
                $pricingData.consumptionPlan.activeUsage.pricing.memory[$currencyLower].perGibPerSecond = $item.unitPrice
                $pricingData.consumptionPlan.activeUsage.pricing.memory[$currencyLower].description = "Memory (GiB) usage per second"
            }
            
            # Idle vCPU usage
            if ($item.meterName -match "vCPU Idle Usage" -and $item.unitOfMeasure -eq "1 Second") {
                if (-not $pricingData.consumptionPlan.idleUsage.pricing.ContainsKey("vcpu")) {
                    $pricingData.consumptionPlan.idleUsage.pricing.vcpu = @{}
                }
                if (-not $pricingData.consumptionPlan.idleUsage.pricing.vcpu.ContainsKey($currencyLower)) {
                    $pricingData.consumptionPlan.idleUsage.pricing.vcpu[$currencyLower] = @{}
                }
                $pricingData.consumptionPlan.idleUsage.pricing.vcpu[$currencyLower].perSecond = $item.unitPrice
            }
            
            # Idle Memory usage
            if ($item.meterName -match "Memory Idle Usage" -and $item.unitOfMeasure -eq "1 Second") {
                if (-not $pricingData.consumptionPlan.idleUsage.pricing.ContainsKey("memory")) {
                    $pricingData.consumptionPlan.idleUsage.pricing.memory = @{}
                }
                if (-not $pricingData.consumptionPlan.idleUsage.pricing.memory.ContainsKey($currencyLower)) {
                    $pricingData.consumptionPlan.idleUsage.pricing.memory[$currencyLower] = @{}
                }
                $pricingData.consumptionPlan.idleUsage.pricing.memory[$currencyLower].perSecond = $item.unitPrice
                $pricingData.consumptionPlan.idleUsage.pricing.memory[$currencyLower].perGibPerSecond = $item.unitPrice
            }
            
            # Requests
            if ($item.meterName -match "Request") {
                if (-not $pricingData.consumptionPlan.requests.ContainsKey($currencyLower)) {
                    $pricingData.consumptionPlan.requests[$currencyLower] = @{}
                }
                # Convert from per-request to per-million-requests
                $pricingData.consumptionPlan.requests[$currencyLower].perMillionRequests = $item.unitPrice * 1000000
                $pricingData.consumptionPlan.requests[$currencyLower].freeRequestsPerMonth = 2000000
            }
        }
        # Process dedicated plan pricing
        if ($item.skuName -eq "Dedicated") {
            $currencyLower = $item.currencyCode.ToLower()
            
            # Dedicated vCPU usage
            if ($item.meterName -match "vCPU Usage" -and $item.unitOfMeasure -eq "1 Hour") {
                if (-not $pricingData.dedicatedPlan.compute.ContainsKey("vcpu")) {
                    $pricingData.dedicatedPlan.compute.vcpu = @{}
                }
                if (-not $pricingData.dedicatedPlan.compute.vcpu.ContainsKey($currencyLower)) {
                    $pricingData.dedicatedPlan.compute.vcpu[$currencyLower] = @{}
                }
                $pricingData.dedicatedPlan.compute.vcpu[$currencyLower].perHour = $item.unitPrice
            }
            
            # Dedicated Memory usage
            if ($item.meterName -match "Memory Usage" -and $item.unitOfMeasure -eq "1 Hour") {
                if (-not $pricingData.dedicatedPlan.compute.ContainsKey("memory")) {
                    $pricingData.dedicatedPlan.compute.memory = @{}
                }
                if (-not $pricingData.dedicatedPlan.compute.memory.ContainsKey($currencyLower)) {
                    $pricingData.dedicatedPlan.compute.memory[$currencyLower] = @{}
                }
                $pricingData.dedicatedPlan.compute.memory[$currencyLower].perGibPerHour = $item.unitPrice
            }
        }
    }

    # Get the absolute path for the output file
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    $outputFile = Join-Path $scriptDir $OutputPath
    $outputFile = [System.IO.Path]::GetFullPath($outputFile)

    Write-Host "💾 Saving pricing data to: $outputFile" -ForegroundColor Yellow

    # Convert to JSON and save
    $jsonOutput = $pricingData | ConvertTo-Json -Depth 10 -Compress:$false
    
    # Create directory if it doesn't exist
    $outputDir = Split-Path -Parent $outputFile
    if (-not (Test-Path $outputDir)) {
        New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
    }
    
    # Save the file
    $jsonOutput | Out-File -FilePath $outputFile -Encoding UTF8

    Write-Host "✅ Successfully updated pricing data!" -ForegroundColor Green
    Write-Host "📊 Summary:" -ForegroundColor Cyan
    Write-Host "   • Total records processed: $($allPriceData.Count)" -ForegroundColor White
    Write-Host "   • Regions found: $($pricingData.regions.Count)" -ForegroundColor White
    Write-Host "   • Currencies found: $($pricingData.currencies.Count)" -ForegroundColor White
    Write-Host "   • Output file: $outputFile" -ForegroundColor White
    Write-Host "   • Last updated: $($pricingData.lastUpdated)" -ForegroundColor White

} catch {
    Write-Error "❌ Failed to update pricing data: $($_.Exception.Message)"
    Write-Error "Stack trace: $($_.ScriptStackTrace)"
    exit 1
}
