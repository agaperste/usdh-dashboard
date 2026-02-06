// This script saves the data we already collected during analysis
// Run with: node scripts/save-collected-data.js

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');

// Note: This is sample/aggregate data for dashboard development
// Run fetch-data.js with ALLIUM_API_KEY to get fresh data

const sampleData = {
  transfer_activity_summary: {
    nov_early: { avg_transfers: 4000, avg_users: 700 },
    jan_peak: { max_transfers: 374776, max_users: 16950, date: "2026-02-01" },
    total_days: 90
  },

  dex_summary: {
    orca_total_volume: 450000000, // $450M approx
    raydium_total_volume: 250000000, // $250M approx
    usdc_pair_volume: 713395057, // From earlier query
    prime_pair_volume: 421281993, // From earlier query
    top_pairs: [
      { token: "USDC", volume: 713395057, trades: 140928 },
      { token: "PRIME", volume: 421281993, trades: 45627 }
    ]
  },

  lending_summary: {
    project: "kamino",
    peak_deposit_day: { date: "2025-11-07", volume_usd: 72407275, depositors: 195 },
    peak_withdrawal_day: { date: "2025-12-08", volume_usd: 45369871, withdrawers: 77 },
    total_depositors_90d: 6500, // Approximate unique count
    total_withdrawers_90d: 4200  // Approximate unique count
  }
};

// Save sample data
fs.writeFileSync(
  path.join(DATA_DIR, '_summary.json'),
  JSON.stringify(sampleData, null, 2)
);

console.log('✓ Saved summary data to data/_summary.json');
console.log('\nTo fetch full data from Allium:');
console.log('1. Set ALLIUM_API_KEY environment variable');
console.log('2. Run: node scripts/fetch-data.js');
console.log('\nOr use Allium MCP tools directly for fresh queries.');
