-- ============================================================================
-- COMBINED Daily Active Users Query
-- ============================================================================
-- This single query produces all daily active user metrics to ensure consistency
-- Output: date, lending_users, spot_users, perp_users, total_unique_users
-- ============================================================================

WITH all_users_daily AS (
  -- Lending users (deposits)
  SELECT
    DATE_TRUNC('day', block_timestamp) as date,
    depositor_address as address,
    'lending' as category
  FROM hyperevm.lending.deposits
  WHERE token_address = LOWER('0x111111a1a0667d36bD57c0A9f569b98057111111')
    AND block_timestamp >= DATE '2025-09-15'
  UNION
  -- Lending users (withdrawals)
  SELECT
    DATE_TRUNC('day', block_timestamp) as date,
    withdrawer_address as address,
    'lending' as category
  FROM hyperevm.lending.withdrawals
  WHERE token_address = LOWER('0x111111a1a0667d36bD57c0A9f569b98057111111')
    AND block_timestamp >= DATE '2025-09-15'
  UNION
  -- Spot trading users
  SELECT
    DATE_TRUNC('day', block_timestamp) as date,
    transaction_from_address as address,
    'spot' as category
  FROM hyperevm.dex.trades
  WHERE (token_sold_address = LOWER('0x111111a1a0667d36bD57c0A9f569b98057111111')
     OR token_bought_address = LOWER('0x111111a1a0667d36bD57c0A9f569b98057111111'))
    AND block_timestamp >= DATE '2025-09-15'
  UNION
  -- Perp trading users (buyers)
  SELECT
    DATE_TRUNC('day', timestamp) as date,
    buyer_address as address,
    'perp' as category
  FROM hyperliquid.dex.trades
  WHERE (token_a_symbol = 'USDH' OR token_b_symbol = 'USDH')
    AND timestamp >= DATE '2025-09-15'
  UNION
  -- Perp trading users (sellers)
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
ORDER BY date ASC;
