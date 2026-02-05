# Allium API 404 Error - Fix Required

## Problem

The GitHub Actions workflow fails with `404 Not Found` when trying to run SQL queries against Allium's REST API at `https://api.allium.so/api/v1/explorer/queries/run`.

**Root Cause**: Allium's public REST API requires **saved query IDs**, not raw SQL. The endpoint for running raw SQL queries doesn't exist or requires different authentication.

## Solutions

### Option 1: Use Saved Queries (RECOMMENDED)

This is the official supported method per Allium's documentation.

#### Setup Steps:

1. **Create queries in Allium App**:
   - Go to https://app.allium.so/explore
   - Create and save each of the 8 queries from `scripts/fetch-data.js`
   - Copy the query ID for each (format: `qry_xxxxx`)

2. **Update fetch-data.js**:
   ```javascript
   const QUERY_IDS = {
     lending_data: 'qry_abc123...',
     dex_data: 'qry_def456...',
     dex_token_pairs_data: 'qry_ghi789...',
     hypercore_by_protocol_data: 'qry_jkl012...',
     hypercore_by_coin_data: 'qry_mno345...',
     hypercore_by_protocol_and_coin_data: 'qry_pqr678...',
     hyperliquid_spot_data: 'qry_stu901...',
     daily_active_users_data: 'qry_vwx234...'
   };

   async function fetchData(queryName, queryId) {
     const url = `https://api.allium.so/api/v1/explorer/queries/${queryId}/run-async`;

     // POST to start query
     const runResponse = await axios.post(url, {}, {
       headers: { 'X-API-KEY': ALLIUM_API_KEY }
     });

     const runId = runResponse.data.run_id;

     // Poll for results
     let results;
     while (true) {
       const statusResponse = await axios.get(
         `https://api.allium.so/api/v1/explorer/query-runs/${runId}`,
         { headers: { 'X-API-KEY': ALLIUM_API_KEY } }
       );

       if (statusResponse.data.status === 'completed') {
         results = statusResponse.data.data;
         break;
       } else if (statusResponse.data.status === 'failed') {
         throw new Error(`Query failed: ${statusResponse.data.error}`);
       }

       await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
     }

     // Save results
     const outputPath = path.join(DATA_DIR, `${queryName}.json`);
     fs.writeFileSync(outputPath, JSON.stringify({ data: results }, null, 2));
   }
   ```

#### Pros:
- ✅ Official supported method
- ✅ Better performance (queries are optimized)
- ✅ Can add parameters to queries
- ✅ Query history in Allium App

#### Cons:
- ❌ Requires manual setup for 8 queries
- ❌ Need to update query IDs if queries change
- ❌ Async polling adds complexity

---

### Option 2: Contact Allium Support

Request API access for raw SQL queries.

#### Steps:
1. Contact Allium support: https://www.allium.so/contact
2. Ask for:
   - Raw SQL execution endpoint (if available)
   - Or elevated API tier that supports ad-hoc queries
   - Documentation for programmatic SQL execution

#### Pros:
- ✅ Keep existing query definitions in code
- ✅ No manual query setup needed
- ✅ Easier to maintain

#### Cons:
- ❌ May require paid/enterprise tier
- ❌ Might not be available

---

### Option 3: Local Fetch + Git Push (WORKAROUND)

Run data fetching locally and commit/push results.

#### Setup:
1. **Local script using MCP** (you can use the MCP tools that work):
   ```bash
   # Create a local fetch script that uses the working MCP tools
   # Run it manually or via cron
   npm run fetch-data-local  # Uses MCP
   git add data/
   git commit -m "Update data"
   git push
   ```

2. **Schedule locally** (macOS/Linux):
   ```bash
   # Add to crontab
   0 2 * * * cd /path/to/dashboard && npm run fetch-data-local && git push
   ```

#### Pros:
- ✅ Uses working MCP tools
- ✅ No API endpoint changes needed
- ✅ Works immediately

#### Cons:
- ❌ Requires your machine to be running
- ❌ Not true automation
- ❌ MCP server might have rate limits

---

### Option 4: Hybrid Approach

Create a local service that proxies MCP to REST API.

Run a small Express server locally that:
- Accepts REST API calls with SQL
- Forwards to Allium MCP server
- Returns results
- GitHub Actions calls your local proxy

#### Pros:
- ✅ Bridge between GH Actions and MCP
- ✅ Keep SQL in code

#### Cons:
- ❌ Complex setup
- ❌ Need always-on server
- ❌ Additional failure point

---

## Recommended Path Forward

**For immediate solution**: Use Option 3 (local fetch + push)

**For long-term solution**: Use Option 1 (saved queries) or request Option 2 (raw SQL API access)

## Next Steps

1. Choose an option above
2. Implement the solution
3. Test with manual workflow run
4. Enable scheduled automation once working

## Files to Update

- `scripts/fetch-data.js` - Change API call logic
- `.github/workflows/refresh-data.yml` - May need adjustments
- `SETUP_AUTOMATION.md` - Update instructions
