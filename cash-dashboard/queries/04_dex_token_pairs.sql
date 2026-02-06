-- Query 4: DEX Trading by Token Pair
-- Purpose: Identify which tokens are most commonly traded against CASH
-- Data Source: solana.dex.trades
-- Methodology: Determine paired token based on whether CASH was sold or bought

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
ORDER BY date ASC, paired_token;
