-- Query 6: Lending Protocol Withdrawals
-- Purpose: Track CASH withdrawals from lending protocols (primarily Kamino)
-- Data Source: solana.lending.withdrawals
-- Time Range: Last 90 days

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
ORDER BY date ASC, project;
