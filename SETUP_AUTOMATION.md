# Setup Automated Data Refresh

This dashboard uses GitHub Actions to automatically refresh data from Allium every day at 2 AM UTC.

## Prerequisites

You need an Allium API key from: https://app.allium.so/settings/api-keys

## Setup Instructions

### 1. Add Allium API Key to GitHub Secrets

1. Go to your repository on GitHub: https://github.com/agaperste/usdh-dashboard
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Set:
   - **Name**: `ALLIUM_API_KEY`
   - **Secret**: Your Allium API key (starts with `allium_...`)
5. Click **Add secret**

### 2. Verify Setup

The workflow will run automatically, but you can test it manually:

1. Go to **Actions** tab in your GitHub repo
2. Click **Refresh Dashboard Data** workflow
3. Click **Run workflow** dropdown → **Run workflow**
4. Watch it execute (takes ~1-2 minutes)
5. Check the **data/** folder to see if files were updated

### 3. Monitor Automated Runs

- **Schedule**: Runs daily at 2 AM UTC (6 PM PST / 9 PM EST)
- **View runs**: Go to Actions tab → Refresh Dashboard Data
- **Notifications**: GitHub emails you if a run fails

### Workflow Details

The automation:
1. ✅ Fetches fresh data from Allium API
2. ✅ Updates all JSON files in `data/` directory
3. ✅ Commits changes with timestamp
4. ✅ Pushes to main branch
5. ✅ Triggers Vercel deployment automatically

### Manual Data Refresh

If you need to refresh data manually:

```bash
# Set your API key
export ALLIUM_API_KEY="your_key_here"

# Run the fetch script
npm run fetch-data
```

### Troubleshooting

**Workflow fails with "ALLIUM_API_KEY not set"**
- Verify the secret name is exactly `ALLIUM_API_KEY` (case-sensitive)
- Regenerate the API key on Allium and update the secret

**No new data after workflow runs**
- Check the workflow logs in Actions tab
- Verify your Allium API key has permissions for the queries
- Ensure you're on a paid Allium plan (free tier may have limits)

**Data refresh but Vercel doesn't deploy**
- Vercel auto-deploys on every push to main
- Check Vercel dashboard for deployment logs
- Deployment usually takes 2-3 minutes after push

### Workflow File

The automation is defined in: `.github/workflows/refresh-data.yml`

To change the schedule, edit the `cron` expression:
```yaml
schedule:
  - cron: '0 2 * * *'  # Daily at 2 AM UTC
```

Examples:
- `0 */6 * * *` - Every 6 hours
- `0 0 * * 0` - Weekly on Sunday at midnight
- `0 12 * * 1-5` - Weekdays at noon UTC

## Testing Locally

Before pushing, test the script locally:

```bash
# Install dependencies
npm install

# Set API key
export ALLIUM_API_KEY="your_key_here"

# Run fetch script
npm run fetch-data

# Verify data files updated
ls -lh data/
```
