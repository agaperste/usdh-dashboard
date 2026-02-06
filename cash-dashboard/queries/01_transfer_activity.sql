-- Query 1: Daily Transfer Activity
-- Purpose: Track daily transfer counts, unique users, and volume for CASH token
-- Data Source: solana.assets.transfers
-- Time Range: Last 90 days

SELECT
  DATE_TRUNC('day', block_timestamp) as date,
  COUNT(DISTINCT txn_id) as transfer_count,
  COUNT(DISTINCT sender) as unique_senders,
  COUNT(DISTINCT receiver) as unique_receivers,
  COUNT(DISTINCT sender) + COUNT(DISTINCT receiver) as total_unique_addresses,
  SUM(amount) as total_cash_transferred,
  SUM(usd_amount) as total_usd_volume
FROM solana.assets.transfers
WHERE mint = 'CASHx9KJUStyftLFWGvEVf59SGeG9sh5FfcnZMVPCASH'
  AND block_timestamp >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE_TRUNC('day', block_timestamp)
ORDER BY date ASC;
