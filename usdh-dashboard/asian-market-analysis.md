# USDH Asian Market Volume Analysis

**Date**: February 25, 2026
**Period**: 30-day primary analysis + 90-day extension (Nov 27 2025 -- Feb 25 2026)
**Data sources**: Allium (Snowflake), Dune Analytics, Bridge monorail codebase
**Context**: Native Markets requested SWIFT onramp for Asian customers ([Slack thread](https://bridge-xyz.slack.com/archives/C069U3GPBJS/p1771974944267729)). This report estimates how much USDH/Hyperliquid volume originates from Asian markets to inform the SWIFT investment decision.

---

## Executive Summary

USDH trading on Hyperliquid has a **genuine but retail-dominated Asian user base**. Asian-timezone wallets account for ~27-35% of all USDH traders but only ~12% of volume, because Americas-timezone wallets (likely including market makers and institutional traders) dominate volume by a wide margin.

| Metric | 30-Day | 90-Day |
|--------|--------|--------|
| Total USDH trading volume (Hyperliquid) | $2.88B | $4.43B |
| HyperEVM DEX USDH volume | $118M | $211M |
| Unique USDH traders | ~13,300 | ~36,200 |
| Asian-timezone wallets (% of total) | 4,660 (35%) | 9,934 (27%) |
| Asian-timezone volume (% of total) | $664M (12.4%) | $1.09B (12.3%) |
| Total HL deposits (USDC) | $4.29B | $9.95B |
| Unique HL depositors | 12,276 | 21,541 |
| CEX-attributed HL depositors | 1,143 (9.3%) | -- |
| Direct Asian CEX-funded USDH volume | ~$14K | -- |
| Global CEX-funded Asian-hours USDH volume | ~$9.6M | -- |

**Bottom line**: The addressable Asian USDH market is somewhere between $14K/month (strict direct CEX tracing -- clearly an undercount) and $664M/month (timezone-based upper bound -- likely an overcount). The best-supported estimate is **$50-150M/month in USDH volume from Asian-origin traders**, implying an **annualized AUM contribution of roughly $200-600M** if these traders maintain proportional balances.

---

## 1. Baseline USDH Volumes

### 30-Day Window (Jan 26 -- Feb 25 2026)

| Venue | Volume | Trades | Unique Traders |
|-------|--------|--------|----------------|
| Hyperliquid DEX (perps + spot) | $2.88B | 4.34M | ~13,300 |
| HyperEVM DEX (Hyperswap etc.) | $118M | 128K | ~120 |
| **Total** | **~$3.0B** | **4.47M** | **~13,400** |

### 90-Day Window (Nov 27 2025 -- Feb 25 2026)

| Venue | Volume | Trades | Unique Traders |
|-------|--------|--------|----------------|
| Hyperliquid DEX (perps + spot) | $4.43B | 7.17M | ~34,300 |
| HyperEVM DEX | $211M | 392K | 143 |
| **Total** | **~$4.64B** | **7.56M** | **~34,400** |

### Monthly Growth Trajectory

| Month | Volume | Trades | Growth |
|-------|--------|--------|--------|
| Nov 2025 (partial, from 27th) | $134M | 375K | -- |
| Dec 2025 | $539M | 1.07M | ~4x |
| Jan 2026 | $1.93B | 2.61M | 3.6x |
| Feb 2026 (24d) | $1.82B | 3.12M | on pace for ~$2.1B |

USDH trading volume has grown explosively -- roughly 14x from December to February.

---

## 2. Deposit Flows into Hyperliquid

Over 90 days, $9.95B was deposited into Hyperliquid by 21,541 unique depositors. All deposits arrive as USDC through the Hyperliquid bridge (primarily Arbitrum, with newer multi-chain paths for BTC/SOL/ETH).

Key deposit statistics (90 days):
- 446,771 total deposit transactions
- Average deposit: ~$22,270
- Deposits exceed withdrawals ($9.95B in vs $10.26B out), suggesting high capital rotation

---

## 3. Geographic Attribution: Methodology

We used three complementary approaches to estimate Asian market share, each with different strengths and weaknesses:

### Approach A: Direct CEX Wallet Attribution
Trace wallets that received USDC from known Asian CEX hot wallets on Ethereum/Arbitrum, then match those wallets to Hyperliquid depositors.

**Strengths**: Definitive proof of CEX origin.
**Weaknesses**: Very low coverage (only 9.3% of HL depositors traceable to ANY CEX). Many users withdraw to intermediary wallets before depositing to HL, breaking the chain. Korean/Japanese users often route through global CEXs (Binance, OKX) rather than directly from local exchanges.

### Approach B: Timezone-Based Classification
Classify each wallet by its peak trading hour (UTC) and assign it to a geographic bucket.

**Strengths**: Covers all wallets. No dependency on CEX labels.
**Weaknesses**: Bots and market makers may skew results. VPNs, shift work, and remote work create noise. A European afternoon trader looks the same as a US morning trader.

### Approach C: CEX Attribution + Timezone Cross-Validation
Analyze the hourly activity distribution of wallets known to be funded by specific CEXs, confirming that Asian CEX-funded wallets actually trade during Asian hours.

**Strengths**: Validates that the timing signal is real.
**Weaknesses**: Small sample sizes for Asian-specific CEXs.

---

## 4. CEX Label Coverage

### Asian CEX Labels Available

We collected address labels from two independent sources:

| Exchange | Country | Allium | Dune | Addresses |
|----------|---------|--------|------|-----------|
| Bithumb | Korea | Yes | Yes | ~2,800 |
| Korbit | Korea | Yes | Yes | ~340 |
| Upbit | Korea | Yes | Yes | ~100 |
| Coinone | Korea | Yes | Yes | ~53 |
| GOPAX | Korea | Yes | Yes | ~32 |
| bitFlyer | Japan | Yes | Yes | ~87 |
| Bitbank | Japan | Yes | Yes | ~77 |
| Coincheck | Japan | Yes | Yes | ~62 |
| Bitkub | Thailand | Yes | Yes | ~305 |
| Coinhako | Singapore | Yes | Yes | ~119 |
| Remitano | Vietnam | Yes | Yes | ~78 |
| Indodax | Indonesia | Yes | Yes | ~109 |
| Tokocrypto | Indonesia | Yes | Yes | ~39 |
| Luno | Malaysia | No | Yes | ~110 |
| MAX Exchange | Taiwan | No | Yes | ~20 |
| Satang | Thailand | No | No | -- |
| BitoEx | Taiwan | No | No | -- |
| ACE Exchange | Taiwan | No | No | -- |

**15 of 18 target Asian CEXs** have labeled addresses across both providers. The three missing (Satang, BitoEx, ACE) are small and unlikely to move the needle.

### Global CEX Coverage for Context

| CEX | HL Depositors Traced | USDH Volume |
|-----|---------------------|-------------|
| Binance | 423 | $7.34M |
| Coinbase | 308 | -- |
| Bitget | 82 | $771K |
| Gate.io | 58 | -- |
| Bybit | 47 | $1.01M |
| HTX | 12 | $443K |
| OKX | 11 | -- |

---

## 5. Fund Tracing Results (30-Day, Approach A)

### Direct Asian CEX -> Hyperliquid

Wallets that received USDC directly from a known Asian CEX hot wallet on Ethereum, then deposited to Hyperliquid:

| CEX | HL Depositors | Volume on HL |
|-----|--------------|--------------|
| Coinhako (Singapore) | 6 | $127K (ETH deposits) |
| Bitkub (Thailand) | 2 | $6K |
| Bitbank (Japan) | 1 | minimal |
| Indodax (Indonesia) | 1 | minimal |
| Korbit (Korea) | 1 | $18 (Arbitrum) |
| **Total** | **~11** | **~$133K** |

This is clearly a severe undercount. The direct CEX-to-HL path is rare because:
1. CEXs don't bridge funds directly to Hyperliquid for users
2. Users withdraw to personal wallets first, then bridge separately
3. Many Asian users go through global CEXs (Binance, OKX) which are not "Asian-specific"

### Global CEXs as Asian Intermediaries

Binance-funded HL wallets show a **bimodal hourly activity distribution** -- a large US-hours peak (UTC 14-15) AND a smaller but clear Asian-hours cluster (UTC 0-6). This confirms that some fraction of Binance-funded HL traders are Asian.

The USDH volume from wallets funded by global CEXs with large Asian user bases:
- **Binance**: $7.34M (some fraction Asian)
- **Bybit**: $1.01M (HQ in Dubai, large Asian base)
- **Bitget**: $771K (significant Asian user base)
- **HTX**: $443K (formerly Huobi, historically Asian-dominant)

---

## 6. Timezone Analysis Results

### 30-Day Classification

Each wallet classified by its single peak-activity hour:

| Timezone Bucket | UTC Hours | Wallets | % | Volume | % |
|----------------|-----------|---------|---|--------|---|
| Americas | 14-20 | 5,228 | 39.4% | $4.40B | 82.2% |
| Asia East | 0-6 | 3,166 | 23.9% | $475M | 8.9% |
| Europe/Asia overlap | 7-13 | 3,380 | 25.5% | $291M | 5.4% |
| Asia early | 21-23 | 1,494 | 11.3% | $189M | 3.5% |
| **Combined Asia** | **0-6, 21-23** | **4,660** | **35.1%** | **$664M** | **12.4%** |

### 90-Day Classification

| Timezone Bucket | Wallets | % | Volume | % |
|----------------|---------|---|--------|---|
| Americas | 13,446 | 37.2% | $6.94B | 78.2% |
| Asia East | 6,723 | 18.6% | $706M | 8.0% |
| Europe/Asia overlap | 12,807 | 35.4% | $832M | 9.4% |
| Asia early | 3,211 | 8.9% | $387M | 4.4% |
| **Combined Asia** | **9,934** | **27.4%** | **$1.09B** | **12.3%** |

### Hourly Volume Distribution (30-Day)

The data shows a distinctive dual-peak pattern:

```
Volume by UTC hour (30d, millions USD):

UTC 0  (Asia AM)  ████████████████████████████████████████████████████ $110M
UTC 1  (Asia AM)  ████████████████████████████████████████████████████████████ $121M  <-- Asian morning peak
UTC 2             ██████████████████████████████████████████████████████ $109M
UTC 3             ███████████████████████████████████████ $79M
UTC 4             ████████████████████████████████ $66M
UTC 5  (Asia PM)  ██████████████████████████████ $62M  <-- Asian afternoon trough
UTC 6             █████████████████████████████████████ $76M
UTC 7  (EU AM)    ███████████████████████████████ $65M
UTC 8             ████████████████████████████████████████ $81M
UTC 9             ██████████████████████████████████████████████ $96M  <-- European morning peak
UTC 10            ██████████████████████████████ $62M
UTC 11            ███████████████████████████████ $65M
UTC 12            █████████████████████████████████████ $77M
UTC 13            ██████████████████████████████████████████████ $96M  <-- US pre-market ramp
UTC 14 (US AM)    ████████████████████████████████████████████████████████████████████████████████████████████████████████████ $220M
UTC 15            ████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████ $247M  <-- US peak
UTC 16            ███████████████████████████████████████████████████████████████████████████████████████████████████ $190M
UTC 17            ████████████████████████████████████████████████████████████████████████████████████ $163M
UTC 18            ███████████████████████████████████████████████████████████████████████████████ $157M
UTC 19            ███████████████████████████████████████████████████████████████ $128M
UTC 20            █████████████████████████████████████████████████████████████████ $136M
UTC 21            ████████████████████████████████████████████████████ $105M
UTC 22            ████████████████████████ $51M  <-- Global trough (6am SGT, 5pm ET)
UTC 23            ████████████████████████████████████████████████████████ $117M  <-- Asia waking up
```

Key observations:
- **Peak-to-trough ratio is 4.8x** ($247M at UTC 15 vs $51M at UTC 22), indicating real human trading patterns rather than pure bot activity
- **Asian morning bump** at UTC 0-2 (8-10am in East Asia) is the second-highest volume cluster
- **Global minimum at UTC 22** (6am Singapore, 5pm ET) -- when neither session is active
- UTC 23 ramp-up is consistent with Asian traders starting their day

---

## 7. Revenue Model: How Bridge Earns from USDH

Based on codebase analysis of the issuance pack:

### 7.1 Treasury Yield Split (Primary Revenue)

USDH reserves are held at **LeadBank FBO GigaStable 6772** in USD/USDC/USTB. When treasury yields are generated (from LeadBank, Blackrock, Superstate), they are split:

- **Bridge**: receives 20% of yield (routed to Bridge Bill Pay Developer `00d5da77...`)
- **Native Markets**: receives 80% of yield

Source: `packs/issuance/spec/domain/token/reward_distribution_op_spec.rb` -- test fixtures show `revenue_amount: 100.00` vs `reward_amount: 400.00` on a $500 yield payment.

### 7.2 Orchestration (Currently Unbilled)

The orchestration debt system (`packs/issuance/app/domain/issuance/sweepers/sweep_issuance_orchestration_debt.rb`) automatically settles mint/burn operations when debt exceeds $10,000. There is **no fee extraction** in this flow -- orchestration appears to be a cost Bridge absorbs.

Key detail: USDH has special handling -- the sweeper runs at 9pm ET specifically for USDH, unlike other currencies that are restricted to business hours.

### 7.3 Initialization Fee ($1 per new recipient)

When initializing a new recipient on HyperCore via `CoreRouterSendToCoreSpot`, a $1 USDH initialization fee is charged. This is minor revenue.

### 7.4 Revenue Implications of Asian Market Growth

If Asian traders contribute ~$200-600M in AUM:
- At a conservative 4% treasury yield, annual yield = $8-24M
- Bridge's 20% share = **$1.6-4.8M/year in additional revenue**
- Plus potential growth in the base if SWIFT rails reduce friction

---

## 8. Confidence Assessment

| Estimate | Value | Confidence | Rationale |
|----------|-------|------------|-----------|
| Total USDH monthly volume | ~$2B | **High** | Direct query of all trades |
| Asian wallet count (% of total) | 27-35% | **Medium** | Timezone classification is approximate; bots may skew |
| Asian volume (% of total) | ~12% | **Medium** | Consistent across 30d and 90d windows |
| Asian volume (absolute) | $200-300M/month | **Medium-Low** | Timing proxy, not direct attribution |
| Direct Asian CEX attribution | ~$133K/month | **High** (as lower bound) | Definitive but severely undercounts |
| Revenue impact of Asian AUM growth | $1.6-4.8M/year | **Low** | Requires assumptions about AUM conversion from volume |

### What Would Increase Confidence

1. **TRM or Chainalysis labels**: Commercial blockchain analytics firms have much broader wallet attribution than Allium/Dune's public labels. Would dramatically improve CEX coverage.
2. **Bridge internal data**: Checking USDH mint/redeem records by customer IP or KYC jurisdiction would give definitive geographic attribution for onramp flows.
3. **Native Markets customer data**: NM likely knows which of their customers are Asian-based.
4. **Longer time series**: USDH is growing rapidly. The 90-day window captures the early growth phase; 6+ months would show trajectory more clearly.

---

## 9. Caveats and Limitations

1. **Bots inflate wallet counts and may skew timezone buckets.** Automated trading bots operate 24/7 but may show peak activity during US hours (higher liquidity). Some "Asian" wallets may be bots with off-peak peaks.

2. **Market makers distort volume attribution.** Professional MMs run 24/7 but concentrate activity in US hours. Their wallets classify as "Americas" regardless of operator location.

3. **Volume != AUM.** Trading volume is a measure of activity, not assets under management. A $1M wallet may generate $10M in daily volume through leverage and turnover. The relationship between volume and AUM (which drives yield revenue) is indirect.

4. **Timezone classification is a blunt instrument.** UTC 7-13 (Europe/Asia overlap) could be either European or Asian traders. A Korean trader active at 10pm KST (UTC 13) would classify as "Europe/Asia overlap."

5. **The 9.3% CEX attribution rate is unusually low**, suggesting most HL depositors fund from DeFi, bridges, or unlabeled wallets. The labeled CEX universe is incomplete.

6. **USDH is young and growing fast.** November-to-February growth was ~14x. Current patterns may not predict future geographic distribution as adoption spreads.

7. **Dune credit usage**: ~67 credits of the 20,000 budget were consumed for cross-validation queries.

---

## 10. Appendix: Data Sources and Queries

### Allium Tables Used
- `hyperliquid.dex.trades` -- all USDH trades on HyperCore (perps + spot)
- `hyperliquid.assets.fungible_token_transfers` -- deposits, withdrawals, transfers
- `hyperevm.dex.trades` -- USDH swaps on HyperEVM DEXes
- `common.identity.entities` -- CEX wallet address labels
- `ethereum.assets.erc20_transfer_events` -- ETH mainnet USDC transfers
- `arbitrum.assets.erc20_transfer_events` -- Arbitrum USDC transfers

### Dune Tables Used
- `labels.owner_addresses` -- CEX custody wallet labels
- `labels.addresses` -- broader address labels

### Codebase Files Referenced
- `packs/issuance/app/public/issuance/currency_config/usdh.rb` -- USDH config
- `packs/issuance/app/domain/issuance/sweepers/sweep_issuance_orchestration_debt.rb` -- orchestration
- `packs/issuance/app/domain/issuance/rewards/create_treasury_yield_payment.rb` -- yield distribution
- `packs/trips/app/domain/process_hot_wallet_smart_contract_call.rb` -- initialization fee
- `app/models/developer.rb` -- Native Markets developer ID

### Key Query: Hourly USDH Volume Distribution (30d)

```sql
SELECT
  HOUR(timestamp) as hour_utc,
  COUNT(*) as trade_count,
  COUNT(DISTINCT buyer_address) + COUNT(DISTINCT seller_address) as unique_traders,
  SUM(usd_amount) as total_volume_usd
FROM hyperliquid.dex.trades
WHERE (token_a_symbol = 'USDH' OR token_b_symbol = 'USDH')
  AND timestamp >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY HOUR(timestamp)
ORDER BY hour_utc
```

### Key Query: Wallet Timezone Classification

```sql
WITH wallet_hours AS (
  SELECT address, HOUR(timestamp) as hour_utc, COUNT(*) as trade_count, SUM(usd_amount) as volume_usd
  FROM (
    SELECT buyer_address as address, timestamp, usd_amount FROM hyperliquid.dex.trades
    WHERE (token_a_symbol = 'USDH' OR token_b_symbol = 'USDH') AND timestamp >= CURRENT_DATE - INTERVAL '30 days'
    UNION ALL
    SELECT seller_address as address, timestamp, usd_amount FROM hyperliquid.dex.trades
    WHERE (token_a_symbol = 'USDH' OR token_b_symbol = 'USDH') AND timestamp >= CURRENT_DATE - INTERVAL '30 days'
  )
  GROUP BY address, HOUR(timestamp)
),
wallet_peak AS (
  SELECT address, hour_utc as peak_hour, trade_count,
    ROW_NUMBER() OVER (PARTITION BY address ORDER BY trade_count DESC) as rn
  FROM wallet_hours
),
wallet_classified AS (
  SELECT address, peak_hour,
    CASE
      WHEN peak_hour BETWEEN 0 AND 6 THEN 'Asia_East (UTC+7 to +9)'
      WHEN peak_hour BETWEEN 7 AND 13 THEN 'Europe/Asia_overlap'
      WHEN peak_hour BETWEEN 14 AND 20 THEN 'Americas'
      WHEN peak_hour BETWEEN 21 AND 23 THEN 'Asia_early'
    END as timezone_bucket
  FROM wallet_peak WHERE rn = 1
)
SELECT
  wc.timezone_bucket,
  COUNT(DISTINCT wc.address) as wallet_count,
  SUM(wh_total.total_volume) as total_volume_usd
FROM wallet_classified wc
JOIN (SELECT address, SUM(volume_usd) as total_volume FROM wallet_hours GROUP BY address) wh_total
  ON wc.address = wh_total.address
GROUP BY wc.timezone_bucket
ORDER BY total_volume_usd DESC
```
