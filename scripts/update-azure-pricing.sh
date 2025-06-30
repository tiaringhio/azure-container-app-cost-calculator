#!/bin/bash

# Azure Container Apps Pricing Data Updater
# This script fetches the latest pricing data from Azure Retail Prices API
# and updates the azure-pricing.json file

set -e

# Configuration
OUTPUT_PATH="${1:-../src/data/azure-pricing.json}"
API_URL="https://prices.azure.com/api/retail/prices?api-version=2023-01-01-preview&\$filter=serviceName%20eq%20'Azure%20Container%20Apps'"
MAX_PAGES=50
VERBOSE=${VERBOSE:-false}

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
    echo "   On Ubuntu/Debian: sudo apt-get install jq"
    exit 1
fi

# Create temporary file for collecting all data
TEMP_DATA=$(mktemp)
trap 'rm -f "$TEMP_DATA"' EXIT

# Initialize empty array
echo "[]" > "$TEMP_DATA"

# Fetch all pages
current_url="$API_URL"
page_count=0

while [ -n "$current_url" ] && [ $page_count -lt $MAX_PAGES ]; do
    page_count=$((page_count + 1))
    echo -e "${CYAN}📄 Fetching page $page_count...${NC}"
    
    # Fetch the page
    response=$(curl -s "$current_url")
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to fetch data from API${NC}"
        exit 1
    fi
    
    # Extract items and next page link
    items=$(echo "$response" | jq '.Items // []')
    next_page=$(echo "$response" | jq -r '.NextPageLink // empty')
    
    # Count items on this page
    item_count=$(echo "$items" | jq 'length')
    
    if [ "$VERBOSE" = true ]; then
        echo -e "   Found $item_count items on this page"
    fi
    
    # Merge with existing data
    jq --argjson new_items "$items" '. + $new_items' "$TEMP_DATA" > "${TEMP_DATA}.tmp" && mv "${TEMP_DATA}.tmp" "$TEMP_DATA"
    
    current_url="$next_page"
done

# Get total count
total_records=$(jq 'length' "$TEMP_DATA")
echo -e "${GREEN}✅ Fetched $total_records pricing records from $page_count pages${NC}"

echo -e "${YELLOW}🔄 Processing pricing data...${NC}"

# Get current date
current_date=$(date +"%Y-%m-%d")

# Process the data and create the pricing structure
cat "$TEMP_DATA" | jq --arg date "$current_date" --argjson total_records "$total_records" '
# First, let'"'"'s define some helper functions
def getCurrencySymbol(code):
  if code == "USD" then "$"
  elif code == "EUR" then "€"
  elif code == "GBP" then "£"
  elif code == "CHF" then "CHF"
  elif code == "JPY" then "¥"
  elif code == "AUD" then "A$"
  elif code == "BRL" then "R$"
  elif code == "CAD" then "C$"
  elif code == "KRW" then "₩"
  elif code == "INR" then "₹"
  else code
  end;

