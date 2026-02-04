# USDH Ecosystem Dashboard

Analytics dashboard tracking USDH stablecoin usage across HyperEVM and HyperCore ecosystems.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/agaperste/usdh-dashboard)

## 🎯 Features

- **HyperEVM Lending**: Deposits/withdrawals across Morpho Blue, HyperLend, Hypurrfi, Euler
- **HyperEVM DEX**: Spot trading volume by project and token pairs
- **HyperCore Perpetuals**: Perp trading on Hyperliquid (Felix, Kinetiq, Ventuals)
- **Active Users**: Daily active users with true distinct counts (deduplicated across categories)
- **Interactive Date Range**: Filter data by custom date ranges
- **Responsive Design**: Works on desktop and mobile

## 📊 Data Source

All data is sourced from [Allium](https://allium.so) blockchain analytics platform.

USDH is identified by:
- **Contract address** on HyperEVM: `0x111111a1a0667d36bD57c0A9f569b98057111111`
- **Token symbol** on HyperCore: `USDH`

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm run start
```

## Project Structure

```
usdh-dashboard/
├── app/
│   ├── page.tsx          # Main dashboard component
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── data/
│   ├── lending_data.json      # HyperEVM lending data
│   ├── dex_data.json          # HyperEVM DEX data
│   └── hypercore_data.json    # HyperCore perpetuals data
├── package.json
└── README.md
```

## Features

### Interactive Visualizations

**1. Top Projects Summary**
- Shows top 3 projects in Lending and DEX by total volume
- Quick overview of which protocols drive the most USDH usage

**2. HyperEVM Lending Chart**
- **Composed chart** with dual Y-axes
- **Deposits shown above 0** (positive values)
- **Withdrawals shown below 0** (negative values)
- **Cumulative TVL line** (red line) showing net deposits over time
- Reference line at y=0 for clarity

**3. HyperEVM DEX Chart**
- Stacked bar chart showing daily trading volume by project
- Grouped by DEX protocol (Project X, Hybra Finance, HyperSwap)

**4. HyperCore (Hyperliquid) Chart**
- Stacked bar chart showing HIP-3 perpetual trading volume
- **⚠️ Note**: Data may need verification - to be revisited

### Interactive Features
- **Clickable legends** - Click any legend item to toggle visibility
- **Color-coded** by protocol for easy identification
- **Responsive design** that works on all screen sizes
- **Formatted tooltips** showing exact values on hover

## Data Update Strategy

### Automated Daily Refresh

Dashboard data is **automatically updated daily at 23:00 UTC** via GitHub Actions. The workflow:

1. Fetches latest data from Allium's blockchain analytics platform
2. Updates all JSON files in the `data/` directory
3. Commits changes to the repository
4. Vercel auto-deploys the updated dashboard

### Manual Data Refresh

To manually update the data:

```bash
# Set your Allium API key
export ALLIUM_API_KEY=your_api_key_here

# Install dependencies (if not already done)
npm install axios

# Run the data fetch script
node scripts/fetch-data.js
```

## Volume Insights (Last 30 Days)

| Ecosystem | Daily Avg Volume | Primary Use Case |
|-----------|------------------|------------------|
| **HyperCore (Hyperliquid)** | ~$50M - $150M | Perpetual futures trading |
| **HyperEVM Lending** | ~$3M - $5M | Deposit/withdraw |
| **HyperEVM DEX** | ~$2M - $5M | Spot trading |

**Total USDH Daily Activity:** ~$55M - $160M

## SQL Queries

All queries are documented in:
- `/Users/jackiez/stripe/monorail/usdh_daily_usage_queries.sql`
- `/Users/jackiez/stripe/monorail/usdh_usage_analysis_summary.md`

## 🌐 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/agaperste/usdh-dashboard)

Or manually:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod
```

### Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

### Static Export

For hosting on any web server (AWS S3, GitHub Pages, etc.):

1. Update `next.config.js`:
   ```javascript
   module.exports = {
     output: 'export',
     images: { unoptimized: true }
   }
   ```

2. Build and deploy:
   ```bash
   npm run build
   # Upload contents of 'out/' directory to your web server
   ```

## Technologies

- **Next.js 13.5.6** - React framework
- **TypeScript** - Type safety
- **Recharts 2.10.3** - Chart library
- **React 18** - UI library

## Known Limitations

1. **Static data** - Currently not fetching live data from Allium API
2. **Node version warning** - Built with Node 18.14.0 (Next.js prefers >=18.17.0)
3. **Security vulnerability** - Next.js 13.5.6 has known vulnerability (acceptable for local development)

## Next Steps

- [ ] Add live data fetching from Allium API
- [ ] Implement data caching strategy
- [ ] Add date range filter UI
- [ ] Add export to CSV functionality
- [ ] Deploy to Vercel
- [ ] Set up automatic daily data refresh
- [ ] Add more chart types (line charts, area charts)
- [ ] Add daily/weekly/monthly aggregation toggles

## Related Files

- **Query documentation:** `usdh_usage_analysis_summary.md`
- **SQL queries:** `usdh_daily_usage_queries.sql`

## Support

For issues or questions, contact the Bridge data team or reference the Allium documentation at https://docs.allium.so
