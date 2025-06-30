# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.7] - 2025-06-30

### ✨ Azure Free Tier Support
- **Free Tier Toggle**: Added toggle switch in Region & Currency panel to enable/disable Azure Free Tier calculations
- **Visual Indicators**: Free tier status badges in Total Summary, Cost Breakdown, CSV, and PDF exports
- **Accurate Free Allowances**: Implements official Azure Container Apps free tier limits:
  - 180,000 vCPU-seconds per month
  - 360,000 memory GiB-seconds per month  
  - 2,000,000 requests per month (for future request tracking)
- **Smart Cost Calculations**: When enabled, automatically applies free allowances to reduce costs for usage within limits
- **Multi-App Support**: Free tier calculations work across all apps in multi-app scenarios
- **Real-time Updates**: Toggle immediately recalculates all costs without page refresh

### 🎯 Free Tier Logic
- Monthly usage calculation with proper conversion from weekly schedules
- Proportional cost reduction based on billable vs. total usage
- Handles edge cases where usage exceeds free tier limits
- Maintains calculation accuracy while providing significant cost savings for small workloads

### 🧪 Comprehensive Testing
- **15 new tests** covering:
  - Free tier enabled/disabled scenarios (7 tests)
  - CSV export with free tier indicators (3 tests)
  - PDF export with free tier status (5 tests)
- All 94 tests passing (up from 86 tests)
- Added test coverage for free tier toggle functionality
- Enhanced CSV and PDF export test suites with free tier integration

### 🎨 UI/UX Improvements
- **Modern Toggle Design**: Beautiful switch component using shadcn/ui with blue accent styling
- **Clear Visual Indicators**: Toggle shows current state with helpful description text
- **Free Tier Badges**: Visual indicators in Total Summary and Cost Breakdown components
- **Export Indicators**: Free tier status included in CSV metadata and PDF summary sections
- **Integrated Panel**: Seamlessly integrated into existing Region & Currency card
- **Responsive Design**: Works perfectly on mobile and desktop devices

### 🔧 Technical Implementation
- Enhanced `calculateAppCosts` function with optional `freeTierEnabled` parameter
- Updated state management in `useMultiApp` hook with `freeTierEnabled` property
- Added `updateFreeTier` function for state updates
- Modified cost calculation logic to handle free tier allowances
- Updated RegionSelector component with new toggle props
- Enhanced CSV export with free tier metadata inclusion
- Updated PDF export functions with free tier status indicators
- Comprehensive TypeScript support for all new features
- Backward compatibility with existing saved states

### 📚 Documentation
- Updated README.md with free tier feature documentation
- Added free tier information to pricing section
- Enhanced test coverage documentation
- Updated feature list to highlight free tier support

---

## [1.0.6] - 2025-06-30

### ✨ Enhanced PDF Export
- **Complete cost periods**: PDF exports now include weekly, monthly, and yearly costs to match Total Summary display
- **Consultation mode**: PDF exports open in new tab for consultation instead of forcing immediate print
- Users can manually print using Ctrl+P / Cmd+P when needed
- Enhanced cost breakdown section with comprehensive time period display

### 🎨 PDF Improvements  
- Professional cost summary with all three time periods (weekly, monthly, yearly)
- Improved layout with clearly labeled cost periods
- Better user experience with consultation-first approach
- Maintains print-optimized styling for when users choose to print

### 🔄 Currency Formatting Consistency
- **Unified decimal precision**: All costs now use 2 decimal places to match Total Summary
- Applied to both PDF and CSV exports for consistency
- Removed legacy 4-decimal formatting in favor of user-friendly 2-decimal display
- Enhanced readability while maintaining calculation accuracy

### 🧪 Testing
- Updated PDF export test suite (17 total tests) to reflect new behavior
- Added specific tests for monthly/yearly cost inclusion
- Backward compatibility tests for optional total costs parameter
- Verified new consultation behavior (focus without auto-print)
- Updated CSV tests for 2-decimal precision consistency
- All 79 tests passing with enhanced PDF functionality

### 🔧 Technical
- Enhanced `exportToPDF()` and `generatePrintableHTML()` functions with optional total costs parameter
- Improved cost breakdown HTML generation with conditional monthly/yearly display
- Removed automatic print dialog triggering for better user experience
- Updated currency formatting from `.toFixed(4)` to `.toFixed(2)` across exports
- Maintained all existing functionality while adding new features

---

## [1.0.5] - 2025-06-30

### ✨ New Features
- **PDF Export**: Added comprehensive PDF export functionality with print-optimized layout
- PDF exports use Tailwind print classes for professional document formatting
- Print-friendly design with proper page breaks and A4 sizing
- Includes complete estimate summary, cost breakdown, and application details table
- Professional styling with company branding and metadata
- Popup blocking detection with user-friendly error messaging
- Automatic print dialog trigger after content loading

