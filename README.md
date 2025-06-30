# Azure Container Apps Cost Calculator

A modern, interactive cost calculator for Azure Container Apps built with React, Vite, TypeScript, and TailwindCSS. Calculate accurate costs with official Azure pricing, support for multiple regions and currencies, and advanced scheduling capabilities.

![Version](https://img.shields.io/badge/version-1.0.7-blue.svg)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Key Features

### 💰 **Accurate Cost Calculation**
- Official Azure Container Apps 2025 pricing
- Per-second precision with transparent formula display
- Zero-scale support (0 instances = $0.00)
- **Azure Free Tier support** with toggle control
- Multi-currency support (USD, EUR, GBP, JPY, CHF, etc.)
- Time projections: daily, weekly, monthly, yearly
- Detailed CPU and memory cost breakdown

### 🌍 **Multi-Region & Currency Support**
- **55+ Azure regions** with automatic currency detection
- **25+ currencies** with real-time conversion rates
- Regional pricing variations and multipliers
- Automatic currency symbol formatting

### ⚙️ **Resource Configuration**
- Only officially supported Azure CPU/memory combinations
- Quick presets: XS (0.25), S (0.5), M (1), L (2), XL (4) vCPU
- Real-time cost summary cards
- Efficient resource optimization suggestions

### 📅 **Advanced Scheduling**
- **Interactive weekly grid**: 24h × 7 days with sticky headers
- **Quick presets**: Business Hours, Extended, 24/7, Clear All
- **Step configuration**: Batch configuration for multiple days/hours
- **Clickable day badges**: Modern UX for rapid selection

### 📊 **Analytics & Visualization**
- **Chart visualization**: Day/week/month views
- **Zero-hour highlighting**: Inactive slots shown in gray
- **Interactive legend**: Active/zero/cost instance distinction
- **Efficiency metrics**: Usage percentage, peak instances, active hours

### 🎨 **Modern Design**
- Responsive interface with TailwindCSS
- shadcn/ui components for consistent design system
- Color-coded gradients for visual categorization
- Optimized layout for mobile and desktop
- Complete dark mode support

### 🔧 **Multi-App Management**
- Create and manage multiple cost estimates
- Color-coded app identification
- Editable app names and descriptions
- Total cost aggregation across all apps
- Export and comparison capabilities

### 📤 **Export & Reporting**
- **CSV Export**: Detailed cost breakdown with custom filenames
- **PDF Export**: Professional reports with weekly, monthly, yearly costs
- **Consultation Mode**: PDF opens in new tab for review before printing
- **Unified Formatting**: 2-decimal precision for consistency across exports
- **Complete Cost Periods**: All time projections included in exports

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/tiaringhio/azure-container-app-cost-calculator.git
cd azure-container-app-cost-calculator

# Install dependencies
npm install

# Start development server
npm run dev
```

The calculator will be available at `http://localhost:5173`

### Production Build
```bash
npm run build
npm run preview
```

## 🧪 Testing

The project includes a comprehensive test suite with 94 tests covering:

```bash
# Run all tests
npm test

# Run tests in CI mode
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Test Coverage
- **Pricing validation**: Official Azure pricing accuracy
- **Currency conversions**: 25+ supported currencies  
- **Region support**: 55+ Azure regions
- **Cost calculations**: Realistic scenarios and edge cases
- **Free tier**: Accurate allowance calculations and cost reductions
- **CSV Export**: File generation, formatting, and edge cases with free tier indicators
- **PDF Export**: HTML generation, cost periods, consultation mode with free tier status
- **Integration**: End-to-end workflows

## 🏗️ Technical Architecture

### Technology Stack
- **React 18**: Modern UI framework with hooks
- **Vite**: Fast build tool and dev server
- **TypeScript**: Type safety and developer experience
- **TailwindCSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality UI components
- **Vitest**: Fast unit testing framework
- **React Router**: Client-side routing

### Project Structure
```
src/
├── components/
│   ├── ui/                 # Base shadcn/ui components
│   └── calculator/         # Calculator-specific components
├── hooks/
│   ├── useCalculator.ts    # Main calculator logic
│   ├── usePricing.ts      # Pricing and currency logic
│   ├── useMultiApp.ts     # Multi-app management
│   └── useTheme.ts        # Dark mode support
├── lib/
│   ├── constants.ts        # Constants (pricing, combinations)
│   └── utils.ts           # Utility functions
├── types/
│   └── calculator.ts      # TypeScript definitions
├── data/
│   └── azure-pricing.json # Official Azure pricing data
└── routes/
    └── home.tsx           # Main application page
```

## ⚡ Development & Configuration

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Production build
npm run preview      # Preview production build
npm run type-check   # TypeScript type checking
npm run lint         # ESLint code quality
npm test             # Run test suite
npm run test:run     # Run tests once (CI mode)
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage
```

### Official Azure Pricing (2025)
- **vCPU**: $0.000004 per second ($0.1008 per hour)
- **Memory**: $0.000004 per GiB per second ($0.0144 per GiB per hour)
- **Free tier**: 180,000 vCPU-seconds and 360,000 GiB-seconds per month
- **Free tier toggle**: Enable/disable free tier calculations in Region & Currency panel
- **Billing**: Per-second precision, pay only for active usage

### Supported Regions & Currencies
- **55+ Azure regions** worldwide
- **25+ currencies** with automatic conversion
- **Regional multipliers** for accurate local pricing
- **Default currency** based on selected region

## 📱 Responsive Design

The calculator is fully responsive featuring:
- Mobile-first design with TailwindCSS
- Adaptive grid layouts for cards and components
- Touch-optimized interactions for mobile devices
- Sticky navigation for time grid
- Dark mode with system preference detection

## 🎯 Use Cases

### For Developers
- Cost estimation before deployment
- Optimization of scaling policies
- Comparison of different configurations
- Budget planning for development projects

### for DevOps/SRE
- Infrastructure budget planning
- Operational cost analysis
- Scaling scenario simulation
- Resource optimization strategies

### For Business
- Monthly/yearly cost forecasting
- ROI analysis for projects
- Budget planning and approval processes
- Cost-benefit analysis for Azure adoption

## 🔧 Configuration

### Pricing Data Updates
The pricing data is stored in `src/data/azure-pricing.json` and can be updated using:
```bash
# Update pricing data (PowerShell)
npm run update-pricing

# Update pricing data (Bash)
npm run update-pricing-bash
```

## 📊 Analytics & Insights

The calculator provides detailed insights including:
- **Cost breakdown** by CPU and memory
- **Efficiency metrics** (usage percentage, peak instances)
- **Time-based analysis** (hourly, daily, weekly patterns)
- **Regional cost comparisons**
- **Currency impact analysis**

### Export Capabilities
- **CSV Reports**: Detailed cost data with custom filenames
- **PDF Reports**: Professional documents with all cost periods
- **Consultation Mode**: Review reports before printing
- **Consistent Formatting**: 2-decimal precision across all exports

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Update documentation as needed
- Follow conventional commit messages
- Ensure all tests pass before submitting

## 📄 License

This project is licensed under the MIT License. See the `LICENSE.md` file for details.

## 🐛 Bug Reports & Feature Requests

Please use GitHub Issues to report bugs or request features:
- **Bug reports**: Include steps to reproduce, expected vs actual behavior
- **Feature requests**: Describe the use case and proposed solution
- **Questions**: Use the Discussions tab for general questions

## 🚀 Roadmap

- [ ] Azure Dedicated plan support
- [ ] API integration for real-time pricing
- [x] Export to CSV functionality ✅ **v1.0.4**
- [x] Export to PDF functionality ✅ **v1.0.6**
- [ ] Advanced scheduling patterns
- [ ] Cost optimization recommendations
- [ ] Team collaboration features

## 📞 Support

For questions, support, or discussions:
- 📧 Open an issue on GitHub
- 💬 Use the Discussions tab for general questions
- 📖 Check the documentation in the `/changelog` folder

---

*Built with ❤️ for the Azure community*
