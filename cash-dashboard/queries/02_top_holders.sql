-- Query 2: Top Holders by Net Balance Change
-- Purpose: Identify major CASH accumulators/distributors over last 30 days
-- Data Source: solana.assets.transfers
-- Methodology: Net balance = Total received - Total sent

SELECT
  address,
  total_received,
  total_sent,
  (total_received - total_sent) as net_balance_change,
  receive_count,
  send_count,
  (receive_count + send_count) as total_transactions
FROM (
  SELECT
    receiver as address,
    SUM(amount) as total_received,
    COUNT(*) as receive_count,
    0 as total_sent,
    0 as send_count
  FROM solana.assets.transfers
  WHERE mint = 'CASHx9KJUStyftLFWGvEVf59SGeG9sh5FfcnZMVPCASH'
    AND block_timestamp >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY receiver

  UNION ALL

  SELECT
    sender as address,
    0 as total_received,
    0 as receive_count,
    SUM(amount) as total_sent,
    COUNT(*) as send_count
  FROM solana.assets.transfers
  WHERE mint = 'CASHx9KJUStyftLFWGvEVf59SGeG9sh5FfcnZMVPCASH'
    AND block_timestamp >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY sender
)
GROUP BY address
HAVING SUM(total_received) > 0 OR SUM(total_sent) > 0
ORDER BY (SUM(total_received) - SUM(total_sent)) DESC
LIMIT 50;
