const axios = require('axios');
const fs = require('fs');
const path = require('path');

const ALLIUM_API_KEY = process.env.ALLIUM_API_KEY;
const ALLIUM_EXPLORER_URL = 'https://api.allium.so/api/v1/explorer/queries/run';

const DATA_DIR = path.join(__dirname, '../data');

// SQL Queries for CASH Token Analysis
const QUERIES = {
  transfer_activity: `
    SELECT
      DATE_TRUNC('day', block_timestamp) as date,
      COUNT(DISTINCT txn_id) as transfer_count,
      COUNT(DISTINCT sender) as unique_senders,
      COUNT(DISTINCT receiver) as unique_receivers,
      SUM(amount) as total_cash_transferred,
      SUM(usd_amount) as total_usd_volume
    FROM solana.assets.transfers
    WHERE mint = 'CASHx9KJUStyftLFWGvEVf59SGeG9sh5FfcnZMVPCASH'
      AND block_timestamp >= CURRENT_DATE - INTERVAL '90 days'
    GROUP BY DATE_TRUNC('day', block_timestamp)
    ORDER BY date ASC
  `,

  top_holders: `
    WITH transfers_agg AS (
      SELECT
        receiver as address,
        SUM(amount) as total_received,
        COUNT(*) as receive_count
      FROM solana.assets.transfers
      WHERE mint = 'CASHx9KJUStyftLFWGvEVf59SGeG9sh5FfcnZMVPCASH'
        AND block_timestamp >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY receiver

      UNION ALL

      SELECT
        sender as address,
        -SUM(amount) as total_received,
        COUNT(*) as receive_count
      FROM solana.assets.transfers
      WHERE mint = 'CASHx9KJUStyftLFWGvEVf59SGeG9sh5FfcnZMVPCASH'
        AND block_timestamp >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY sender
    )
    SELECT
      address,
      SUM(total_received) as net_balance_change,
      SUM(receive_count) as total_transactions
    FROM transfers_agg
    GROUP BY address
    ORDER BY net_balance_change DESC
    LIMIT 50
  `,

  dex_trading_by_project: `
    SELECT
      DATE_TRUNC('day', block_timestamp) as date,
      project,
      COUNT(*) as trade_count,
      COUNT(DISTINCT sender_address) as unique_traders,
      SUM(usd_amount) as trading_volume_usd
    FROM solana.dex.trades
    WHERE (token_sold_mint = 'CASHx9KJUStyftLFWGvEVf59SGeG9sh5FfcnZMVPCASH'
       OR token_bought_mint = 'CASHx9KJUStyftLFWGvEVf59SGeG9sh5FfcnZMVPCASH')
      AND block_timestamp >= CURRENT_DATE - INTERVAL '90 days'
    GROUP BY DATE_TRUNC('day', block_timestamp), project
    ORDER BY date ASC, project
  `,

  dex_token_pairs: `
    SELECT
      DATE_TRUNC('day', block_timestamp) as date,
      CASE
        WHEN token_sold_mint = 'CASHx9KJUStyftLFWGvEVf59SGeG9sh5FfcnZMVPCASH'
          THEN token_bought_symbol
        ELSE token_sold_symbol
      END as paired_token,
      COUNT(*) as trade_count,
      SUM(usd_amount) as trading_volume_usd
    FROM solana.dex.trades
    WHERE (token_sold_mint = 'CASHx9KJUStyftLFWGvEVf59SGeG9sh5FfcnZMVPCASH'
       OR token_bought_mint = 'CASHx9KJUStyftLFWGvEVf59SGeG9sh5FfcnZMVPCASH')
      AND block_timestamp >= CURRENT_DATE - INTERVAL '90 days'
    GROUP BY
      DATE_TRUNC('day', block_timestamp),
      CASE
        WHEN token_sold_mint = 'CASHx9KJUStyftLFWGvEVf59SGeG9sh5FfcnZMVPCASH'
          THEN token_bought_symbol
        ELSE token_sold_symbol
      END
    ORDER BY date ASC, paired_token
  `,

  lending_deposits: `
    SELECT
      DATE_TRUNC('day', block_timestamp) as date,
      project,
      COUNT(*) as deposit_count,
      COUNT(DISTINCT from_address) as unique_depositors,
      SUM(usd_amount) as deposit_volume_usd,
      SUM(amount) as total_cash_deposited
    FROM solana.lending.deposits
    WHERE mint = 'CASHx9KJUStyftLFWGvEVf59SGeG9sh5FfcnZMVPCASH'
      AND block_timestamp >= CURRENT_DATE - INTERVAL '90 days'
    GROUP BY DATE_TRUNC('day', block_timestamp), project
    ORDER BY date ASC, project
  `,

  lending_withdrawals: `
    SELECT
      DATE_TRUNC('day', block_timestamp) as date,
      project,
      COUNT(*) as withdrawal_count,
      COUNT(DISTINCT to_address) as unique_withdrawers,
      SUM(usd_amount) as withdrawal_volume_usd,
      SUM(amount) as total_cash_withdrawn
    FROM solana.lending.withdrawals
    WHERE mint = 'CASHx9KJUStyftLFWGvEVf59SGeG9sh5FfcnZMVPCASH'
      AND block_timestamp >= CURRENT_DATE - INTERVAL '90 days'
    GROUP BY DATE_TRUNC('day', block_timestamp), project
    ORDER BY date ASC, project
  `
};

async function fetchData(queryName, sql) {
  try {
    console.log(`Fetching ${queryName}...`);

    const response = await axios.post(
      ALLIUM_EXPLORER_URL,
      { sql },
      {
        headers: {
          'X-API-KEY': ALLIUM_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = response.data;
    const outputPath = path.join(DATA_DIR, `${queryName}.json`);

    // Save only the data array
    fs.writeFileSync(outputPath, JSON.stringify({ data: data.data }, null, 2));
    console.log(`✓ Saved ${queryName}.json (${data.data.length} rows)`);

  } catch (error) {
    console.error(`✗ Error fetching ${queryName}:`, error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    throw error;
  }
}

async function main() {
  if (!ALLIUM_API_KEY) {
    console.error('Error: ALLIUM_API_KEY environment variable is not set');
    process.exit(1);
  }

  console.log('Starting data fetch from Allium for CASH token analysis...\\n');

  // Fetch all queries
  for (const [queryName, sql] of Object.entries(QUERIES)) {
    await fetchData(queryName, sql);
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\\n✓ All data fetched successfully!');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
