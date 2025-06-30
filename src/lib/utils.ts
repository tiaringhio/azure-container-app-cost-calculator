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
    "App Name,CPU (vCPU),Memory (GiB),Region,Currency,Total Hours,CPU Cost,Memory Cost,Total Cost";

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
    "App Name,CPU (vCPU),Memory (GiB),Region,Currency,Total Hours,CPU Cost,Memory Cost,Total Cost";

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

  return [csvHeader, ...csvRows].join("\n");
}
