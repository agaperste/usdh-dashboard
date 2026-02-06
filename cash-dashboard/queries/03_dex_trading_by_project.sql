-- Query 3: DEX Trading Volume by Project
-- Purpose: Track CASH trading activity across different DEXes (Orca, Raydium, etc.)
-- Data Source: solana.dex.trades
-- Time Range: Last 90 days

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
ORDER BY date ASC, project;