### 🎨 UI/UX Enhancements
- Added new "Export as PDF" button alongside existing CSV export
- Enhanced export section with improved button styling and icons
- Green-colored PDF button to distinguish from CSV export
- FileText icon for PDF exports, Download icon for CSV exports

### 🧪 Testing
- Added comprehensive PDF export test suite (11 new tests)
- Tests cover HTML generation, print styling, cost calculations, and window management
- Validates popup blocking scenarios and print dialog triggering
- Ensures proper handling of empty data and multiple applications
- All 76 tests passing with new PDF export functionality

### 🔧 Technical Implementation
- Created `exportToPDF()` and `generatePrintableHTML()` utility functions
- Integrated with existing multi-app state management
- Proper data conversion from ContainerApp format to export format
- Responsive table design with alternating row colors for readability
- Print-specific CSS with `@media print` rules and color adjustment

## [1.0.4] - 2025-06-30

### ✨ Enhanced
- **CSV Export**: Enhanced CSV export functionality with custom filename support
- CSV files now use estimate names as filename base (e.g., "my-project-2025-06-30.csv")
- Added filename sanitization for file system compatibility
- Graceful fallback to default filename when no estimate name provided
- Enhanced test coverage with filename generation validation (65 total tests)

### 🧪 Testing
- Added comprehensive filename generation tests
- Validated filename sanitization and special character handling
- Verified backward compatibility for default filenames
- All 65 tests passing with new CSV filename functionality

## [1.0.3] - 2025-06-30

### 📚 Documentation
- **MAJOR**: Translated all documentation from Italian to English
- Complete README.md rewrite with comprehensive feature descriptions
- Translated CHANGELOG.md entries to English
- Added detailed testing documentation (54 tests coverage)
- Improved technical architecture documentation
- Enhanced installation and development guidelines
- Added roadmap and contribution guidelines
- Included use cases for developers, DevOps, and business teams
- Added professional badges and repository presentation

## [1.0.2] - 2025-06-30

### 🐛 Fixed
- **CRITICAL**: Resolved CI build errors due to Vite/Vitest dependency conflicts
- Synchronized package-lock.json with package.json for `npm ci` compatibility
- Updated devDependencies for compatibility:
  - Vitest: 3.2.4 → 1.6.0 (compatible with Vite 4.x)
  - @vitest/ui: 3.2.4 → 1.6.0
  - jsdom: 26.1.0 → 24.1.0
  - @vitejs/plugin-react: updated to 4.3.1
- Vitest configuration: removed `globals: true`, set `environment: 'jsdom'`

## [1.0.1] - 2025-06-30

### 🐛 Fixed
- **CRITICAL**: Fixed memory price from 0.000003 to 0.000004 USD/GiB/sec for Azure portal alignment
- Removed all references to legacy memory price (3E-06) in raw data
- Corrected cost calculations to reflect official Azure Container Apps pricing

### ✨ Added
- Complete test suite with Vitest (54 tests)
  - Pricing data validation tests (`pricing-data.test.ts`)
  - Conversion function tests (`pricing-functions.test.ts`) 
  - End-to-end integration tests (`integration.test.ts`)
  - Regression tests (`regression.test.ts`)
- Vitest configuration with npm scripts
- Complete test documentation in `tests/README.md`
- Test results report in `tests/TEST_RESULTS.md`

### 🔧 Changed
- Updated `package.json` with test scripts: `test`, `test:run`, `test:ui`, `test:coverage`
- Configured `vitest.config.ts` for test environment
- Improved JSON data structure with source documentation

### 📚 Documentation
- Added detailed comments in test files
- Complete test coverage documentation (pricing, conversions, regressions)
- Guides for test execution and debugging

### 🧪 Testing
- **54 tests** validating:
  - Correct Azure portal pricing
  - Currency conversions (25+ supported currencies)
  - Region support (55+ Azure regions)
  - Realistic cost calculations
  - Free tier allowances
  - Backwards compatibility
  - Data integrity

### ⚡ Performance
- No performance impact (data correction only)
- Tests executed in <500ms

### 🔒 Security
- No security impact

---

## [1.0.0] - 2025-06-30

### 🐛 Fixed
- Fixed Total Summary calculations reactivity for real-time updates (commit d94fcb6)

### 🔧 Changed  
- Improved Total Summary display even with single app (commit d41c3f6)

---

## [0.6.0] - 2025-06-30

