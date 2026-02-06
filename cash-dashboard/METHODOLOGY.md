# CASH Token Analysis Methodology

## Data Sources
All data is sourced from **Allium's Solana blockchain analytics tables** via their Explorer API.

## Token Details
- **Token Name**: CASH (Phantom Cash)
- **Contract Address**: `CASHx9KJUStyftLFWGvEVf59SGeG9sh5FfcnZMVPCASH`
- **Blockchain**: Solana
- **Analysis Period**: November 6, 2025 - February 4, 2026 (90 days)

## Metrics & Calculations

### 1. Transfer Activity (`queries/01_transfer_activity.sql`)
**Data Source**: `solana.assets.transfers`

**Metrics Calculated**:
- Daily transfer count (unique `txn_id`)
- Unique senders (`COUNT(DISTINCT sender)`)
- Unique receivers (`COUNT(DISTINCT receiver)`)
- Total unique addresses (senders + receivers, may double-count)
- Total CASH volume transferred
- Total USD value of transfers

**Methodology Note**: A single user can appear as both sender and receiver on the same day, so "total unique addresses" may overcount daily active users.

### 2. Top Holders Analysis (`queries/02_top_holders.sql`)
**Data Source**: `solana.assets.transfers`

**Calculation Method**:
```
Net Balance Change = Total CASH Received - Total CASH Sent
```

**Considerations**:
- Shows net accumulation over 30-day period, NOT total wallet balance
- "null" addresses often represent protocol contracts or mint addresses
- Positive net balance = net accumulator, Negative = net distributor
- Does not account for off-chain balances or pre-analysis period holdings

### 3. DEX Trading Volume (`queries/03_dex_trading_by_project.sql`)
**Data Source**: `solana.dex.trades`

**Metrics Calculated**:
- Daily trade count by DEX project (Orca, Raydium, etc.)
- Unique traders (`sender_address` in trades table)
- USD trading volume

**Filter Logic**:
```sql
WHERE (token_sold_mint = 'CASH_ADDRESS' OR token_bought_mint = 'CASH_ADDRESS')
```
This captures all trades where CASH is either the buy or sell side.

### 4. Token Pair Analysis (`queries/04_dex_token_pairs.sql`)
**Data Source**: `solana.dex.trades`

**Paired Token Identification**:
```
If CASH was sold → paired_token = token_bought_symbol
If CASH was bought → paired_token = token_sold_symbol
```

**Aggregation**: 90-day totals grouped by paired token

**Known Issues**:
- Some tokens have case variants (e.g., "PRIME" vs "prime") that should ideally be consolidated
- Symbol-based grouping may miss tokens with symbol changes

### 5. Lending Deposits (`queries/05_lending_deposits.sql`)
**Data Source**: `solana.lending.deposits`

**Metrics**:
- Daily deposit transaction count
- Unique depositor addresses (`from_address`)
- Total CASH deposited (token amount)
- Total USD value of deposits

**Protocol Coverage**: Currently only Kamino Finance has CASH integration

### 6. Lending Withdrawals (`queries/06_lending_withdrawals.sql`)
**Data Source**: `solana.lending.withdrawals`

**Metrics**:
- Daily withdrawal transaction count
- Unique withdrawer addresses (`to_address`)
- Total CASH withdrawn (token amount)
- Total USD value of withdrawals

**Analysis Note**: Comparing deposits vs withdrawals shows net lending activity and vault utilization patterns.

## Key Insights & Interpretation

### Growth Phases Identified

**Phase 1: Launch (Nov 6-8, 2025)**
- Massive $208M transfer spike on Nov 7
- 72M CASH deposited to Kamino simultaneously
- Interpretation: Token launch event with immediate DeFi integration

**Phase 2: DEX Expansion (Dec 4-9, 2025)**
- Raydium DEX integration (Dec 4)
- Second major spike: $215M transfers (Dec 8)
- Combined DEX volume reaches $40M+/day
- Interpretation: Multi-venue liquidity expansion

**Phase 3: Maturity (Jan 2026)**
- Sustained 150K-375K transfers/day
- Stable 10K-20K daily active users
- Consistent $10-50M DEX volume
- Interpretation: Established product-market fit

### Primary Use Cases
1. **Yield Generation**: Billions in Kamino lending volume
2. **Stable Trading Pair**: $713M USDC pair volume (90-day)
3. **PRIME Ecosystem Integration**: $475M combined PRIME pair volume

## Limitations & Caveats

1. **Net Balance ≠ Wallet Balance**: Top holders analysis shows net flow over 30 days, not absolute holdings
2. **No Burn Tracking**: Did not explicitly query for token burns; inferred from "null" address patterns
3. **Address Labeling**: Most addresses are unlabeled; cannot definitively identify institutional vs retail
4. **Unique User Counts**: May overcount due to same address appearing as sender and receiver
5. **USD Pricing**: Based on Allium's price oracle at transaction time; subject to oracle accuracy
6. **Data Freshness**: Analysis current as of February 4, 2026

## Data Quality Checks

✅ **Verified**:
- Column names match Allium schema (confirmed via `SELECT * LIMIT 1` queries)
- Date ranges align with requested 90-day window
- Token address matches official CASH contract

⚠️ **User Should Verify**:
- USD volume calculations against external sources (e.g., Dune Analytics, CoinGecko)
- Top holder addresses against known protocol contracts
- Phase timing against known CASH/Phantom announcements

## Query Execution Notes

All queries executed via Allium MCP Server on February 4, 2026, 16:37-16:38 UTC.

**API Endpoint**: `https://api.allium.so/api/v1/explorer/queries/run`

**Rate Limiting**: 1-second delay between queries to respect API limits.
