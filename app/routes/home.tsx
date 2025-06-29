import React from 'react';
import type { MetaFunction } from 'react-router';
import { useCalculator } from '../hooks/useCalculator';
import { ResourceConfiguration } from '../components/calculator/ResourceConfiguration';
import { Calculator, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export const meta: MetaFunction = () => {
  return [
    { title: "Calcolatore Costi Azure Container Apps" },
    { name: "description", content: "Calcola i costi per le tue applicazioni containerizzate su Azure Container Apps" },
  ];
};

export default function Home() {
  const {
    state,
    updateCombination,
    updateRegion,
    updateSchedule,
    setSchedulePreset,
    addStep,
    removeStep,
    updateStep,
    applySteps,
    calculateCosts,
    getCurrentCombination,
    getCurrentCost
  } = useCalculator();

  const costResults = calculateCosts();
  const currentCost = getCurrentCost();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
              <Calculator className="h-10 w-10" />
              Calcolatore Costi Azure Container Apps
            </h1>
            <p className="text-blue-100 text-lg">
              Calcola i costi per le tue applicazioni containerizzate su Azure
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Resource Configuration */}
        <ResourceConfiguration
          selectedCombination={state.selectedCombination}
          selectedRegion={state.selectedRegion}
          currentCost={currentCost}
          onCombinationChange={updateCombination}
          onRegionChange={updateRegion}
        />

        {/* Cost Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Stima Costi
            </CardTitle>
            <CardDescription>
              Panoramica dei costi stimati per la configurazione selezionata
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <h3 className="text-sm text-green-600 mb-1">Costo Orario/Istanza</h3>
                <div className="text-2xl font-bold text-green-700">
                  €{costResults.totalCostPerInstancePerHour.toFixed(4)}
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <h3 className="text-sm text-blue-600 mb-1">💰 Costo Settimanale</h3>
                <div className="text-2xl font-bold text-blue-700">
                  €{costResults.weeklyCost.toFixed(2)}
                </div>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                <h3 className="text-sm text-purple-600 mb-1">💰 Costo Mensile</h3>
                <div className="text-2xl font-bold text-purple-700">
                  €{costResults.monthlyCost.toFixed(2)}
                </div>
              </div>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                <h3 className="text-sm text-orange-600 mb-1">💰 Costo Annuale</h3>
                <div className="text-2xl font-bold text-orange-700">
                  €{costResults.yearlyCost.toFixed(2)}
                </div>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <h3 className="text-sm text-gray-600 mb-1">Ore Istanze Attive/Settimana</h3>
                <div className="text-2xl font-bold text-gray-700">
                  {costResults.totalActiveInstanceHours}
                </div>
              </div>
              
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 text-center">
                <h3 className="text-sm text-teal-600 mb-1">Efficienza Utilizzo</h3>
                <div className="text-2xl font-bold text-teal-700">
                  {costResults.efficiencyPercentage.toFixed(1)}%
                </div>
              </div>
              
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center">
                <h3 className="text-sm text-indigo-600 mb-1">Slot Attivi/Settimana</h3>
                <div className="text-2xl font-bold text-indigo-700">
                  {costResults.activeSlots}/168
                </div>
              </div>
              
              <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 text-center">
                <h3 className="text-sm text-pink-600 mb-1">Picco Istanze</h3>
                <div className="text-2xl font-bold text-pink-700">
                  {costResults.maxInstances}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Note */}
        <Card className="bg-amber-50 border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-800">📋 Note sui Prezzi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-amber-800">
              <p className="font-semibold mb-3">Prezzi Ufficiali Azure Container Apps (2025):</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="font-semibold">vCPU:</span>
                  <span>€0.0000301 per secondo (€0.10836 per ora) - solo quando attiva</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">Memoria:</span>
                  <span>€0.0000036 per GiB per secondo (€0.01296 per GB per ora) - solo quando attiva</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">0 istanze = €0.00 costi:</span>
                  <span>Container Apps scala perfettamente a zero</span>
                </li>
                <li>Una replica è considerata attiva quando vCPU > 0.01 cores o data received > 1,000 bytes/sec</li>
                <li>I prezzi variano per regione (US East e Central US ~5% più economici)</li>
                <li>Calcoli basati su Container Apps Consumption plan</li>
                <li>Non include costi di networking, storage esterni o altri servizi Azure</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
