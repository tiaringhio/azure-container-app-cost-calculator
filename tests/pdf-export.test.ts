/**
 * Test for PDF export functionality
 * Verifies that the PDF export feature works correctly
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generatePrintableHTML, exportToPDF, type AppData, type PricingData } from '../src/lib/utils';

describe('PDF Export Functionality', () => {
  let mockOpen: any;
  let mockWindow: any;

  beforeEach(() => {
    // Mock window.open for PDF export tests
    mockWindow = {
      document: {
        write: vi.fn(),
        close: vi.fn()
      },
      focus: vi.fn(),
      print: vi.fn(),
      close: vi.fn(),
      onload: null as any
    };

    mockOpen = vi.fn(() => mockWindow);
    Object.defineProperty(global, 'window', {
      value: {
        open: mockOpen
      },
      writable: true
    });

    // Mock global alert for popup blocker test
    Object.defineProperty(global, 'alert', {
      value: vi.fn(),
      writable: true
    });

    // Mock setTimeout
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('should generate correct HTML structure for PDF', () => {
    const apps: AppData[] = [{
      name: 'Test App',
      cpu: 1,
      memory: 2,
      region: 'eastus',
      schedule: [
        [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Monday: 3 hours
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Tuesday: 0 hours
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Wednesday: 0 hours
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Thursday: 0 hours
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Friday: 0 hours
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Saturday: 0 hours
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]  // Sunday: 0 hours
      ]
    }];
    
    const pricing: PricingData = {
      vcpu: { perSecond: 0.000004 },
      memory: { perGibPerSecond: 0.000004 },
      currency: 'USD'
    };

    const html = generatePrintableHTML(apps, pricing, 'Test Estimate');
    
    // Check basic HTML structure
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html lang="en">');
    expect(html).toContain('<title>Test Estimate - Cost Estimate</title>');
    expect(html).toContain('Azure Container Apps Cost Estimate');
    
    // Check Tailwind CSS integration
    expect(html).toContain('https://cdn.tailwindcss.com');
    
    // Check print styles
    expect(html).toContain('@media print');
    expect(html).toContain('print-avoid-break');
    expect(html).toContain('print-color-adjust: exact');
  });

  it('should include app data in PDF HTML', () => {
    const apps: AppData[] = [{
      name: 'Production API',
      cpu: 2,
      memory: 4,
      region: 'westeurope',
      schedule: Array(7).fill(Array(24).fill(1)) // 24/7 operation
    }];
    
    const pricing: PricingData = {
      vcpu: { perSecond: 0.000004 },
      memory: { perGibPerSecond: 0.000004 },
      currency: 'EUR'
    };

    const html = generatePrintableHTML(apps, pricing, 'Production Estimate');
    
    // Check app details in table
    expect(html).toContain('Production API');
    expect(html).toContain('>2</td>'); // CPU
    expect(html).toContain('>4</td>'); // Memory
    expect(html).toContain('westeurope');
    expect(html).toContain('168</td>'); // Total instance hours (24*7 = 168 instances)
    expect(html).toContain('EUR'); // Currency
  });

  it('should calculate costs correctly in PDF', () => {
    const apps: AppData[] = [{
      name: 'Cost Test App',
      cpu: 1,
      memory: 2,
      region: 'eastus',
      schedule: [
        Array(24).fill(1), // Monday: 24 hours
        Array(24).fill(0), Array(24).fill(0), Array(24).fill(0),
        Array(24).fill(0), Array(24).fill(0), Array(24).fill(0)
      ]
    }];
    
    const pricing: PricingData = {
      vcpu: { perSecond: 0.000004 },
      memory: { perGibPerSecond: 0.000004 },
      currency: 'USD'
    };

    const html = generatePrintableHTML(apps, pricing, 'Cost Test');
    
    // Calculate expected costs
    const totalInstanceHours = 24; // 24 instances (1 instance per hour for 24 hours)
    const cpuCostPerHour = 1 * 0.000004 * 3600; // 0.0144
    const memoryCostPerHour = 2 * 0.000004 * 3600; // 0.0288
    const totalCpuCost = cpuCostPerHour * totalInstanceHours; // 0.3456
    const totalMemoryCost = memoryCostPerHour * totalInstanceHours; // 0.6912
    const totalCost = totalCpuCost + totalMemoryCost; // 1.0368
    
    expect(html).toContain(totalCpuCost.toFixed(2)); // CPU cost
    expect(html).toContain(totalMemoryCost.toFixed(2)); // Memory cost
    expect(html).toContain(totalCost.toFixed(2)); // Total cost
  });

  it('should handle multiple apps in PDF', () => {
    const apps: AppData[] = [
      {
        name: 'Web Frontend',
        cpu: 0.5,
        memory: 1,
        region: 'eastus',
        schedule: Array(7).fill(Array(24).fill(1)) // 24/7
      },
      {
        name: 'Background Worker',
        cpu: 1,
        memory: 2,
        region: 'eastus',
        schedule: [
          Array(24).fill(1), // Monday only
          ...Array(6).fill(Array(24).fill(0))
        ]
      }
    ];
    
    const pricing: PricingData = {
      vcpu: { perSecond: 0.000004 },
      memory: { perGibPerSecond: 0.000004 },
      currency: 'USD'
    };

    const html = generatePrintableHTML(apps, pricing, 'Multi-App Test');
    
    // Check both apps are present
    expect(html).toContain('Web Frontend');
    expect(html).toContain('Background Worker');
    
    // Check summary shows correct app count
    expect(html).toContain('>2</span>'); // Total Applications: 2
    
    // Check total calculations (Web: 168 instance hours, Worker: 24 instance hours = 192 total)
    expect(html).toContain('>192</td>'); // Total instance hours
  });

  it('should handle empty app list gracefully', () => {
    const apps: AppData[] = [];
    const pricing: PricingData = {
      vcpu: { perSecond: 0.000004 },
      memory: { perGibPerSecond: 0.000004 },
      currency: 'USD'
    };

    const html = generatePrintableHTML(apps, pricing, 'Empty Test');
    
    // Should still generate valid HTML
    expect(html).toContain('Empty Test');
    expect(html).toContain('>0</span>'); // Total Applications: 0
    expect(html).toContain('>0</td>'); // Total hours: 0
    expect(html).toContain('0.00 USD'); // Total cost: 0 with 2 decimal places
  });

  it('should include correct metadata in PDF', () => {
    const apps: AppData[] = [{
      name: 'Test App',
      cpu: 1,
      memory: 1,
      region: 'eastus',
      schedule: Array(7).fill(Array(24).fill(0))
    }];
    
    const pricing: PricingData = {
      vcpu: { perSecond: 0.000004 },
      memory: { perGibPerSecond: 0.000004 },
      currency: 'EUR'
    };

    const html = generatePrintableHTML(apps, pricing, 'Metadata Test');
    
    // Check metadata
    expect(html).toContain('Generated on');
    expect(html).toContain('Azure Container Apps Cost Calculator');
    expect(html).toContain('Pricing based on Azure official rates');
    expect(html).toContain('EUR 0.000004/vCPU/sec');
    expect(html).toContain('EUR 0.000004/GiB/sec');
  });

  it('should open print window correctly', () => {
    const apps: AppData[] = [{
      name: 'Print Test',
      cpu: 1,
      memory: 1,
      region: 'eastus',
      schedule: Array(7).fill(Array(24).fill(1))
    }];
    
    const pricing: PricingData = {
      vcpu: { perSecond: 0.000004 },
      memory: { perGibPerSecond: 0.000004 },
      currency: 'USD'
    };

    exportToPDF(apps, pricing, 'Print Test');

    // Verify window.open was called
    expect(mockOpen).toHaveBeenCalledWith('', '_blank');
    
    // Verify document.write and close were called
    expect(mockWindow.document.write).toHaveBeenCalledWith(
      expect.stringContaining('Print Test - Cost Estimate')
    );
    expect(mockWindow.document.close).toHaveBeenCalled();
  });

  it('should handle popup blocked scenario', () => {
    // Mock window.open to return null (popup blocked)
    mockOpen.mockReturnValue(null);

    const apps: AppData[] = [{
      name: 'Blocked Test',
      cpu: 1,
      memory: 1,
      region: 'eastus',
      schedule: Array(7).fill(Array(24).fill(1))
    }];
    
    const pricing: PricingData = {
      vcpu: { perSecond: 0.000004 },
      memory: { perGibPerSecond: 0.000004 },
      currency: 'USD'
    };

    exportToPDF(apps, pricing, 'Blocked Test');

    // Verify alert was called
    expect(global.alert).toHaveBeenCalledWith(
      'Pop-up blocked. Please allow pop-ups for this site to export PDF.'
    );
  });

  it('should trigger focus after content loads but not print automatically', () => {
    const apps: AppData[] = [{
      name: 'Focus Test',
      cpu: 1,
      memory: 1,
      region: 'eastus',
      schedule: Array(7).fill(Array(24).fill(1))
    }];
    
    const pricing: PricingData = {
      vcpu: { perSecond: 0.000004 },
      memory: { perGibPerSecond: 0.000004 },
      currency: 'USD'
    };

    exportToPDF(apps, pricing, 'Focus Test');

    // Simulate onload event
    expect(mockWindow.onload).toBeDefined();
    mockWindow.onload();

    // Verify focus is called but print is NOT called automatically
    expect(mockWindow.focus).toHaveBeenCalled();
    expect(mockWindow.print).not.toHaveBeenCalled();

    // Verify window does NOT close automatically
    vi.advanceTimersByTime(150);
    expect(mockWindow.close).not.toHaveBeenCalled();
  });

  it('should use default estimate name when none provided', () => {
    const apps: AppData[] = [{
      name: 'Default Name Test',
      cpu: 1,
      memory: 1,
      region: 'eastus',
      schedule: Array(7).fill(Array(24).fill(1))
    }];
    
    const pricing: PricingData = {
      vcpu: { perSecond: 0.000004 },
      memory: { perGibPerSecond: 0.000004 },
      currency: 'USD'
    };

    exportToPDF(apps, pricing);

    // Verify default name is used (the function uses "Azure Container Apps Cost Estimate" as default)
    expect(mockWindow.document.write).toHaveBeenCalledWith(
      expect.stringContaining('Azure Container Apps Cost Estimate')
    );
  });

  it('should format costs with proper precision', () => {
    const apps: AppData[] = [{
      name: 'Precision Test',
      cpu: 0.25,
      memory: 0.5,
      region: 'eastus',
      schedule: [
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 1 hour
        ...Array(6).fill(Array(24).fill(0))
      ]
    }];
    
    const pricing: PricingData = {
      vcpu: { perSecond: 0.000001 },
      memory: { perGibPerSecond: 0.000001 },
      currency: 'USD'
    };

    const html = generatePrintableHTML(apps, pricing, 'Precision Test');
    
    // Check costs are formatted to 4 decimal places
    const costMatches = html.match(/\d+\.\d{4}/g);
    expect(costMatches).toBeTruthy();
    expect(costMatches!.length).toBeGreaterThan(0);
  });

  it('should include monthly and yearly costs when provided', () => {
    const apps: AppData[] = [{
      name: 'Cost Periods Test',
      cpu: 2,
      memory: 4,
      region: 'westus',
      schedule: Array(7).fill(Array(24).fill(1))
    }];
    
    const pricing: PricingData = {
      vcpu: { perSecond: 0.000004 },
      memory: { perGibPerSecond: 0.000004 },
      currency: 'USD'
    };

    const totalCosts = {
      weeklyCost: 100.5,
      monthlyCost: 435.17,
      yearlyCost: 5226,
      totalInstances: 168,
      totalCpuHours: 336,
      totalMemoryHours: 672
    };

    const html = generatePrintableHTML(apps, pricing, 'Cost Periods Test', totalCosts);
    
    // Check that all cost periods are included
    expect(html).toContain('Weekly Total:');
    expect(html).toContain('Monthly Total:');
    expect(html).toContain('Yearly Total:');
    
    // Check specific values
    expect(html).toContain('435.17 USD'); // Monthly
    expect(html).toContain('5226 USD');    // Yearly
  });

  it('should work without total costs provided (backward compatibility)', () => {
    const apps: AppData[] = [{
      name: 'No Total Costs Test',
      cpu: 1,
      memory: 2,
      region: 'eastus',
      schedule: Array(7).fill(Array(24).fill(1))
    }];
    
    const pricing: PricingData = {
      vcpu: { perSecond: 0.000004 },
      memory: { perGibPerSecond: 0.000004 },
      currency: 'USD'
    };

    const html = generatePrintableHTML(apps, pricing, 'No Total Costs Test');
    
    // Should only contain weekly costs, not monthly/yearly
    expect(html).toContain('Weekly Total:');
    expect(html).not.toContain('Monthly Total:');
    expect(html).not.toContain('Yearly Total:');
  });

  it('should export PDF with total costs parameter', () => {
    const apps: AppData[] = [{
      name: 'PDF Total Costs Test',
      cpu: 1,
      memory: 1,
      region: 'eastus',
      schedule: Array(7).fill(Array(24).fill(1))
    }];
    
    const pricing: PricingData = {
      vcpu: { perSecond: 0.000004 },
      memory: { perGibPerSecond: 0.000004 },
      currency: 'USD'
    };

    const totalCosts = {
      weeklyCost: 50.25,
      monthlyCost: 217.58,
      yearlyCost: 2613,
      totalInstances: 168,
      totalCpuHours: 168,
      totalMemoryHours: 168
    };

    exportToPDF(apps, pricing, 'PDF Total Costs Test', totalCosts);

    // Verify window.open was called
    expect(mockOpen).toHaveBeenCalledWith('', '_blank');
    
    // Verify document.write was called and the content includes monthly/yearly costs
    expect(mockWindow.document.write).toHaveBeenCalled();
    const writtenContent = mockWindow.document.write.mock.calls[0][0];
    expect(writtenContent).toContain('Monthly Total:');
    expect(writtenContent).toContain('217.58 USD');
    expect(writtenContent).toContain('Yearly Total:');
    expect(writtenContent).toContain('2613 USD');
  });
});
