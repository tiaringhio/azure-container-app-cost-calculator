#!/bin/bash

# Simple test script to fetch pricing data
set -e

echo "🔄 Fetching sample Azure Container Apps pricing data..."

# Fetch only first page
response=$(curl -s "https://prices.azure.com/api/retail/prices?api-version=2023-01-01-preview&\$filter=serviceName%20eq%20'Azure%20Container%20Apps'")

echo "✅ Fetched data successfully"

# Extract just a few key metrics
echo "$response" | jq '{
  "lastUpdated": (now | strftime("%Y-%m-%d")),
  "source": "Azure Retail Prices API",
  "totalRecords": (.Items | length),
  "sampleData": {
    "standardVCPUActive": (.Items[] | select(.meterName == "Standard vCPU Active Usage" and .unitOfMeasure == "1 Second") | {unitPrice, currencyCode} | select(.currencyCode == "USD")),
    "standardMemoryActive": (.Items[] | select(.meterName == "Standard Memory Active Usage" and .unitOfMeasure == "1 Second") | {unitPrice, currencyCode} | select(.currencyCode == "USD")),
    "dedicatedVCPU": (.Items[] | select(.meterName == "Dedicated vCPU Usage" and .unitOfMeasure == "1 Hour") | {unitPrice, currencyCode} | select(.currencyCode == "USD"))
  },
  "allMeterNames": (.Items | group_by(.meterName) | map(.[0].meterName) | sort)
}' > test-pricing.json

echo "💾 Sample data saved to test-pricing.json"
echo "📊 Found $(jq '.totalRecords' test-pricing.json) total records"
echo "🔍 Available meter names:"
jq -r '.allMeterNames[]' test-pricing.json | head -10
