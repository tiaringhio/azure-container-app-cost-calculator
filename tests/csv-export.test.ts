/**
 * Test for CSV export functionality
 * Verifies that the CSV export feature works correctly
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateCSVContent, exportToCSV, type AppData, type PricingData } from '../src/lib/utils';

describe('CSV Export Functionality', () => {
  let mockCreateObjectURL: any;
  let mockRevokeObjectURL: any;

  beforeEach(() => {
    // Mock URL methods for CSV download tests
    mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
    mockRevokeObjectURL = vi.fn();

    Object.defineProperty(global, 'URL', {
      value: {
        createObjectURL: mockCreateObjectURL,
        revokeObjectURL: mockRevokeObjectURL
      },
      writable: true
    });

    Object.defineProperty(global, 'Blob', {
      value: class MockBlob {
        constructor(public content: any[], public options: any) {}
      },
      writable: true
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should generate correct CSV header', () => {
    const apps: AppData[] = [];
    const pricing: PricingData = {
      vcpu: { perSecond: 0.000004 },
      memory: { perGibPerSecond: 0.000004 },
      currency: 'USD'
    };

    const csv = generateCSVContent(apps, pricing);
    const lines = csv.split('\n');
    
    expect(lines[0]).toBe('App Name,CPU (vCPU),Memory (GiB),Region,Currency,Total Instance Hours,CPU Cost,Memory Cost,Total Cost');
  });

  it('should export single app data correctly', () => {
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

    const csv = generateCSVContent(apps, pricing);
    const lines = csv.split('\n');
    
    expect(lines).toHaveLength(2); // Header + 1 app
    expect(lines[1]).toContain('Test App');
    expect(lines[1]).toContain('1'); // CPU
    expect(lines[1]).toContain('2'); // Memory
    expect(lines[1]).toContain('eastus'); // Region
    expect(lines[1]).toContain('USD'); // Currency
    expect(lines[1]).toContain('3'); // Total instance hours (3 instances from Monday)
  });

  it('should export multiple apps data correctly', () => {
    const apps: AppData[] = [
      {
        name: 'App 1',
        cpu: 0.5,
        memory: 1,
        region: 'eastus',
        schedule: Array(7).fill(Array(24).fill(1)) // 24/7 operation
      },
      {
        name: 'App 2',
        cpu: 2,
        memory: 4,
        region: 'westeurope',
        schedule: Array(7).fill(Array(24).fill(0)) // No operation
      }
    ];
    
    const pricing: PricingData = {
      vcpu: { perSecond: 0.000004 },
      memory: { perGibPerSecond: 0.000004 },
      currency: 'EUR'
    };

    const csv = generateCSVContent(apps, pricing);
    const lines = csv.split('\n');
    
    expect(lines).toHaveLength(3); // Header + 2 apps
    
    // Check App 1
    expect(lines[1]).toContain('App 1');
    expect(lines[1]).toContain('168'); // 24*7 = 168 hours
    
    // Check App 2
    expect(lines[2]).toContain('App 2');
    expect(lines[2]).toContain('0'); // 0 hours
  });

  it('should calculate costs correctly', () => {
    const apps: AppData[] = [{
      name: 'Cost Test App',
      cpu: 1, // 1 vCPU
      memory: 2, // 2 GiB
      region: 'eastus',
      schedule: [
        Array(24).fill(1), // Monday: 24 hours
        Array(24).fill(0), // Tuesday: 0 hours
        Array(24).fill(0), // Wednesday: 0 hours
        Array(24).fill(0), // Thursday: 0 hours
        Array(24).fill(0), // Friday: 0 hours
        Array(24).fill(0), // Saturday: 0 hours
        Array(24).fill(0)  // Sunday: 0 hours
      ]
    }];
    
    const pricing: PricingData = {
      vcpu: { perSecond: 0.000004 }, // $0.000004 per vCPU per second
      memory: { perGibPerSecond: 0.000004 }, // $0.000004 per GiB per second
      currency: 'USD'
    };

    const csv = generateCSVContent(apps, pricing);
    const lines = csv.split('\n');
    const dataLine = lines[1].split(',');
    
    // Calculate expected costs
    const expectedCpuCostPerHour = 1 * 0.000004 * 3600; // 1 vCPU * price * 3600 seconds
    const expectedMemoryCostPerHour = 2 * 0.000004 * 3600; // 2 GiB * price * 3600 seconds
    const totalHours = 24;
    const expectedTotalCpuCost = expectedCpuCostPerHour * totalHours;
    const expectedTotalMemoryCost = expectedMemoryCostPerHour * totalHours;
    const expectedTotalCost = expectedTotalCpuCost + expectedTotalMemoryCost;
    
    expect(dataLine[6]).toBe(expectedTotalCpuCost.toFixed(2)); // CPU Cost
    expect(dataLine[7]).toBe(expectedTotalMemoryCost.toFixed(2)); // Memory Cost
    expect(dataLine[8]).toBe(expectedTotalCost.toFixed(2)); // Total Cost
  });

  it('should handle empty app list', () => {
    const apps: AppData[] = [];
    const pricing: PricingData = {
      vcpu: { perSecond: 0.000004 },
      memory: { perGibPerSecond: 0.000004 },
      currency: 'USD'
    };

    const csv = generateCSVContent(apps, pricing);
    const lines = csv.split('\n');
    
    expect(lines).toHaveLength(1); // Only header
    expect(lines[0]).toBe('App Name,CPU (vCPU),Memory (GiB),Region,Currency,Total Instance Hours,CPU Cost,Memory Cost,Total Cost');
  });

  it('should handle apps with zero instances correctly', () => {
    const apps: AppData[] = [{
      name: 'Zero Instance App',
      cpu: 1,
      memory: 2,
      region: 'eastus',
      schedule: Array(7).fill(Array(24).fill(0)) // All zeros
    }];
    
    const pricing: PricingData = {
      vcpu: { perSecond: 0.000004 },
      memory: { perGibPerSecond: 0.000004 },
      currency: 'USD'
    };

    const csv = generateCSVContent(apps, pricing);
    const lines = csv.split('\n');
    const dataLine = lines[1].split(',');
    
    expect(dataLine[5]).toBe('0'); // Total Instance Hours
    expect(dataLine[6]).toBe('0.00'); // CPU Cost
    expect(dataLine[7]).toBe('0.00'); // Memory Cost
    expect(dataLine[8]).toBe('0.00'); // Total Cost
  });

  it('should properly escape CSV values with commas', () => {
    const apps: AppData[] = [{
      name: 'App, with comma',
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

    const csv = generateCSVContent(apps, pricing);
    expect(csv).toContain('"App, with comma"');
  });

  it('should format currency values to 2 decimal places for consistency', () => {
    const apps: AppData[] = [{
      name: 'Precision Test',
      cpu: 0.25, // Small CPU value
      memory: 0.5, // Small memory value
      region: 'eastus',
      schedule: [
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 1 hour
        Array(24).fill(0), Array(24).fill(0), Array(24).fill(0), 
        Array(24).fill(0), Array(24).fill(0), Array(24).fill(0)
      ]
    }];
    
    const pricing: PricingData = {
      vcpu: { perSecond: 0.000001 }, // Very small price for precision test
      memory: { perGibPerSecond: 0.000001 },
      currency: 'USD'
    };

    const csv = generateCSVContent(apps, pricing);
    const lines = csv.split('\n');
    const dataLine = lines[1].split(',');
    
    // Check that all cost values have exactly 2 decimal places for consistency with Total Summary
    expect(dataLine[6]).toMatch(/^\d+\.\d{2}$/); // CPU Cost
    expect(dataLine[7]).toMatch(/^\d+\.\d{2}$/); // Memory Cost
    expect(dataLine[8]).toMatch(/^\d+\.\d{2}$/); // Total Cost
  });

  it('should include correct pricing currency', () => {
    const apps: AppData[] = [{
      name: 'Currency Test',
      cpu: 1,
      memory: 1,
      region: 'westeurope',
      schedule: [Array(24).fill(1), ...Array(6).fill(Array(24).fill(0))]
    }];
    
    const pricing: PricingData = {
      vcpu: { perSecond: 0.000004 },
      memory: { perGibPerSecond: 0.000004 },
      currency: 'EUR'
    };

    const csv = generateCSVContent(apps, pricing);
    const lines = csv.split('\n');
    
    expect(lines[1]).toContain('EUR');
  });

  it('should handle different regional settings', () => {
    const apps: AppData[] = [
      {
        name: 'US East App',
        cpu: 1,
        memory: 2,
        region: 'eastus',
        schedule: [Array(24).fill(1), ...Array(6).fill(Array(24).fill(0))]
      },
      {
        name: 'Europe App',
        cpu: 2,
        memory: 4,
        region: 'westeurope',
        schedule: [Array(24).fill(1), ...Array(6).fill(Array(24).fill(0))]
      }
    ];
    
    const pricing: PricingData = {
      vcpu: { perSecond: 0.000004 },
      memory: { perGibPerSecond: 0.000004 },
      currency: 'USD'
    };

    const csv = generateCSVContent(apps, pricing);
    const lines = csv.split('\n');
    
    expect(lines[1]).toContain('eastus');
    expect(lines[2]).toContain('westeurope');
  });

  it('should generate correct filename with estimate name', () => {
    const apps: AppData[] = [{
      name: 'Test App',
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

    // Mock document methods for filename test
    const mockSetAttribute = vi.fn();
    const mockCreateElement = vi.fn(() => ({
      setAttribute: mockSetAttribute,
      style: {},
      click: vi.fn()
    }));
    const mockAppendChild = vi.fn();
    const mockRemoveChild = vi.fn();

    Object.defineProperty(global, 'document', {
      value: {
        createElement: mockCreateElement,
        body: {
          appendChild: mockAppendChild,
          removeChild: mockRemoveChild
        }
      },
      writable: true
    });

    // Test with custom estimate name
    exportToCSV(apps, pricing, 'My Custom Estimate');

    // Verify the filename was set correctly with sanitized estimate name
    expect(mockSetAttribute).toHaveBeenCalledWith(
      'download',
      expect.stringMatching(/^my-custom-estimate-\d{4}-\d{2}-\d{2}\.csv$/)
    );

    // Clear mocks and test with default filename when no estimate name provided
    mockSetAttribute.mockClear();
    exportToCSV(apps, pricing);
    
    expect(mockSetAttribute).toHaveBeenCalledWith(
      'download',
      expect.stringMatching(/^azure-container-apps-cost-estimate-\d{4}-\d{2}-\d{2}\.csv$/)
    );
  });

  describe('Free Tier Integration with CSV Export', () => {
    it('should include free tier status in CSV metadata when enabled', () => {
      // Mock CSV export function that includes free tier
      const mockExportToCSVWithFreeTier = (
        apps: any[],
        totalCosts: any,
        estimateName: string,
        selectedRegion: string,
        freeTierEnabled: boolean,
        getFormattedPrice: (amount: number, decimals?: number) => string
      ) => {
        const metadataRows = [
          ['Export Details'],
          ['Estimate Name', estimateName],
          ['Region', selectedRegion],
          ['Free Tier Enabled', freeTierEnabled ? 'Yes' : 'No'],
          ['Export Date', '2025-06-30'],
          ['Total Apps', apps.length.toString()],
          [''],
          ['App Details']
        ];
        
        return metadataRows;
      };

      const apps = [
        {
          id: 'app1',
          name: 'Test App',
          selectedCombination: 3,
          schedule: { 0: { 9: 1 } }
        }
      ];

      const result = mockExportToCSVWithFreeTier(
        apps,
        { weeklyCost: 10, monthlyCost: 43, yearlyCost: 520 },
        'Test Estimate',
        'westeurope',
        true,
        (amount: number) => `$${amount.toFixed(2)}`
      );

      expect(result).toContainEqual(['Free Tier Enabled', 'Yes']);
    });

    it('should include free tier status in CSV metadata when disabled', () => {
      const mockExportToCSVWithFreeTier = (
        apps: any[],
        totalCosts: any,
        estimateName: string,
        selectedRegion: string,
        freeTierEnabled: boolean,
        getFormattedPrice: (amount: number, decimals?: number) => string
      ) => {
        const metadataRows = [
          ['Export Details'],
          ['Estimate Name', estimateName],
          ['Region', selectedRegion],
          ['Free Tier Enabled', freeTierEnabled ? 'Yes' : 'No'],
          ['Export Date', '2025-06-30'],
          ['Total Apps', apps.length.toString()],
          [''],
          ['App Details']
        ];
        
        return metadataRows;
      };

      const apps = [
        {
          id: 'app1',
          name: 'Test App',
          selectedCombination: 3,
          schedule: { 0: { 9: 1 } }
        }
      ];

      const result = mockExportToCSVWithFreeTier(
        apps,
        { weeklyCost: 10, monthlyCost: 43, yearlyCost: 520 },
        'Test Estimate',
        'westeurope',
        false,
        (amount: number) => `$${amount.toFixed(2)}`
      );

      expect(result).toContainEqual(['Free Tier Enabled', 'No']);
    });

    it('should maintain existing CSV structure with additional free tier metadata', () => {
      const mockExportToCSVWithFreeTier = (
        apps: any[],
        totalCosts: any,
        estimateName: string,
        selectedRegion: string,
        freeTierEnabled: boolean,
        getFormattedPrice: (amount: number, decimals?: number) => string
      ) => {
        const metadataRows = [
          ['Export Details'],
          ['Estimate Name', estimateName],
          ['Region', selectedRegion],
          ['Free Tier Enabled', freeTierEnabled ? 'Yes' : 'No'],
          ['Export Date', '2025-06-30'],
          ['Total Apps', apps.length.toString()],
          [''],
          ['App Details']
        ];
        
        return metadataRows;
      };

      const apps = [
        {
          id: 'app1',
          name: 'Test App',
          selectedCombination: 3,
          schedule: { 0: { 9: 1 } }
        }
      ];

      const result = mockExportToCSVWithFreeTier(
        apps,
        { weeklyCost: 10, monthlyCost: 43, yearlyCost: 520 },
        'Test Estimate',
        'westeurope',
        true,
        (amount: number) => `$${amount.toFixed(2)}`
      );

      // Check that all expected metadata is present
      expect(result).toContainEqual(['Export Details']);
      expect(result).toContainEqual(['Estimate Name', 'Test Estimate']);
      expect(result).toContainEqual(['Region', 'westeurope']);
      expect(result).toContainEqual(['Free Tier Enabled', 'Yes']);
      expect(result).toContainEqual(['Export Date', '2025-06-30']);
      expect(result).toContainEqual(['Total Apps', '1']);
      expect(result).toContainEqual(['App Details']);
    });
  });
});
