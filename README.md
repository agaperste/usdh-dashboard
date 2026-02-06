# Data Dashboards Home

Home for all analytics dashboards we are building for Bridge blockchain data analysis.

## Dashboards

### USDH Dashboard
Located in `usdh-dashboard/`
- Analytics dashboard for USDH stablecoin
- Runs on port 3000 (default Next.js port)

### Cash Dashboard
Located in `cash-dashboard/`
- Analytics dashboard for CASH token on Base
- Runs on port 3002

## Getting Started

Each dashboard is a standalone Next.js application. To run locally:

```bash
# Navigate to the dashboard directory
cd cash-dashboard  # or cd usdh-dashboard

# Install dependencies
npm install

# Run development server
npm run dev
```

### Viewing Dashboards

- **USDH Dashboard**: http://localhost:3000
- **Cash Dashboard**: http://localhost:3002

## Repository Structure

```
data_dashboard/
├── README.md                 # This file
├── .gitignore               # Ignore node_modules, build artifacts
├── usdh-dashboard/          # USDH stablecoin analytics
│   ├── app/
│   ├── queries/
│   ├── data/
│   └── package.json
└── cash-dashboard/          # CASH token analytics
    ├── app/
    ├── queries/
    ├── data/
    ├── README.md            # Detailed dashboard documentation
    ├── METHODOLOGY.md       # Data analysis methodology
    └── package.json
``` 
