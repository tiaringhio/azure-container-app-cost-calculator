#!/bin/bash

# Azure Container Apps Pricing Data Updater - Simplified Version
# This script fetches the latest pricing data from Azure Retail Prices API
# and updates the azure-pricing.json file

set -e

# Configuration
OUTPUT_PATH="${1:-../src/data/azure-pricing.json}"
API_URL="https://prices.azure.com/api/retail/prices?api-version=2023-01-01-preview&\$filter=serviceName%20eq%20'Azure%20Container%20Apps'"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔄 Fetching Azure Container Apps pricing data...${NC}"

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${RED}❌ Error: jq is required but not installed. Please install jq first.${NC}"
    echo "   On macOS: brew install jq"
    exit 1
fi

# Fetch data (first page only for now - API usually returns all data in one page)
echo -e "${CYAN}📄 Fetching pricing data...${NC}"
response=$(curl -s "$API_URL")

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to fetch data from API${NC}"
    exit 1
fi

# Get total count
total_records=$(echo "$response" | jq '.Items | length')
echo -e "${GREEN}✅ Fetched $total_records pricing records${NC}"

echo -e "${YELLOW}🔄 Processing pricing data...${NC}"

# Get current date
current_date=$(date +"%Y-%m-%d")

# Process the data and create the pricing structure
echo "$response" | jq --arg date "$current_date" --argjson total_records "$total_records" '
{
  "lastUpdated": $date,
  "source": "Azure Retail Prices API",
  "apiVersion": "2023-01-01-preview",
  "totalRecords": $total_records,
  "consumptionPlan": {
    "activeUsage": {
      "freeAllowances": {
        "vcpuSeconds": 180000,
        "memoryGibSeconds": 360000,
        "requests": 2000000
      },
      "pricing": {
        "vcpu": {
          "usd": {
            "perSecond": (.Items[] | select(.meterName == "Standard vCPU Active Usage" and .unitOfMeasure == "1 Second" and .currencyCode == "USD") | .unitPrice),
            "description": "vCPU usage per second"
          }
        },
        "memory": {
          "usd": {
            "perSecond": (.Items[] | select(.meterName == "Standard Memory Active Usage" and .unitOfMeasure == "1 Second" and .currencyCode == "USD") | .unitPrice),
            "perGibPerSecond": (.Items[] | select(.meterName == "Standard Memory Active Usage" and .unitOfMeasure == "1 Second" and .currencyCode == "USD") | .unitPrice),
            "description": "Memory (GiB) usage per second"
          }
        }
      }
    },
    "idleUsage": {
      "pricing": {
        "vcpu": {
          "usd": {
            "perSecond": (.Items[] | select(.meterName == "Standard vCPU Idle Usage" and .unitOfMeasure == "1 Second" and .currencyCode == "USD") | .unitPrice)
          }
        },
        "memory": {
          "usd": {
            "perSecond": (.Items[] | select(.meterName == "Standard Memory Idle Usage" and .unitOfMeasure == "1 Second" and .currencyCode == "USD") | .unitPrice),
            "perGibPerSecond": (.Items[] | select(.meterName == "Standard Memory Idle Usage" and .unitOfMeasure == "1 Second" and .currencyCode == "USD") | .unitPrice)
          }
        }
      }
    },
    "requests": {
      "usd": {
        "perMillionRequests": ((.Items[] | select(.meterName | test("Request")) | .unitPrice) * 1000000),
        "freeRequestsPerMonth": 2000000
      }
    }
  },
  "dedicatedPlan": {
    "management": {
      "usd": {
        "perHour": 0.244
      }
    },
    "compute": {
      "vcpu": {
        "usd": {
          "perHour": (.Items[] | select(.meterName == "Dedicated vCPU Usage" and .unitOfMeasure == "1 Hour" and .currencyCode == "USD") | .unitPrice)
        }
      },
      "memory": {
        "usd": {
          "perGibPerHour": (.Items[] | select(.meterName == "Dedicated Memory Usage" and .unitOfMeasure == "1 Hour" and .currencyCode == "USD") | .unitPrice)
        }
      }
    }
  },
  "regions": (
    [.Items[] | {key: .armRegionName, value: {name: .location, currency: .currencyCode, multiplier: 1.0}}] |
    group_by(.key) |
    map({key: .[0].key, value: .[0].value}) |
    from_entries
  ),
  "currencies": {
    "USD": {
      "symbol": "$",
      "name": "US Dollar"
    }
  },
  "rawApiData": .Items[0:10]
}' > pricing_processed.json

# Get the absolute path for the output file
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
output_file="$(cd "$(dirname "$script_dir/$OUTPUT_PATH")" && pwd)/$(basename "$OUTPUT_PATH")"

echo -e "${YELLOW}💾 Saving pricing data to: $output_file${NC}"

# Create directory if it doesn't exist
mkdir -p "$(dirname "$output_file")"

# Save the file
mv pricing_processed.json "$output_file"

# Get some statistics
regions_count=$(jq '.regions | length' "$output_file")
currencies_count=$(jq '.currencies | length' "$output_file")
last_updated=$(jq -r '.lastUpdated' "$output_file")

echo -e "${GREEN}✅ Successfully updated pricing data!${NC}"
echo -e "${CYAN}📊 Summary:${NC}"
echo -e "${WHITE}   • Total records processed: $total_records${NC}"
echo -e "${WHITE}   • Regions found: $regions_count${NC}"
echo -e "${WHITE}   • Currencies found: $currencies_count${NC}"
echo -e "${WHITE}   • Output file: $output_file${NC}"
echo -e "${WHITE}   • Last updated: $last_updated${NC}"

# Show sample pricing
echo -e "${CYAN}💰 Sample Pricing (USD):${NC}"
echo -e "${WHITE}   • vCPU Active: \$$(jq -r '.consumptionPlan.activeUsage.pricing.vcpu.usd.perSecond' "$output_file") per second${NC}"
echo -e "${WHITE}   • Memory Active: \$$(jq -r '.consumptionPlan.activeUsage.pricing.memory.usd.perSecond' "$output_file") per GiB per second${NC}"
echo -e "${WHITE}   • vCPU Idle: \$$(jq -r '.consumptionPlan.idleUsage.pricing.vcpu.usd.perSecond' "$output_file") per second${NC}"
