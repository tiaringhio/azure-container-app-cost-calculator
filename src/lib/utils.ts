import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface AppData {
  name: string;
  cpu: number;
  memory: number;
  region: string;
  schedule: number[][];
}

export interface PricingData {
  vcpu: { perSecond: number };
  memory: { perGibPerSecond: number };
  currency: string;
}

export function exportToCSV(apps: AppData[], pricing: PricingData, estimateName?: string): void {
  const csvHeader =
    "App Name,CPU (vCPU),Memory (GiB),Region,Currency,Total Instance Hours,CPU Cost,Memory Cost,Total Cost";

  const csvRows = apps.map((app) => {
    const totalHours = app.schedule.reduce(
      (sum: number, daySchedule: number[]) =>
        sum +
        daySchedule.reduce(
          (daySum: number, instances: number) => daySum + (instances > 0 ? 1 : 0),
          0
        ),
      0
    );

    const cpuCostPerHour = app.cpu * pricing.vcpu.perSecond * 3600;
    const memoryCostPerHour = app.memory * pricing.memory.perGibPerSecond * 3600;
    const totalCpuCost = cpuCostPerHour * totalHours;
    const totalMemoryCost = memoryCostPerHour * totalHours;
    const totalCost = totalCpuCost + totalMemoryCost;

    // Escape commas in app name by wrapping in quotes if needed
    const escapedName = app.name.includes(",") ? `"${app.name}"` : app.name;

    return [
      escapedName,
      app.cpu.toString(),
      app.memory.toString(),
      app.region,
      pricing.currency,
      totalHours.toString(),
      totalCpuCost.toFixed(4),
      totalMemoryCost.toFixed(4),
      totalCost.toFixed(4),
    ].join(",");
  });

  const csvContent = [csvHeader, ...csvRows].join("\n");

  // Create and download the CSV file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  // Create filename based on estimate name or use default
  const sanitizedEstimateName = estimateName 
    ? estimateName.replace(/[^a-z0-9]/gi, '-').toLowerCase()
    : 'azure-container-apps-cost-estimate';
  
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${sanitizedEstimateName}-${timestamp}.csv`;

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

// Helper function to generate CSV content without triggering download (for testing)
export function generateCSVContent(apps: AppData[], pricing: PricingData): string {
  const csvHeader =
    "App Name,CPU (vCPU),Memory (GiB),Region,Currency,Total Instance Hours,CPU Cost,Memory Cost,Total Cost";

  const csvRows = apps.map((app) => {
    const totalActiveInstanceHours = app.schedule.reduce(
      (sum: number, daySchedule: number[]) =>
        sum +
        daySchedule.reduce(
          (daySum: number, instances: number) => daySum + instances,
          0
        ),
      0
    );

    const cpuCostPerHour = app.cpu * pricing.vcpu.perSecond * 3600;
    const memoryCostPerHour = app.memory * pricing.memory.perGibPerSecond * 3600;
    const totalCpuCost = cpuCostPerHour * totalActiveInstanceHours;
    const totalMemoryCost = memoryCostPerHour * totalActiveInstanceHours;
    const totalCost = totalCpuCost + totalMemoryCost;

    // Escape commas in app name by wrapping in quotes if needed
    const escapedName = app.name.includes(",") ? `"${app.name}"` : app.name;

    return [
      escapedName,
      app.cpu.toString(),
      app.memory.toString(),
      app.region,
      pricing.currency,
      totalActiveInstanceHours.toString(),
      totalCpuCost.toFixed(2),
      totalMemoryCost.toFixed(2),
      totalCost.toFixed(2),
    ].join(",");
  });

  return [csvHeader, ...csvRows].join("\n");
}

// PDF Export functionality using Tailwind print classes
export function exportToPDF(
  apps: AppData[], 
  pricing: PricingData, 
  estimateName?: string,
  freeTierEnabled?: boolean,
  totalCosts?: {
    weeklyCost: number;
    monthlyCost: number;
    yearlyCost: number;
    totalInstances: number;
    totalCpuHours: number;
    totalMemoryHours: number;
  }
): void {
  const sanitizedEstimateName = estimateName 
    ? estimateName.replace(/[^a-z0-9]/gi, '-').toLowerCase()
    : 'azure-container-apps-cost-estimate';

  // Create a new window for consultation (not printing)
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Pop-up blocked. Please allow pop-ups for this site to export PDF.');
    return;
  }

  // Generate the print-friendly HTML content
  const printContent = generatePrintableHTML(
    apps, 
    pricing, 
    estimateName || 'Azure Container Apps Cost Estimate',
    freeTierEnabled || false,
    totalCosts
  );
  
  printWindow.document.write(printContent);
  printWindow.document.close();
  
  // Set focus for user interaction but don't trigger print automatically
  printWindow.onload = () => {
    printWindow.focus();
    // User can manually print using Ctrl+P / Cmd+P if needed
  };
}

// Generate print-friendly HTML content
export function generatePrintableHTML(
  apps: AppData[], 
  pricing: PricingData, 
  estimateName: string,
  freeTierEnabled: boolean,
  totalCosts?: {
    weeklyCost: number;
    monthlyCost: number;
    yearlyCost: number;
    totalInstances: number;
    totalCpuHours: number;
    totalMemoryHours: number;
  }
): string {
  const timestamp = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toLocaleString();
  
  // Calculate totals
  const totalStats = apps.reduce((acc, app) => {
    // Calculate total active instance hours (sum of all instances across all time slots)
    const totalActiveInstanceHours = app.schedule.reduce(
      (sum: number, daySchedule: number[]) =>
        sum + daySchedule.reduce(
          (daySum: number, instances: number) => daySum + instances,
          0
        ),
      0
    );
    
    const cpuCostPerHour = app.cpu * pricing.vcpu.perSecond * 3600;
    const memoryCostPerHour = app.memory * pricing.memory.perGibPerSecond * 3600;
    const totalCpuCost = cpuCostPerHour * totalActiveInstanceHours;
    const totalMemoryCost = memoryCostPerHour * totalActiveInstanceHours;
    const totalCost = totalCpuCost + totalMemoryCost;
    
    return {
      totalActiveInstanceHours: acc.totalActiveInstanceHours + totalActiveInstanceHours,
      totalCpuCost: acc.totalCpuCost + totalCpuCost,
      totalMemoryCost: acc.totalMemoryCost + totalMemoryCost,
      totalCost: acc.totalCost + totalCost,
      appCount: acc.appCount + 1
    };
  }, {
    totalActiveInstanceHours: 0,
    totalCpuCost: 0,
    totalMemoryCost: 0,
    totalCost: 0,
    appCount: 0
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${estimateName} - Cost Estimate</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @media print {
      .no-print { display: none !important; }
      .print-break { page-break-after: always; }
      .print-avoid-break { page-break-inside: avoid; }
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    }
    @page {
      margin: 1in;
      size: A4;
    }
  </style>
</head>
<body class="bg-white text-gray-900 print:bg-white print:text-black">
  <div class="max-w-full mx-auto p-6 print:p-0">
    <!-- Header -->
    <div class="print-avoid-break mb-8">
      <div class="text-center border-b-2 border-blue-600 pb-4 mb-6">
        <h1 class="text-3xl font-bold text-blue-600 mb-2">${estimateName}</h1>
        <h2 class="text-xl text-gray-600">Azure Container Apps Cost Estimate</h2>
        <p class="text-sm text-gray-500 mt-2">Generated on ${currentTime}</p>
      </div>
      
      <!-- Summary Section -->
      <div class="grid grid-cols-2 gap-6 mb-8">
        <div class="bg-blue-50 print:bg-gray-100 p-4 rounded-lg print-avoid-break">
          <h3 class="text-lg font-semibold text-blue-800 mb-3">Estimate Summary</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span>Total Applications:</span>
              <span class="font-semibold">${totalStats.appCount}</span>
            </div>
            <div class="flex justify-between">
              <span>Total Instance Hours:</span>
              <span class="font-semibold">${totalStats.totalActiveInstanceHours.toLocaleString()} hours</span>
            </div>
            <div class="flex justify-between">
              <span>Currency:</span>
              <span class="font-semibold">${pricing.currency}</span>
            </div>
            <div class="flex justify-between">
              <span>Azure Free Tier:</span>
              <span class="font-semibold ${freeTierEnabled ? 'text-green-600' : 'text-gray-600'}">${freeTierEnabled ? '✓ Enabled' : '✗ Disabled'}</span>
            </div>
          </div>
        </div>
        
        <div class="bg-green-50 print:bg-gray-100 p-4 rounded-lg print-avoid-break">
          <h3 class="text-lg font-semibold text-green-800 mb-3">Cost Breakdown</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span>CPU Costs (Weekly):</span>
              <span class="font-semibold">${totalStats.totalCpuCost.toFixed(2)} ${pricing.currency}</span>
            </div>
            <div class="flex justify-between">
              <span>Memory Costs (Weekly):</span>
              <span class="font-semibold">${totalStats.totalMemoryCost.toFixed(2)} ${pricing.currency}</span>
            </div>
            <div class="flex justify-between border-t pt-2 font-bold">
              <span>Weekly Total:</span>
              <span class="text-green-600">${totalStats.totalCost.toFixed(2)} ${pricing.currency}</span>
            </div>
            ${totalCosts ? `
            <div class="flex justify-between">
              <span>Monthly Total:</span>
              <span class="font-bold text-green-600">${totalCosts.monthlyCost.toFixed(2)} ${pricing.currency}</span>
            </div>
            <div class="flex justify-between border-b pb-2">
              <span>Yearly Total:</span>
              <span class="font-bold text-green-600">${totalCosts.yearlyCost.toFixed(0)} ${pricing.currency}</span>
            </div>
            ` : ''}
          </div>
        </div>
      </div>
    </div>

    <!-- Applications Table -->
    <div class="print-avoid-break">
      <h3 class="text-xl font-semibold mb-4 text-gray-800">Application Details</h3>
      <div class="overflow-hidden border border-gray-300 rounded-lg">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 print:bg-gray-200">
            <tr>
              <th class="px-4 py-3 text-left font-semibold">App Name</th>
              <th class="px-4 py-3 text-center font-semibold">CPU (vCPU)</th>
              <th class="px-4 py-3 text-center font-semibold">Memory (GiB)</th>
              <th class="px-4 py-3 text-center font-semibold">Region</th>
              <th class="px-4 py-3 text-center font-semibold">Instance Hours</th>
              <th class="px-4 py-3 text-right font-semibold">CPU Cost</th>
              <th class="px-4 py-3 text-right font-semibold">Memory Cost</th>
              <th class="px-4 py-3 text-right font-semibold">Total Cost</th>
            </tr>
          </thead>
          <tbody>
            ${apps.map((app, index) => {
              const totalActiveInstanceHours = app.schedule.reduce(
                (sum: number, daySchedule: number[]) =>
                  sum + daySchedule.reduce(
                    (daySum: number, instances: number) => daySum + instances,
                    0
                  ),
                0
              );
              
              const cpuCostPerHour = app.cpu * pricing.vcpu.perSecond * 3600;
              const memoryCostPerHour = app.memory * pricing.memory.perGibPerSecond * 3600;
              const totalCpuCost = cpuCostPerHour * totalActiveInstanceHours;
              const totalMemoryCost = memoryCostPerHour * totalActiveInstanceHours;
              const totalCost = totalCpuCost + totalMemoryCost;
              
              return `
                <tr class="${index % 2 === 0 ? 'bg-white' : 'bg-gray-50 print:bg-gray-100'}">
                  <td class="px-4 py-3 font-medium">${app.name}</td>
                  <td class="px-4 py-3 text-center">${app.cpu}</td>
                  <td class="px-4 py-3 text-center">${app.memory}</td>
                  <td class="px-4 py-3 text-center">${app.region}</td>
                  <td class="px-4 py-3 text-center">${totalActiveInstanceHours}</td>
                  <td class="px-4 py-3 text-right">${totalCpuCost.toFixed(2)}</td>
                  <td class="px-4 py-3 text-right">${totalMemoryCost.toFixed(2)}</td>
                  <td class="px-4 py-3 text-right font-semibold">${totalCost.toFixed(2)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
          <tfoot class="bg-blue-50 print:bg-gray-200 font-bold">
            <tr>
              <td class="px-4 py-3" colspan="4">TOTAL</td>
              <td class="px-4 py-3 text-center">${totalStats.totalActiveInstanceHours}</td>
              <td class="px-4 py-3 text-right">${totalStats.totalCpuCost.toFixed(2)}</td>
              <td class="px-4 py-3 text-right">${totalStats.totalMemoryCost.toFixed(2)}</td>
              <td class="px-4 py-3 text-right text-lg">${totalStats.totalCost.toFixed(2)} ${pricing.currency}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Footer -->
    <div class="mt-8 pt-4 border-t border-gray-300 text-center print-avoid-break">
      <p class="text-xs text-gray-500">
        Generated by Azure Container Apps Cost Calculator on ${timestamp}<br>
        Pricing based on Azure official rates - ${pricing.currency} ${pricing.vcpu.perSecond.toFixed(6)}/vCPU/sec, ${pricing.currency} ${pricing.memory.perGibPerSecond.toFixed(6)}/GiB/sec
      </p>
    </div>
  </div>
</body>
</html>`;
}
