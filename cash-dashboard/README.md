# CASH Token Analytics Dashboard

Comprehensive analysis of Phantom's CASH token on Solana blockchain.

## Quick Start

```bash
# Install dependencies
npm install

# Run development server (port 3002)
npm run dev

# View at http://localhost:3002
```

## Fetching Fresh Data

The dashboard uses pre-fetched JSON data files in the `data/` directory. To fetch the latest data from Allium:

```bash
# Set your Allium API key
export ALLIUM_API_KEY="your_key_here"

# Fetch all data
node scripts/fetch-data.js
```

**Note**: The current fetch script has an API endpoint issue. Use the Allium MCP server directly to fetch data, or use the pre-fetched data files included.

## Project Structure

```
cash-dashboard/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main dashboard page with charts
├── data/                    # Pre-fetched JSON data files
│   ├── transfer_activity.json
│   ├── dex_trading_by_project.json
│   ├── lending_deposits.json
│   └── lending_withdrawals.json
├── queries/                 # SQL queries used for analysis
│   ├── 01_transfer_activity.sql
│   ├── 02_top_holders.sql
│   ├── 03_dex_trading_by_project.sql
│   ├── 04_dex_token_pairs.sql
│   ├── 05_lending_deposits.sql
│   └── 06_lending_withdrawals.sql
├── scripts/
│   └── fetch-data.js        # Data fetching script
├── METHODOLOGY.md           # Detailed analysis methodology
└── README.md                # This file
```

## Analysis Coverage

### 1. Transfer Activity
- Daily transfer counts and volumes
- Unique senders and receivers
- USD-denominated volume tracking

### 2. DEX Trading
- Trading volume by project (Orca, Raydium, etc.)
- Token pair analysis (USDC, PRIME, etc.)
- Unique trader counts

### 3. Lending Activity
- Kamino Finance deposits and withdrawals
- Daily user engagement
- USD volume tracking

### 4. Growth Phases
- **Phase 1 (Nov 6-8)**: Launch & initial liquidity
- **Phase 2 (Dec 4-9)**: DEX expansion
- **Phase 3 (Jan 2026)**: Sustained maturity

## Data Sources

All data from **Allium's Solana blockchain analytics**:
- `solana.assets.transfers` - Token transfer activity
- `solana.dex.trades` - DEX trading data
- `solana.lending.deposits` - Lending deposits
- `solana.lending.withdrawals` - Lending withdrawals

**Analysis Period**: November 6, 2025 - February 4, 2026 (90 days)

## Key Findings

1. **Explosive Growth**: 2,376 → 142,501 daily transfers (60x increase)
2. **User Growth**: 697 → 16,950 daily active users (24x increase)
3. **Primary Use Cases**:
   - Kamino lending (billions in volume)
   - USDC trading pairs ($713M total volume)
   - PRIME ecosystem integration ($475M volume)

## Methodology

See [METHODOLOGY.md](./METHODOLOGY.md) for detailed documentation on:
- Data collection methods
- Calculation formulas
- Known limitations
- Validation recommendations

## Technology Stack

- **Framework**: Next.js 13.5.6
- **Language**: TypeScript
- **Charts**: Recharts
- **Data API**: Allium Explorer API
- **Deployment**: Vercel (ready for deployment)

## Deploying to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

The dashboard is a static site with no serverless functions, so it will stay well within Vercel's free tier limits.

## License

MIT
