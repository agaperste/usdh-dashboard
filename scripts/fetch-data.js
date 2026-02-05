const axios = require('axios');
const fs = require('fs');
const path = require('path');

const ALLIUM_API_KEY = process.env.ALLIUM_API_KEY;
// NOTE: This endpoint doesn't work - Allium requires saved query IDs
// See ALLIUM_API_FIX.md for solutions
const ALLIUM_EXPLORER_URL = 'https://api.allium.so/api/v1/explorer/queries/run';

const DATA_DIR = path.join(__dirname, '../data');

// SQL Queries
const QUERIES = {
  lending_data: `
    SELECT
      DATE_TRUNC('day', block_timestamp) as date,
      project,
      action_type,
      COUNT(*) as transaction_count,
      COUNT(DISTINCT user_address) as unique_wallets,
      SUM(usd_amount) as volume_usd
    FROM (
      SELECT
        block_timestamp,
        project,
        'deposit' as action_type,
        depositor_address as user_address,
        usd_amount
      FROM hyperevm.lending.deposits
      WHERE token_address = LOWER('0x111111a1a0667d36bD57c0A9f569b98057111111')
        AND block_timestamp >= DATE '2025-09-15'

      UNION ALL

      SELECT
        block_timestamp,
        project,
        'withdrawal' as action_type,
        withdrawer_address as user_address,
        usd_amount
      FROM hyperevm.lending.withdrawals
      WHERE token_address = LOWER('0x111111a1a0667d36bD57c0A9f569b98057111111')
        AND block_timestamp >= DATE '2025-09-15'
    ) combined
    GROUP BY DATE_TRUNC('day', block_timestamp), project, action_type
    ORDER BY date ASC, project, action_type
  `,

  dex_data: `
    SELECT
      DATE_TRUNC('day', block_timestamp) as date,
      project,
      COUNT(*) as trade_count,
      COUNT(DISTINCT transaction_from_address) as unique_traders,
      SUM(usd_amount) as trading_volume_usd,
      SUM(CASE WHEN token_sold_address = LOWER('0x111111a1a0667d36bD57c0A9f569b98057111111')
               THEN token_sold_amount ELSE 0 END) as usdh_sold_volume,
      SUM(CASE WHEN token_bought_address = LOWER('0x111111a1a0667d36bD57c0A9f569b98057111111')
               THEN token_bought_amount ELSE 0 END) as usdh_bought_volume
    FROM hyperevm.dex.trades
    WHERE (token_sold_address = LOWER('0x111111a1a0667d36bD57c0A9f569b98057111111')
       OR token_bought_address = LOWER('0x111111a1a0667d36bD57c0A9f569b98057111111'))
      AND block_timestamp >= DATE '2025-09-15'
    GROUP BY DATE_TRUNC('day', block_timestamp), project
    ORDER BY date ASC, project
  `,

  dex_token_pairs_data: `
    SELECT
      DATE_TRUNC('day', block_timestamp) as date,
      CASE
        WHEN token_sold_address = LOWER('0x111111a1a0667d36bD57c0A9f569b98057111111')
          THEN CONCAT(token_bought_symbol, '-USDH')
        ELSE CONCAT(token_sold_symbol, '-USDH')
      END as token_pair,
      COUNT(*) as trade_count,
      SUM(usd_amount) as trading_volume_usd
    FROM hyperevm.dex.trades
    WHERE (token_sold_address = LOWER('0x111111a1a0667d36bD57c0A9f569b98057111111')
       OR token_bought_address = LOWER('0x111111a1a0667d36bD57c0A9f569b98057111111'))
      AND block_timestamp >= DATE '2025-09-15'
    GROUP BY
      DATE_TRUNC('day', block_timestamp),
      CASE
        WHEN token_sold_address = LOWER('0x111111a1a0667d36bD57c0A9f569b98057111111')
          THEN CONCAT(token_bought_symbol, '-USDH')
        ELSE CONCAT(token_sold_symbol, '-USDH')
      END
    ORDER BY date ASC, token_pair
  `,

  hypercore_by_protocol_data: `
    SELECT
      DATE_TRUNC('day', timestamp) as date,
      perp_dex,
      SUM(usd_amount) as trading_volume_usd
    FROM hyperliquid.dex.trades
    WHERE (token_a_symbol = 'USDH' OR token_b_symbol = 'USDH')
      AND timestamp >= DATE '2025-09-15'
      AND market_type = 'perpetuals'
    GROUP BY DATE_TRUNC('day', timestamp), perp_dex
    ORDER BY date ASC, perp_dex
  `,

  hypercore_by_coin_data: `
    SELECT
      DATE_TRUNC('day', timestamp) as date,
      coin,
      SUM(usd_amount) as trading_volume_usd
    FROM hyperliquid.dex.trades
    WHERE (token_a_symbol = 'USDH' OR token_b_symbol = 'USDH')
      AND timestamp >= DATE '2025-09-15'
      AND market_type = 'perpetuals'
    GROUP BY DATE_TRUNC('day', timestamp), coin
    ORDER BY date ASC, coin
    LIMIT 10000
  `,

  hypercore_by_protocol_and_coin_data: `
    SELECT
      DATE_TRUNC('day', timestamp) as date,
      perp_dex,
      coin,
      SUM(usd_amount) as trading_volume_usd
    FROM hyperliquid.dex.trades
    WHERE (token_a_symbol = 'USDH' OR token_b_symbol = 'USDH')
      AND timestamp >= DATE '2025-09-15'
      AND market_type = 'perpetuals'
    GROUP BY DATE_TRUNC('day', timestamp), perp_dex, coin
    ORDER BY date ASC, perp_dex, coin
    LIMIT 10000
  `,

  hyperliquid_spot_data: `
    SELECT
      DATE_TRUNC('day', timestamp) as date,
      CASE
        WHEN token_a_symbol = 'USDH' THEN CONCAT(token_b_symbol, '/USDH')
        ELSE CONCAT(token_a_symbol, '/USDH')
      END as token_pair,
      SUM(usd_amount) as trading_volume_usd
    FROM hyperliquid.dex.trades
    WHERE (token_a_symbol = 'USDH' OR token_b_symbol = 'USDH')
      AND timestamp >= DATE '2025-09-15'
      AND market_type = 'spot'
    GROUP BY DATE_TRUNC('day', timestamp), token_pair
    ORDER BY date ASC, token_pair
    LIMIT 10000
  `,

  daily_active_users_data: `
    WITH all_users_daily AS (
      SELECT
        DATE_TRUNC('day', block_timestamp) as date,
        depositor_address as address,
        'lending' as category
      FROM hyperevm.lending.deposits
      WHERE token_address = LOWER('0x111111a1a0667d36bD57c0A9f569b98057111111')
        AND block_timestamp >= DATE '2025-09-15'
      UNION
      SELECT
        DATE_TRUNC('day', block_timestamp) as date,
        withdrawer_address as address,
        'lending' as category
      FROM hyperevm.lending.withdrawals
      WHERE token_address = LOWER('0x111111a1a0667d36bD57c0A9f569b98057111111')
        AND block_timestamp >= DATE '2025-09-15'
      UNION
      SELECT
        DATE_TRUNC('day', block_timestamp) as date,
        transaction_from_address as address,
        'spot' as category
      FROM hyperevm.dex.trades
      WHERE (token_sold_address = LOWER('0x111111a1a0667d36bD57c0A9f569b98057111111')
         OR token_bought_address = LOWER('0x111111a1a0667d36bD57c0A9f569b98057111111'))
        AND block_timestamp >= DATE '2025-09-15'
      UNION
      SELECT
        DATE_TRUNC('day', timestamp) as date,
        buyer_address as address,
        'perp' as category
      FROM hyperliquid.dex.trades
      WHERE (token_a_symbol = 'USDH' OR token_b_symbol = 'USDH')
        AND timestamp >= DATE '2025-09-15'
      UNION
      SELECT
        DATE_TRUNC('day', timestamp) as date,
        seller_address as address,
        'perp' as category
      FROM hyperliquid.dex.trades
      WHERE (token_a_symbol = 'USDH' OR token_b_symbol = 'USDH')
        AND timestamp >= DATE '2025-09-15'
    )
    SELECT
      date,
      COUNT(DISTINCT CASE WHEN category = 'lending' THEN address END) as lending_users,
      COUNT(DISTINCT CASE WHEN category = 'spot' THEN address END) as spot_users,
      COUNT(DISTINCT CASE WHEN category = 'perp' THEN address END) as perp_users,
      COUNT(DISTINCT address) as total_unique_users
    FROM all_users_daily
    GROUP BY date
    ORDER BY date ASC
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
    console.log(`✓ Saved ${queryName}.json`);

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

  console.log('Starting data fetch from Allium...\n');

  // Fetch all queries
  for (const [queryName, sql] of Object.entries(QUERIES)) {
    await fetchData(queryName, sql);
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n✓ All data fetched successfully!');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