# Group data by relevant categories
def standardActiveVCPU: map(select(.skuName == "Standard" and (.meterName | test("vCPU Active Usage")) and (.unitOfMeasure == "1 Second")));
def standardActiveMemory: map(select(.skuName == "Standard" and (.meterName | test("Memory Active Usage")) and (.unitOfMeasure == "1 Second")));
def standardIdleVCPU: map(select(.skuName == "Standard" and (.meterName | test("vCPU Idle Usage")) and (.unitOfMeasure == "1 Second")));
def standardIdleMemory: map(select(.skuName == "Standard" and (.meterName | test("Memory Idle Usage")) and (.unitOfMeasure == "1 Second")));
def standardRequests: map(select(.skuName == "Standard" and (.meterName | test("Request"))));
def dedicatedVCPU: map(select(.skuName == "Dedicated" and (.meterName | test("vCPU Usage")) and (.unitOfMeasure == "1 Hour")));
def dedicatedMemory: map(select(.skuName == "Dedicated" and (.meterName | test("Memory Usage")) and (.unitOfMeasure == "1 Hour")));

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
        "vcpu": (
          group_by(.currencyCode) |
          map(select((. | standardActiveVCPU | length) > 0)) |
          map({
            key: (.[0].currencyCode | ascii_downcase),
            value: {
              "perSecond": (. | standardActiveVCPU | .[0].unitPrice // 0),
              "description": "vCPU usage per second"
            }
          }) |
          from_entries
        ),
        "memory": (
          group_by(.currencyCode) |
          map(select((. | standardActiveMemory | length) > 0)) |
          map({
            key: (.[0].currencyCode | ascii_downcase),
            value: {
              "perSecond": (. | standardActiveMemory | .[0].unitPrice // 0),
              "perGibPerSecond": (. | standardActiveMemory | .[0].unitPrice // 0),
              "description": "Memory (GiB) usage per second"
            }
          }) |
          from_entries
        )
      }
    },
    "idleUsage": {
      "pricing": {
        "vcpu": (
          group_by(.currencyCode) |
          map(select((. | standardIdleVCPU | length) > 0)) |
          map({
            key: (.[0].currencyCode | ascii_downcase),
            value: {
              "perSecond": (. | standardIdleVCPU | .[0].unitPrice // 0)
            }
          }) |
          from_entries
        ),
        "memory": (
          group_by(.currencyCode) |
          map(select((. | standardIdleMemory | length) > 0)) |
          map({
            key: (.[0].currencyCode | ascii_downcase),
            value: {
              "perSecond": (. | standardIdleMemory | .[0].unitPrice // 0),
              "perGibPerSecond": (. | standardIdleMemory | .[0].unitPrice // 0)
            }
          }) |
          from_entries
        )
      }
    },
    "requests": (
      group_by(.currencyCode) |
      map(select((. | standardRequests | length) > 0)) |
      map({
        key: (.[0].currencyCode | ascii_downcase),
        value: {
          "perMillionRequests": ((. | standardRequests | .[0].unitPrice // 0) * 1000000),
          "freeRequestsPerMonth": 2000000
        }
      }) |
      from_entries
    )
  },
  "dedicatedPlan": {
    "management": {
      "usd": {
        "perHour": 0.244
      }
    },
    "compute": {
      "vcpu": (
        group_by(.currencyCode) |
        map(select((. | dedicatedVCPU | length) > 0)) |
        map({
          key: (.[0].currencyCode | ascii_downcase),
          value: {
            "perHour": (. | dedicatedVCPU | .[0].unitPrice // 0)
          }
        }) |
        from_entries
      ),
      "memory": (
        group_by(.currencyCode) |
        map(select((. | dedicatedMemory | length) > 0)) |
        map({
          key: (.[0].currencyCode | ascii_downcase),
          value: {
            "perGibPerHour": (. | dedicatedMemory | .[0].unitPrice // 0)
          }
        }) |
        from_entries
      )
    }
  },
  "regions": (
    group_by(.armRegionName) |
    map({
      key: .[0].armRegionName,
      value: {
        "name": .[0].location,
        "currency": .[0].currencyCode,
        "multiplier": 1.0
      }
    }) |
    from_entries
  ),
  "currencies": (
    group_by(.currencyCode) |
    map({
      key: .[0].currencyCode,
      value: {
        "symbol": getCurrencySymbol(.[0].currencyCode),
        "name": .[0].currencyCode
      }
    }) |
    from_entries
  ),
  "rawApiData": (
    map({
      "meterName": .meterName,
      "skuName": .skuName,
      "productName": .productName,
      "unitPrice": .unitPrice,
      "currencyCode": .currencyCode,
      "unitOfMeasure": .unitOfMeasure,
      "region": .armRegionName,
      "location": .location,
      "effectiveStartDate": .effectiveStartDate,
      "tierMinimumUnits": .tierMinimumUnits
    })
  )
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
