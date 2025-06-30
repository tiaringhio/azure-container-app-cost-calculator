#!/bin/bash

# Script per verificare l'aggiornamento dei prezzi
echo "🔍 Verifica aggiornamento prezzi Azure Container Apps"
echo "================================================="

if [ ! -f "src/data/azure-pricing.json" ]; then
    echo "❌ File azure-pricing.json non trovato!"
    exit 1
fi

echo "📅 Data ultimo aggiornamento: $(jq -r '.lastUpdated' src/data/azure-pricing.json)"
echo "📊 Numero totale record: $(jq '.totalRecords' src/data/azure-pricing.json)"
echo "🌍 Numero regioni: $(jq '.regions | length' src/data/azure-pricing.json)"

echo ""
echo "💰 Prezzi attuali (USD):"
vcpu_active=$(jq -r '.consumptionPlan.activeUsage.pricing.vcpu.usd.perSecond' src/data/azure-pricing.json)
vcpu_idle=$(jq -r '.consumptionPlan.idleUsage.pricing.vcpu.usd.perSecond' src/data/azure-pricing.json)
memory_active=$(jq -r '.consumptionPlan.activeUsage.pricing.memory.usd.perSecond' src/data/azure-pricing.json)
memory_idle=$(jq -r '.consumptionPlan.idleUsage.pricing.memory.usd.perSecond' src/data/azure-pricing.json)
requests=$(jq -r '.consumptionPlan.requests.usd.perMillionRequests' src/data/azure-pricing.json)

echo "   • vCPU Active:  \$$vcpu_active per secondo"
echo "   • vCPU Idle:    \$$vcpu_idle per secondo"
echo "   • Memory Active: \$$memory_active per GiB/secondo"
echo "   • Memory Idle:   \$$memory_idle per GiB/secondo"
echo "   • Requests:     \$$requests per milione"

echo ""
echo "🏢 Prezzi Dedicated Plan (USD):"
mgmt=$(jq -r '.dedicatedPlan.management.usd.perHour' src/data/azure-pricing.json)
vcpu_ded=$(jq -r '.dedicatedPlan.compute.vcpu.usd.perHour' src/data/azure-pricing.json)
mem_ded=$(jq -r '.dedicatedPlan.compute.memory.usd.perGibPerHour' src/data/azure-pricing.json)

echo "   • Management:   \$$mgmt per ora"
echo "   • vCPU:         \$$vcpu_ded per ora"
echo "   • Memory:       \$$mem_ded per GiB/ora"

echo ""
echo "🔗 Fonte: $(jq -r '.source' src/data/azure-pricing.json)"
echo "📋 API Version: $(jq -r '.apiVersion' src/data/azure-pricing.json)"

echo ""
echo "✅ Verifica completata!"
