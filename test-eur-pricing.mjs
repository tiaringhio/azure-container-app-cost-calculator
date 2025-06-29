// Script di test per verificare prezzi EUR
import { readFileSync } from 'fs';

// Carica il file JSON direttamente
const azurePricingData = JSON.parse(readFileSync('./src/data/azure-pricing.json', 'utf8'));

console.log('=== TEST PREZZI EUR AGGIORNATI ===\n');

// Test 1: Verifica prezzi EUR nel file JSON
console.log('1. Prezzi EUR nel file JSON:');
console.log('   Active Usage - vCPU:', azurePricingData.consumptionPlan.activeUsage.pricing.vcpu.eur.perSecond, '€/sec');
console.log('   Active Usage - Memory:', azurePricingData.consumptionPlan.activeUsage.pricing.memory.eur.perSecond, '€/sec');
console.log('   Idle Usage - vCPU:', azurePricingData.consumptionPlan.idleUsage.pricing.vcpu.eur.perSecond, '€/sec');
console.log('   Idle Usage - Memory:', azurePricingData.consumptionPlan.idleUsage.pricing.memory.eur.perSecond, '€/sec');

// Test 2: Verifica simbolo valuta per regioni EUR
console.log('\n2. Simbolo valuta per regioni EUR:');
const eurRegions = Object.entries(azurePricingData.regions)
  .filter(([_, region]) => region.currency === 'EUR')
  .map(([key, region]) => ({ key, name: region.name }));

console.log('   Regioni EUR trovate:', eurRegions.length);
eurRegions.forEach(region => {
  console.log(`   - ${region.key}: ${region.name}`);
});

// Test 3: Verifica che i prezzi corrispondano ai valori richiesti
console.log('\n4. Verifica conformità ai valori richiesti:');
const expectedVcpuEur = 0.0000301;
const expectedMemoryEur = 0.0000036;

console.log('   ✓ vCPU active usage (expected:', expectedVcpuEur, ', actual:', azurePricingData.consumptionPlan.activeUsage.pricing.vcpu.eur.perSecond, ')');
console.log('   ✓ Memory active usage (expected:', expectedMemoryEur, ', actual:', azurePricingData.consumptionPlan.activeUsage.pricing.memory.eur.perSecond, ')');
console.log('   ✓ vCPU idle usage (expected:', expectedVcpuEur, ', actual:', azurePricingData.consumptionPlan.idleUsage.pricing.vcpu.eur.perSecond, ')');
console.log('   ✓ Memory idle usage (expected:', expectedMemoryEur, ', actual:', azurePricingData.consumptionPlan.idleUsage.pricing.memory.eur.perSecond, ')');

const allMatch = 
  azurePricingData.consumptionPlan.activeUsage.pricing.vcpu.eur.perSecond === expectedVcpuEur &&
  azurePricingData.consumptionPlan.activeUsage.pricing.memory.eur.perSecond === expectedMemoryEur &&
  azurePricingData.consumptionPlan.idleUsage.pricing.vcpu.eur.perSecond === expectedVcpuEur &&
  azurePricingData.consumptionPlan.idleUsage.pricing.memory.eur.perSecond === expectedMemoryEur;

console.log('\n✅ Tutti i prezzi EUR sono aggiornati correttamente:', allMatch);
