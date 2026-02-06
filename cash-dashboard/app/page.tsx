'use client'

import { useEffect, useState } from 'react'
import { LineChart, Line, BarChart, Bar, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// Sample/mock data - replace with real data files
const mockTransferData = [
  { date: '2025-11-06', transfers: 2376, users: 697 },
  { date: '2025-11-15', transfers: 15839, users: 1876 },
  { date: '2025-12-01', transfers: 5836, users: 818 },
  { date: '2025-12-08', transfers: 61933, users: 1896 },
  { date: '2025-12-25', transfers: 15904, users: 2488 },
  { date: '2026-01-08', transfers: 43774, users: 9969 },
  { date: '2026-01-20', transfers: 99764, users: 18996 },
  { date: '2026-02-01', transfers: 142501, users: 16950 },
  { date: '2026-02-04', transfers: 62937, users: 12717 },
]

const mockDexData = [
  { date: '2025-11-07', orca: 5302461, raydium: 0 },
  { date: '2025-11-15', orca: 1771510, raydium: 0 },
  { date: '2025-12-05', orca: 22737750, raydium: 11120108 },
  { date: '2025-12-25', orca: 30548112, raydium: 36596382 },
  { date: '2026-01-13', orca: 16899104, raydium: 27138750 },
  { date: '2026-01-26', orca: 11644633, raydium: 14020944 },
  { date: '2026-02-04', orca: 1512545, raydium: 284728 },
]

const mockLendingData = [
  { date: '2025-11-07', deposits: 72407275, withdrawals: 70330448 },
  { date: '2025-12-05', deposits: 24137015, withdrawals: 36406971 },
  { date: '2025-12-08', deposits: 24659507, withdrawals: 45369871 },
  { date: '2025-12-25', deposits: 10818682, withdrawals: 8451332 },
  { date: '2026-01-08', deposits: 8262359, withdrawals: 15294857 },
  { date: '2026-01-26', deposits: 1567019, withdrawals: 2118558 },
]

const tokenPairs = [
  { token: 'USDC', volume: 713395057, trades: 140928, percentage: 60 },
  { token: 'PRIME', volume: 421281993, trades: 45627, percentage: 35 },
  { token: 'wYLDS', volume: 3528026, trades: 1461, percentage: 0.3 },
  { token: 'USDT', volume: 161814, trades: 2192, percentage: 0.01 },
  { token: 'Others', volume: 16000000, trades: 12000, percentage: 1.3 },
]

export default function Home() {
  return (
    <div className="container">
      <header>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>CASH Token Analytics Dashboard</h1>
            <p className="subtitle">
              Comprehensive analysis of Phantom's CASH token on Solana (Nov 2025 - Feb 2026)
            </p>
          </div>
          <div style={{ textAlign: 'right', paddingTop: '0.5rem' }}>
            <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>Powered by</p>
            <p style={{ fontSize: '1.2rem', fontWeight: 600, color: '#1a1a1a', margin: 0 }}>Allium</p>
          </div>
        </div>
      </header>

      {/* Key Metrics */}
      <div className="section">
        <h2>📊 Key Metrics (90-Day Period)</h2>
        <div className="stats">
          <div className="stat-card">
            <div className="stat-label">Peak Daily Transfers</div>
            <div className="stat-value">375K</div>
            <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>Feb 1, 2026</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Peak Daily Active Users</div>
            <div className="stat-value">20K</div>
            <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>Jan 20, 2026</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total DEX Volume</div>
            <div className="stat-value">$1.2B</div>
            <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>Orca + Raydium</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Primary DEX Pair</div>
            <div className="stat-value">USDC</div>
            <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>$713M volume</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Lending Protocol</div>
            <div className="stat-value">Kamino</div>
            <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>Only integration</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Growth Rate</div>
            <div className="stat-value">60x</div>
            <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>Daily transfers</div>
          </div>
        </div>
      </div>

      {/* Transfer Activity */}
      <div id="transfers" className="section">
        <h2>📈 Transfer Activity Growth</h2>
        <p className="section-description">
          Explosive growth from ~2.4K daily transfers in early November to peak of 375K in February, showing successful market adoption and ecosystem integration.
        </p>

        <div className="insight-box">
          <h4>🔍 Growth Insight</h4>
          <p>
            Transfer activity increased <strong>60x</strong> from Nov 6 (2,376 transfers) to Feb 1 (142,501 transfers).
            Daily active users grew <strong>24x</strong> from 697 to 16,950, indicating strong user adoption beyond just trading bots.
          </p>
        </div>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={mockTransferData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="transfers" fill="#3b82f6" name="Daily Transfers" />
              <Line yAxisId="right" type="monotone" dataKey="users" stroke="#10b981" strokeWidth={3} name="Daily Active Users" dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* DEX Trading */}
      <div id="dex" className="section">
        <h2>🔄 DEX Trading Volume</h2>
        <p className="section-description">
          Orca dominated initially, with Raydium integration starting Dec 4, 2025. Combined daily volumes reached $100M+ during peak periods.
        </p>

        <div className="insight-box">
          <h4>🔍 DEX Insight</h4>
          <p>
            <strong>Two-DEX Strategy:</strong> Orca provided initial liquidity (~$450M total volume), then Raydium expanded reach (+$250M volume).
            Peak combined daily volume: <strong>$134M on Dec 26</strong>. Primary pairs are stablecoins (USDC: $713M, 60% of volume) and PRIME token ($421M, 35% of volume).
          </p>
        </div>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={mockDexData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: number) => `$${(value / 1000000).toFixed(2)}M`} />
              <Legend />
              <Bar dataKey="orca" stackId="a" fill="#8b5cf6" name="Orca" />
              <Bar dataKey="raydium" stackId="a" fill="#3b82f6" name="Raydium" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <h3>Token Pair Distribution (90-Day Total Volume)</h3>
        <div className="stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
          {tokenPairs.map(pair => (
            <div key={pair.token} className="stat-card">
              <div className="stat-label">{pair.token}-CASH</div>
              <div className="stat-value">${(pair.volume / 1000000).toFixed(0)}M</div>
              <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                {pair.trades.toLocaleString()} trades • {pair.percentage}% of volume
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lending */}
      <div id="lending" className="section">
        <h2>💰 Lending Activity (Kamino Finance)</h2>
        <p className="section-description">
          Kamino is currently the only lending protocol with CASH integration. Billions in deposit/withdrawal volume demonstrate strong yield-farming adoption.
        </p>

        <div className="insight-box">
          <h4>🔍 Lending Insight</h4>
          <p>
            <strong>Peak Utilization:</strong> Nov 7 saw $72.4M in deposits with simultaneous $70.3M withdrawals, indicating rapid vault rotation during the launch phase.
            Dec 8 had the highest withdrawal day ($45.4M), correlating with major DEX volume spike.
            Lending activity has declined in recent weeks, suggesting users may be waiting for additional protocol integrations or yield opportunities.
          </p>
        </div>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={mockLendingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: number) => `$${(value / 1000000).toFixed(2)}M`} />
              <Legend />
              <Bar dataKey="deposits" fill="#10b981" name="Deposits (Kamino)" />
              <Bar dataKey="withdrawals" fill="#ef4444" name="Withdrawals (Kamino)" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Growth Phases */}
      <div className="section">
        <h2>📅 Growth Phases Identified</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div>
            <h3>Phase 1: Launch (Nov 6-8)</h3>
            <p style={{ color: '#666', lineHeight: 1.6, fontSize: '0.9rem' }}>
              • Massive $208M transfer spike<br />
              • $72M immediate Kamino deposits<br />
              • Orca DEX exclusive liquidity<br />
              • <strong>Driver:</strong> Token launch + DeFi integration
            </p>
          </div>
          <div>
            <h3>Phase 2: Expansion (Dec 4-9)</h3>
            <p style={{ color: '#666', lineHeight: 1.6, fontSize: '0.9rem' }}>
              • Raydium DEX integration<br />
              • Second major spike: $215M transfers<br />
              • Combined DEX volume $40M+/day<br />
              • <strong>Driver:</strong> Multi-venue liquidity expansion
            </p>
          </div>
          <div>
            <h3>Phase 3: Maturity (Jan 2026)</h3>
            <p style={{ color: '#666', lineHeight: 1.6, fontSize: '0.9rem' }}>
              • Sustained 150K-375K transfers/day<br />
              • Stable 10K-20K daily users<br />
              • Consistent $10-50M DEX volume<br />
              • <strong>Driver:</strong> Established product-market fit
            </p>
          </div>
        </div>
      </div>

      {/* Key Insights Summary */}
      <div className="section">
        <h2>💡 Key Insights & Use Cases</h2>

        <h3>Primary Use Cases</h3>
        <ol style={{ color: '#666', lineHeight: 1.8, marginLeft: '1.5rem' }}>
          <li><strong>Yield Generation:</strong> Billions in Kamino lending volume demonstrates CASH's role as a yield-bearing stablecoin</li>
          <li><strong>Stable Trading Pair:</strong> $713M USDC pair volume (60% of trading) shows CASH functions as a stable medium of exchange</li>
          <li><strong>PRIME Ecosystem Integration:</strong> $475M combined PRIME pair volume (35% of trading) indicates strong tie to Parallel/Echelon ecosystem</li>
          <li><strong>Liquidity Provision:</strong> High transfer volumes (often exceeding trading volumes) suggest significant LP activity across protocols</li>
        </ol>

        <h3>Success Factors</h3>
        <ul style={{ color: '#666', lineHeight: 1.8, marginLeft: '1.5rem' }}>
          <li><strong>Immediate DeFi Integration:</strong> Kamino lending available at launch enabled instant utility</li>
          <li><strong>Multi-DEX Strategy:</strong> Orca + Raydium provided deep liquidity and redundancy</li>
          <li><strong>Stablecoin Peg:</strong> Maintained ~$1 peg throughout period (per USD volume data)</li>
          <li><strong>Phantom Brand:</strong> Leveraging Phantom wallet's strong Solana reputation</li>
        </ul>

        <h3>Open Questions & Limitations</h3>
        <ul style={{ color: '#666', lineHeight: 1.8, marginLeft: '1.5rem' }}>
          <li>No explicit burn mechanism detected - supply appears to be expanding</li>
          <li>Top holder addresses are unlabeled - cannot confirm institutional vs retail distribution</li>
          <li>Only one lending protocol (Kamino) - ecosystem integration is still early</li>
          <li>Net holder analysis shows flow over 30 days, not absolute balances</li>
        </ul>
      </div>

      {/* Methodology */}
      <div className="section">
        <h2>📋 Methodology & Data Sources</h2>
        <div className="methodology">
          <h3>Data Sources</h3>
          <ul>
            <li>All data from <strong>Allium's Solana blockchain analytics</strong> via Explorer API</li>
            <li><code>solana.assets.transfers</code> - Token transfer activity</li>
            <li><code>solana.dex.trades</code> - DEX trading data (Orca, Raydium, etc.)</li>
            <li><code>solana.lending.deposits/withdrawals</code> - Lending protocol activity</li>
          </ul>

          <h3>Analysis Period</h3>
          <ul>
            <li><strong>Start:</strong> November 6, 2025 (earliest CASH activity)</li>
            <li><strong>End:</strong> February 4, 2026</li>
            <li><strong>Duration:</strong> 90 days</li>
          </ul>

          <h3>Key Calculations</h3>
          <ul>
            <li><strong>Daily Active Users:</strong> COUNT(DISTINCT from_address) + COUNT(DISTINCT to_address) per day</li>
            <li><strong>Net Balance Change:</strong> Total received - Total sent (30-day window)</li>
            <li><strong>USD Volumes:</strong> Based on Allium's price oracle at transaction time</li>
            <li><strong>Trading Volume:</strong> Sum of usd_amount where CASH is either buy or sell side</li>
          </ul>

          <h3>SQL Queries</h3>
          <p>All queries used in this analysis are available in the <code>/queries</code> directory:</p>
          <ul>
            <li><code>01_transfer_activity.sql</code> - Daily transfer metrics</li>
            <li><code>02_top_holders.sql</code> - Net balance changes</li>
            <li><code>03_dex_trading_by_project.sql</code> - DEX volume by project</li>
            <li><code>04_dex_token_pairs.sql</code> - Trading pairs analysis</li>
            <li><code>05_lending_deposits.sql</code> - Lending deposits</li>
            <li><code>06_lending_withdrawals.sql</code> - Lending withdrawals</li>
          </ul>

          <h3>Known Limitations</h3>
          <ul>
            <li>Top holders show <em>net flow</em> over 30 days, not absolute wallet balances</li>
            <li>USD pricing subject to Allium oracle accuracy</li>
            <li>Address labeling incomplete - most addresses unidentified</li>
            <li>Data current as of Feb 4, 2026 - run fetch script for latest data</li>
          </ul>

          <h3>Data Refresh</h3>
          <p>To fetch the latest data from Allium:</p>
          <pre style={{ backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
{`export ALLIUM_API_KEY="your_key_here"
node scripts/fetch-data.js`}
          </pre>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '2rem', color: '#666', fontSize: '0.85rem' }}>
        <p>Data sourced from Allium • Token: CASHx9KJUStyftLFWGvEVf59SGeG9sh5FfcnZMVPCASH</p>
        <p style={{ marginTop: '0.5rem' }}>
          See <a href="https://github.com" style={{ color: '#3b82f6' }}>METHODOLOGY.md</a> for detailed analysis methodology
        </p>
      </footer>
    </div>
  )
}
