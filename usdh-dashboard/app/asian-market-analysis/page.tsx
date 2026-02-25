'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  ComposedChart,
  Line,
} from 'recharts'
import rawData from '../../data/asian_market_analysis.json'

const formatCurrency = (value: number) => {
  if (Math.abs(value) >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`
  if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value.toFixed(0)}`
}

const formatNumber = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return value.toLocaleString()
}

const TIMEZONE_COLORS: Record<string, string> = {
  'Americas': '#3b82f6',
  'Asia East': '#ef4444',
  'Europe/Asia overlap': '#f59e0b',
  'Asia early': '#f97316',
}

const getHourColor = (hour: number) => {
  if (hour >= 0 && hour <= 6) return '#ef4444'    // Asia East - red
  if (hour >= 7 && hour <= 13) return '#f59e0b'   // Europe/Asia overlap - amber
  if (hour >= 14 && hour <= 20) return '#3b82f6'  // Americas - blue
  return '#f97316'                                  // Asia early - orange
}

const getHourRegion = (hour: number) => {
  if (hour >= 0 && hour <= 6) return 'Asia East'
  if (hour >= 7 && hour <= 13) return 'Europe/Asia'
  if (hour >= 14 && hour <= 20) return 'Americas'
  return 'Asia Early'
}

export default function AsianMarketAnalysis() {
  const [activeView, setActiveView] = useState<'30d' | '90d'>('30d')
  const data = rawData
  const stats = data.summary_stats
  const timezoneData = activeView === '30d' ? data.timezone_30d : data.timezone_90d

  const hourlyData = data.hourly_volume_30d.map(h => ({
    ...h,
    volume_m: h.volume_usd / 1_000_000,
    displayHour: `${h.hour_utc.toString().padStart(2, '0')}:00`,
    region: getHourRegion(h.hour_utc),
  }))

  const monthlyData = data.monthly_growth.map(m => ({
    ...m,
    volume_m: m.volume_usd / 1_000_000,
    volume_b: m.volume_usd / 1_000_000_000,
    trades_k: m.trade_count / 1_000,
  }))

  // Compute combined Asian stats for the active view
  const asianBuckets = timezoneData.filter(t => t.bucket === 'Asia East' || t.bucket === 'Asia early')
  const combinedAsianWallets = asianBuckets.reduce((s, t) => s + t.wallet_count, 0)
  const combinedAsianVolume = asianBuckets.reduce((s, t) => s + t.volume_usd, 0)
  const totalWallets = timezoneData.reduce((s, t) => s + t.wallet_count, 0)
  const totalVolume = timezoneData.reduce((s, t) => s + t.volume_usd, 0)

  const walletPieData = timezoneData.map(t => ({
    name: t.bucket,
    value: t.wallet_count,
    pct: t.pct_wallets,
  }))

  const volumePieData = timezoneData.map(t => ({
    name: t.bucket,
    value: t.volume_usd,
    pct: t.pct_volume,
  }))

  const navLinkStyle = {
    fontSize: '0.9rem',
    color: '#a0a0a0',
    textDecoration: 'none' as const,
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    transition: 'all 0.2s',
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    return (
      <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #3a3a3a', borderRadius: '6px', padding: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
        <p style={{ fontWeight: 600, marginBottom: '4px' }}>{d.displayHour} UTC</p>
        <p style={{ fontSize: '0.85rem', color: '#a0a0a0', marginBottom: '8px' }}>{d.label}</p>
        <p style={{ color: getHourColor(d.hour_utc), fontWeight: 600 }}>{formatCurrency(d.volume_usd)}</p>
        <p style={{ fontSize: '0.8rem', color: '#707070' }}>{formatNumber(d.trade_count)} trades &middot; {formatNumber(d.unique_traders)} traders</p>
      </div>
    )
  }

  return (
    <div className="container">
      {/* Navigation */}
      <nav style={{
        position: 'sticky',
        top: 0,
        backgroundColor: '#111111',
        borderBottom: '2px solid #2a2a2a',
        padding: '1rem 0',
        zIndex: 1000,
        marginBottom: '2rem',
      }}>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link href="/" style={navLinkStyle}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2a2a2a'; e.currentTarget.style.color = '#e5e5e5' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#a0a0a0' }}>
            USDH Dashboard
          </Link>
          <span style={{ color: '#4a4a4a' }}>|</span>
          <a href="#summary" style={navLinkStyle}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2a2a2a'; e.currentTarget.style.color = '#e5e5e5' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#a0a0a0' }}>
            Summary
          </a>
          <a href="#hourly" style={navLinkStyle}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2a2a2a'; e.currentTarget.style.color = '#e5e5e5' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#a0a0a0' }}>
            Hourly Pattern
          </a>
          <a href="#timezone" style={navLinkStyle}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2a2a2a'; e.currentTarget.style.color = '#e5e5e5' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#a0a0a0' }}>
            Geographic Split
          </a>
          <a href="#growth" style={navLinkStyle}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2a2a2a'; e.currentTarget.style.color = '#e5e5e5' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#a0a0a0' }}>
            Growth
          </a>
          <a href="#cex" style={navLinkStyle}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2a2a2a'; e.currentTarget.style.color = '#e5e5e5' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#a0a0a0' }}>
            CEX Attribution
          </a>
          <a href="#revenue" style={navLinkStyle}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2a2a2a'; e.currentTarget.style.color = '#e5e5e5' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#a0a0a0' }}>
            Revenue
          </a>
        </div>
      </nav>

      {/* Header */}
      <header>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>USDH Asian Market Analysis</h1>
            <p className="subtitle">
              Estimating Hyperliquid USDH volume from Asian markets (Korea, Japan, Taiwan, Singapore, Malaysia, Vietnam, Thailand)
            </p>
            <p style={{ fontSize: '0.8rem', color: '#707070', marginTop: '4px' }}>
              Data: Allium + Dune Analytics &middot; Period: Nov 27 2025 &ndash; Feb 25 2026
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', paddingTop: '0.5rem' }}>
            <button
              onClick={() => setActiveView('30d')}
              style={{
                padding: '6px 16px', borderRadius: '6px', border: '1px solid #3a3a3a', cursor: 'pointer',
                backgroundColor: activeView === '30d' ? '#8b5cf6' : '#1a1a1a',
                color: activeView === '30d' ? '#fff' : '#a0a0a0',
                fontWeight: activeView === '30d' ? 600 : 400,
                fontSize: '0.85rem',
              }}
            >30 Day</button>
            <button
              onClick={() => setActiveView('90d')}
              style={{
                padding: '6px 16px', borderRadius: '6px', border: '1px solid #3a3a3a', cursor: 'pointer',
                backgroundColor: activeView === '90d' ? '#8b5cf6' : '#1a1a1a',
                color: activeView === '90d' ? '#fff' : '#a0a0a0',
                fontWeight: activeView === '90d' ? 600 : 400,
                fontSize: '0.85rem',
              }}
            >90 Day</button>
          </div>
        </div>
      </header>

      {/* Executive Summary */}
      <div id="summary" className="section">
        <h2>Executive Summary</h2>
        <p className="section-description">
          USDH has a genuine but retail-dominated Asian user base. Asian-timezone wallets account for ~27-35% of traders but only ~12% of volume.
        </p>

        <div className="stats">
          <div className="stat-card">
            <div className="stat-label">Total USDH Volume ({activeView})</div>
            <div className="stat-value">{formatCurrency(activeView === '30d' ? stats.total_volume_30d : stats.total_volume_90d)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Unique Traders ({activeView})</div>
            <div className="stat-value">{formatNumber(activeView === '30d' ? stats.unique_traders_30d : stats.unique_traders_90d)}</div>
          </div>
          <div className="stat-card" style={{ borderLeft: '3px solid #ef4444' }}>
            <div className="stat-label">Asian Wallets ({activeView})</div>
            <div className="stat-value">{formatNumber(combinedAsianWallets)}</div>
            <div style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 500 }}>{((combinedAsianWallets / totalWallets) * 100).toFixed(1)}% of total</div>
          </div>
          <div className="stat-card" style={{ borderLeft: '3px solid #ef4444' }}>
            <div className="stat-label">Asian Volume ({activeView})</div>
            <div className="stat-value">{formatCurrency(combinedAsianVolume)}</div>
            <div style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 500 }}>{((combinedAsianVolume / totalVolume) * 100).toFixed(1)}% of total</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">HL Deposits (90d)</div>
            <div className="stat-value">{formatCurrency(stats.total_deposits_90d)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">CEX-Attributed Depositors</div>
            <div className="stat-value">{formatNumber(stats.cex_attributed_depositors)}</div>
            <div style={{ fontSize: '0.8rem', color: '#707070' }}>{stats.cex_attributed_pct}% of total</div>
          </div>
        </div>

        {/* Key finding callout */}
        <div style={{
          backgroundColor: '#291c04', border: '1px solid #f59e0b', borderRadius: '8px',
          padding: '16px 20px', marginTop: '16px',
        }}>
          <p style={{ fontWeight: 600, color: '#fbbf24', marginBottom: '4px' }}>Best Estimate</p>
          <p style={{ color: '#fcd34d', fontSize: '0.9rem', lineHeight: 1.6 }}>
            The addressable Asian USDH market is <strong>$50-150M/month</strong> in trading volume,
            implying an annualized AUM contribution of roughly <strong>$200-600M</strong>.
            At Bridge&apos;s 20% yield split on ~4% treasury yield, this represents <strong>$1.6-4.8M/year</strong> in additional revenue.
          </p>
        </div>
      </div>

      {/* Hourly Volume Distribution */}
      <div id="hourly" className="section">
        <h2>Hourly Volume Distribution (30d)</h2>
        <p className="section-description">
          USDH trading shows a clear dual-peak pattern: an Asian morning bump (UTC 0-2) and a dominant US session (UTC 14-16).
          The 4.8x peak-to-trough ratio indicates real human trading patterns, not pure bot activity.
        </p>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '24px', marginBottom: '12px', flexWrap: 'wrap' }}>
          {[
            { color: '#ef4444', label: 'Asia East (UTC 0-6)' },
            { color: '#f59e0b', label: 'Europe/Asia overlap (UTC 7-13)' },
            { color: '#3b82f6', label: 'Americas (UTC 14-20)' },
            { color: '#f97316', label: 'Asia early (UTC 21-23)' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: item.color }} />
              <span style={{ fontSize: '0.8rem', color: '#a0a0a0' }}>{item.label}</span>
            </div>
          ))}
        </div>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyData} margin={{ left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="displayHour" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 11, fill: '#a0a0a0' }} />
              <YAxis tickFormatter={(v: number) => `$${v}M`} tick={{ fill: '#a0a0a0' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="volume_m" name="Volume">
                {hourlyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getHourColor(entry.hour_utc)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Geographic Split */}
      <div id="timezone" className="section">
        <h2>Geographic Split by Timezone ({activeView})</h2>
        <p className="section-description">
          Wallets classified by peak trading hour. Asia has many wallets but small average size; Americas has fewer but much larger wallets.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          {/* Wallets pie */}
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', textAlign: 'center' }}>By Wallet Count</h3>
            <div style={{ height: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={walletPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%" cy="50%"
                    outerRadius={120}
                    label={({ name, pct }: any) => `${name} (${pct}%)`}
                    labelLine={{ strokeWidth: 1 }}
                  >
                    {walletPieData.map((entry) => (
                      <Cell key={entry.name} fill={TIMEZONE_COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatNumber(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Volume pie */}
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', textAlign: 'center' }}>By Volume</h3>
            <div style={{ height: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={volumePieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%" cy="50%"
                    outerRadius={120}
                    label={({ name, pct }: any) => `${name} (${pct}%)`}
                    labelLine={{ strokeWidth: 1 }}
                  >
                    {volumePieData.map((entry) => (
                      <Cell key={entry.name} fill={TIMEZONE_COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Avg volume per wallet */}
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>Average Volume per Wallet</h3>
          <div className="stats">
            {timezoneData.map(t => (
              <div key={t.bucket} className="stat-card" style={{ borderLeft: `3px solid ${TIMEZONE_COLORS[t.bucket]}` }}>
                <div className="stat-label">{t.bucket}</div>
                <div className="stat-value">{formatCurrency(t.volume_usd / t.wallet_count)}</div>
                <div style={{ fontSize: '0.8rem', color: '#707070' }}>{formatNumber(t.wallet_count)} wallets</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Growth */}
      <div id="growth" className="section">
        <h2>Monthly Growth Trajectory</h2>
        <p className="section-description">
          USDH trading volume has grown ~14x from December to February.
        </p>

        <div className="chart-container" style={{ height: '400px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={monthlyData} margin={{ left: 20, right: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="month" tick={{ fill: '#a0a0a0' }} />
              <YAxis yAxisId="left" tickFormatter={(v: number) => `$${v.toFixed(1)}B`} tick={{ fill: '#a0a0a0' }} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={(v: number) => `${v}K`} tick={{ fill: '#a0a0a0' }} />
              <Tooltip formatter={(value: number, name: string) => {
                if (name === 'Volume') return formatCurrency(value * 1_000_000)
                return `${formatNumber(value * 1_000)} trades`
              }} />
              <Legend />
              <Bar yAxisId="left" dataKey="volume_b" name="Volume" fill="#8b5cf6" barSize={60} />
              <Line yAxisId="right" dataKey="trades_k" name="Trades" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="stats" style={{ marginTop: '16px' }}>
          {monthlyData.map(m => (
            <div key={m.month} className="stat-card">
              <div className="stat-label">{m.month} {m.note && <span style={{ color: '#f59e0b' }}>({m.note})</span>}</div>
              <div className="stat-value">{formatCurrency(m.volume_usd)}</div>
              <div style={{ fontSize: '0.8rem', color: '#707070' }}>{formatNumber(m.trade_count)} trades &middot; {formatNumber(m.unique_traders)} traders</div>
            </div>
          ))}
        </div>
      </div>

      {/* CEX Attribution */}
      <div id="cex" className="section">
        <h2>CEX Fund-Source Attribution (30d)</h2>
        <p className="section-description">
          Wallets traced from known CEX hot wallets to Hyperliquid deposits. Only 9.3% of HL depositors are traceable to any CEX.
          Direct Asian CEX attribution shows negligible volume; most Asian users likely route through global CEXs.
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem',
          }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #3a3a3a', textAlign: 'left' }}>
                <th style={{ padding: '10px 16px', fontWeight: 600, color: '#a0a0a0' }}>Exchange</th>
                <th style={{ padding: '10px 16px', fontWeight: 600, color: '#a0a0a0' }}>Country</th>
                <th style={{ padding: '10px 16px', fontWeight: 600, color: '#a0a0a0', textAlign: 'right' }}>HL Depositors</th>
                <th style={{ padding: '10px 16px', fontWeight: 600, color: '#a0a0a0', textAlign: 'right' }}>USDH Volume</th>
              </tr>
            </thead>
            <tbody>
              {data.cex_attribution.map((row) => (
                <tr key={row.cex} style={{ borderBottom: '1px solid #2a2a2a' }}>
                  <td style={{ padding: '10px 16px', fontWeight: 500 }}>{row.cex}</td>
                  <td style={{ padding: '10px 16px', color: '#a0a0a0' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      backgroundColor: row.country.includes('Korea') || row.country.includes('Japan') || row.country.includes('Singapore') || row.country.includes('Thailand') || row.country.includes('Indonesia') || row.country.includes('Taiwan')
                        ? '#2a1515' : '#151f2a',
                      color: row.country.includes('Korea') || row.country.includes('Japan') || row.country.includes('Singapore') || row.country.includes('Thailand') || row.country.includes('Indonesia') || row.country.includes('Taiwan')
                        ? '#fca5a5' : '#93c5fd',
                    }}>
                      {row.country}
                    </span>
                  </td>
                  <td style={{ padding: '10px 16px', textAlign: 'right' }}>{row.hl_depositors}</td>
                  <td style={{ padding: '10px 16px', textAlign: 'right', fontFamily: 'monospace' }}>
                    {row.usdh_volume != null ? formatCurrency(row.usdh_volume) : <span style={{ color: '#4a4a4a' }}>&mdash;</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{
          backgroundColor: '#151f2a', border: '1px solid #3b82f6', borderRadius: '8px',
          padding: '16px 20px', marginTop: '16px',
        }}>
          <p style={{ fontWeight: 600, color: '#93c5fd', marginBottom: '4px' }}>Why direct attribution is low</p>
          <p style={{ color: '#bfdbfe', fontSize: '0.85rem', lineHeight: 1.6 }}>
            CEXs don&apos;t bridge funds directly to Hyperliquid for users. Users withdraw to personal wallets first, then bridge separately.
            Many Asian users go through global CEXs (Binance, OKX) rather than local exchanges.
            Binance-funded wallets show bimodal hourly activity &mdash; confirming some fraction are Asian.
          </p>
        </div>
      </div>

      {/* Revenue Model */}
      <div id="revenue" className="section">
        <h2>Revenue Model</h2>
        <p className="section-description">
          How Bridge earns from USDH and what Asian market growth would mean financially.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ backgroundColor: '#1a1a1a', borderRadius: '8px', padding: '20px', border: '1px solid #2a2a2a' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px', color: '#8b5cf6' }}>Treasury Yield Split (Primary)</h3>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.7 }}>
              USDH reserves held at LeadBank FBO GigaStable 6772 in USD/USDC/USTB.
              Yields from LeadBank, Blackrock, and Superstate are split:
            </p>
            <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
              <div style={{ flex: 1, backgroundColor: '#8b5cf6', color: '#fff', borderRadius: '6px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>20%</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>Bridge</div>
              </div>
              <div style={{ flex: 1, backgroundColor: '#4cd1a5', color: '#fff', borderRadius: '6px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>80%</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>Native Markets</div>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#1a1a1a', borderRadius: '8px', padding: '20px', border: '1px solid #2a2a2a' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px', color: '#ef4444' }}>Asian Market Revenue Impact</h3>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '12px' }}>
              If Asian traders contribute $200-600M in AUM:
            </p>
            <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
                  <td style={{ padding: '8px 0', color: '#a0a0a0' }}>Treasury yield (~4%)</td>
                  <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 500 }}>$8-24M/year</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
                  <td style={{ padding: '8px 0', color: '#a0a0a0' }}>Bridge&apos;s 20% share</td>
                  <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 600, color: '#8b5cf6' }}>$1.6-4.8M/year</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 0', color: '#a0a0a0' }}>Orchestration fees</td>
                  <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 500, color: '#707070' }}>Currently unbilled</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Methodology & Caveats */}
      <div className="section" style={{ backgroundColor: '#1a1a1a' }}>
        <h2>Methodology &amp; Caveats</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '12px' }}>
          <div style={{ padding: '16px', backgroundColor: '#111111', borderRadius: '6px', border: '1px solid #2a2a2a' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>Approach A: CEX Attribution</h4>
            <p style={{ fontSize: '0.8rem', color: '#a0a0a0', lineHeight: 1.5 }}>
              Trace wallets from known Asian CEX hot wallets to HL depositors. Definitive but low coverage (9.3%).
            </p>
          </div>
          <div style={{ padding: '16px', backgroundColor: '#111111', borderRadius: '6px', border: '1px solid #2a2a2a' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>Approach B: Timezone Classification</h4>
            <p style={{ fontSize: '0.8rem', color: '#a0a0a0', lineHeight: 1.5 }}>
              Classify wallets by peak trading hour. Covers all wallets but bots, MMs, and VPNs add noise.
            </p>
          </div>
          <div style={{ padding: '16px', backgroundColor: '#111111', borderRadius: '6px', border: '1px solid #2a2a2a' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>Approach C: Cross-Validation</h4>
            <p style={{ fontSize: '0.8rem', color: '#a0a0a0', lineHeight: 1.5 }}>
              Confirm Binance-funded wallets show bimodal activity (US peak + Asian hours cluster).
            </p>
          </div>
        </div>

        <div style={{ marginTop: '16px', fontSize: '0.8rem', color: '#a0a0a0', lineHeight: 1.6 }}>
          <strong>Key caveats:</strong> Bots and market makers may skew timezone buckets. Volume does not equal AUM.
          The Europe/Asia overlap bucket (UTC 7-13) could be either region. CEX label coverage is incomplete.
          15 of 18 target Asian CEXs have labels across Allium + Dune; Satang, BitoEx, and ACE Exchange are unlabeled in both.
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '24px 0', color: '#707070', fontSize: '0.8rem' }}>
        Data sources: Allium (Snowflake) + Dune Analytics &middot; Generated Feb 25 2026 &middot;{' '}
        <Link href="/" style={{ color: '#8b5cf6' }}>Back to USDH Dashboard</Link>
      </div>
    </div>
  )
}
