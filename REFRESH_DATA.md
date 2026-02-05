# How to Refresh Dashboard Data

## ✅ Recommended Method: Use Claude Code

The easiest way to refresh data is to ask Claude Code in this directory:

```bash
cd /Users/jackiez/stripe/monorail/usdh-dashboard
claude
```

Then say:

> "Please refresh all dashboard data files by running each query in queries.sql using mcp__allium__explorer_run_sql and saving the results to the corresponding JSON files in data/"

Claude will:
1. Run each SQL query via Allium MCP
2. Format results as `{"data": [...]}`
3. Save to `data/*.json` files
4. Show you what was updated

## Manual Method: Query by Query

If you prefer to do it manually, here's the mapping:

### 1. Lending Data
**File**: `data/lending_data.json`
**Query**: Lines 32-68 in `queries.sql` (deposits + withdrawals)

### 2. DEX Trading by Project
**File**: `data/dex_data.json`
**Query**: Lines 70-85 in `queries.sql`

### 3. DEX Token Pairs
**File**: `data/dex_token_pairs_data.json`
**Query**: Lines 87-103 in `queries.sql`

### 4. HyperCore by Protocol
**File**: `data/hypercore_by_protocol_data.json`
**Query**: Lines 105-116 in `queries.sql`

### 5. HyperCore by Coin
**File**: `data/hypercore_by_coin_data.json`
**Query**: Lines 118-129 in `queries.sql`

### 6. HyperCore by Protocol & Coin
**File**: `data/hypercore_by_protocol_and_coin_data.json`
**Query**: Lines 131-143 in `queries.sql`

### 7. Daily Active Users
**File**: `data/daily_active_users_data.json`
**Query**: Lines 145-200 in `queries.sql` (the big UNION query)

### 8. HyperCore Total
**File**: `data/hypercore_data.json`
**Query**: Lines 202-211 in `queries.sql`

## After Refreshing Data

```bash
# Check what changed
git diff data/

# Test locally
npm run dev

# Commit and push
git add data/
git commit -m "Update dashboard data - $(date +%Y-%m-%d)

GIT_VALID_PII_OVERRIDE - contains public USDH contract address"
git push origin master

# Vercel auto-deploys within 2-3 minutes
```

## Example: Refresh Using MCP in Claude Code

```
You: Please run this query and save to data/lending_data.json:
[paste lending query from queries.sql]

Claude: [runs mcp__allium__explorer_run_sql, formats, saves]
```

## Verification

After refreshing:

```bash
# Check row counts
jq '.data | length' data/lending_data.json
jq '.data | length' data/dex_data.json
# ... etc

# Check latest date
jq -r '.data[-1].date' data/lending_data.json
```

## Frequency

Recommended refresh schedule:
- **Daily**: During high-activity periods
- **Weekly**: For regular monitoring
- **On-demand**: Before presentations or reports