### ✨ Added
- **Dynamic currency conversion system** based on selected region
- **Support for 10+ global currencies** with automatic exchange rates
- **Dedicated RegionSelector component** for region/currency selection
- **Automatic currency symbols** (USD: $, EUR: €, GBP: £, JPY: ¥, etc.)

### 🔧 Changed
- Updated `getDynamicPricing()` function with currency conversion logic
- Refactored `usePricing` hook for better currency synchronization
- CPU/Memory selector layout: labels and dropdowns side by side
- Centralized `getFormattedPrice` function for consistent currency display

### 🌍 Global Support
- **Supported currencies**: USD, EUR, GBP, CHF, JPY, AUD, BRL, CAD, KRW, INR
- **Automatic conversions** with exchange rates
- **Default currencies per Azure region**

---

## [0.5.0] - 2025-06-29

### ✨ Added
- **Complete modernization** of React + Vite + Tailwind architecture
- **Per-second pricing** with transparent calculations
- **Multi-app support** with color coding and management
- **Calculation formulas** always visible in breakdown

### 🔧 Changed
- Removed all hardcoded per-hour pricing
- All calculations now use per-second × 3600 for hourly values
- Updated TypeScript types for new pricing structure
- Improved multi-app state management with localStorage

### 📊 Cost Calculation Updates
- **ResourceConfiguration**: Shows per-second prices and calculated hourly
- **CostBreakdown**: Transparent calculation formulas
- **ChartVisualization**: Dynamic per-second pricing
- **useCalculator**: Refactored for dynamic pricing hook
- **Total Summary**: Accurate aggregated calculations

### 🎨 UX Enhancements
- Modern dark mode support
- Editable estimate names
- Color coding and app management
- Sticky components for better navigation
- Professional UI with shadcn/ui

---

## [0.4.0] - 2025-06-29

### ✨ Added
- **Complete multi-app support** with advanced management
- **AppManager component** for creating/managing multiple apps
- **useMultiApp hook** for state management
- **Improved layout** with optimized proportions (25% | 50% | 25%)

### 🔧 Changed
- Expanded sidebar sections from 1/5 to 3/12 each (25%)
- Main content area from 3/5 to 6/12 (50%)
- Removed max-w-7xl constraint for full-screen usage
- Removed detailed breakdown functionality

### 📱 Mobile Improvements
- Improved responsive design with appropriate touch targets
- Maintained single-column mobile layout
- Mobile-friendly AppManager

### 🗑️ Removed
- "Show/Hide Detailed Breakdown" button
- Per-app detailed breakdown modal in main area

---

## [0.3.0] - 2025-06-29

### ✨ Initial Release - Dark Mode & Complete UI
- **Azure Container Apps cost calculator** with complete interface
- **Complete dark mode** with system detection
- **ThemeToggle component** with light/dark/system options
- **useTheme hook** for theme management and persistence

### 🎨 UI Components Added
- **ResourceConfiguration**: Current configuration card
- **CostBreakdown**: Cost cards and efficiency metrics  
- **ScheduleGrid**: Scheduling grid with legend
- **ChartVisualization**: Charts with interactive elements
- **StepConfiguration**: Forms and input fields

### 🛠 Technical Stack
- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Radix UI
- **State**: Custom hooks (useCalculator, usePricing, useTheme)
- **Build**: Vite, ESLint, TypeScript

### 💰 Pricing System
- **Base EUR pricing**:
  - vCPU: €0.0000301/sec
  - Memory: €0.0000036/sec
- **Free tier calculation**
- **Efficient cost calculations**

### 📱 Features
- **Responsive design** for mobile/desktop
- **CPU/Memory configuration** with valid combinations
- **Scheduling grid** for usage planning
- **Configuration presets** for common cases
- **Chart visualization** of costs
- **Detailed cost breakdown**

### 🌍 Initial Support
- **Language**: English
- **Currency**: EUR (€)
- **Regions**: Base pricing (extensible)
- **Browsers**: Modern (ES2020+)

### 📚 Documentation
- Complete README with setup and usage
- Technical documentation for each feature
- Dark mode implementation guides
- Specific markdown files for each component

---

## Semantic Versioning

This project follows [SemVer](https://semver.org/):

- **MAJOR** (X.0.0): Breaking changes requiring manual updates
- **MINOR** (0.X.0): New backwards-compatible features  
- **PATCH** (0.0.X): Backwards-compatible bug fixes

### Future Release Examples

- **1.1.0**: New feature (e.g. Dedicated plan support, new regions, Azure API integration)
- **1.0.2**: Bug fix (e.g. UI correction, conversion fixes, pricing updates)
- **2.0.0**: Breaking change (e.g. API restructuring, major UI overhaul, architecture change)
