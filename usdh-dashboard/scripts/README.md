# Data Fetch Scripts

## fetch-data.js

Fetches the latest USDH usage data from Allium's blockchain analytics platform.

### Prerequisites

- Node.js 18 or higher
- Allium API key (get one at https://app.allium.so/settings/api-keys)

### Environment Variables

```bash
export ALLIUM_API_KEY=your_api_key_here
```

### Usage

```bash
# Install dependencies
npm install axios

# Run the script
node scripts/fetch-data.js
```

### Data Files Generated

The script fetches and saves the following data files to the `data/` directory:

- `lending_data.json` - HyperEVM lending deposits/withdrawals
- `dex_data.json` - HyperEVM DEX trading volume by project
- `dex_token_pairs_data.json` - HyperEVM DEX trading volume by token pair
- `hypercore_by_protocol_data.json` - HyperCore perpetual trading by protocol
- `hypercore_by_coin_data.json` - HyperCore perpetual trading by asset
- `hypercore_by_protocol_and_coin_data.json` - HyperCore perpetual trading by protocol + asset
- `daily_active_users_data.json` - Daily active users across lending, spot, and perps

### Automated Refresh

The dashboard data is automatically refreshed daily at 23:00 UTC via GitHub Actions.
See `.github/workflows/update-data.yml` for the automation configuration.

To manually trigger the data refresh:
1. Go to the Actions tab in GitHub
2. Select "Update Dashboard Data"
3. Click "Run workflow"
