-- Query 5: Lending Protocol Deposits
-- Purpose: Track CASH deposits into lending protocols (primarily Kamino)
-- Data Source: solana.lending.deposits
-- Time Range: Last 90 days

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
ORDER BY date ASC, project;
