// Simple test to verify pricing system
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load pricing data
const pricingDataPath = path.join(__dirname, 'src', 'data', 'azure-pricing.json');
const pricingData = JSON.parse(fs.readFileSync(pricingDataPath, 'utf8'));

console.log('✅ Pricing Data Loaded Successfully');
console.log('📅 Last Updated:', pricingData.lastUpdated);
console.log('🔗 Source:', pricingData.source);
console.log('💰 Base vCPU Price (USD/hour):', pricingData.consumptionPlan.activeUsage.pricing.vcpu.usd.perHour);
console.log('💾 Base Memory Price (USD/GB/hour):', pricingData.consumptionPlan.activeUsage.pricing.memory.usd.perGbPerHour);
console.log('🌍 Available Regions:', Object.keys(pricingData.regions).length);
console.log('💱 Supported Currencies:', Object.keys(pricingData.currencies).map(curr => `${curr} (${pricingData.currencies[curr].symbol})`).join(', '));

// Test region pricing calculation
const westEuropeData = pricingData.regions.westeurope;
const eurCurrency = pricingData.currencies.EUR;
console.log('\n🇪🇺 West Europe Example:');
console.log('  Region:', westEuropeData.name);
console.log('  Currency:', westEuropeData.currency);
console.log('  Multiplier:', westEuropeData.multiplier);
console.log('  Currency Symbol:', eurCurrency.symbol);

// Test conversion (1 vCPU in West Europe)
const baseVcpuPrice = pricingData.consumptionPlan.activeUsage.pricing.vcpu.usd.perHour;
const regionMultiplier = westEuropeData.multiplier;
const eurRate = eurCurrency.rates ? eurCurrency.rates.USD || 0.85 : 0.85; // fallback rate

const priceInRegion = baseVcpuPrice * regionMultiplier;
const priceInEur = priceInRegion * eurRate;

console.log(`  1 vCPU Price: ${eurCurrency.symbol}${priceInEur.toFixed(4)}/hour`);

console.log('\n✅ Pricing system verification complete!');
