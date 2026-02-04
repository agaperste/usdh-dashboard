'use client'

import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  ReferenceLine,
} from 'recharts'
import lendingData from '../data/lending_data.json'
import dexData from '../data/dex_data.json'
import dexTokenPairsData from '../data/dex_token_pairs_data.json'
import hypercoreData from '../data/hypercore_data.json'
import hypercoreByProtocolRawData from '../data/hypercore_by_protocol_data.json'
import hypercoreByCoinRawData from '../data/hypercore_by_coin_data.json'
import hypercoreByProtocolAndCoinRawData from '../data/hypercore_by_protocol_and_coin_data.json'
import dailyActiveUsersRawData from '../data/daily_active_users_data.json'

interface LendingRecord {
  date: string
  project: string
  action_type: string
  transaction_count: number
  unique_wallets: number
  volume_usd: number
}

interface DexRecord {
  date: string
  project: string
  trade_count: number
  unique_traders: number
  trading_volume_usd: number
  usdh_sold_volume: number
  usdh_bought_volume: number
}

interface DexTokenPairRecord {
  date: string
  token_pair: string
  trade_count: number
  trading_volume_usd: number
}

interface HypercoreRecord {
  date: string
  market_type: string
  perp_dex: string
  is_hip3: boolean
  trade_count: number
  unique_buyers: number
  unique_sellers: number
  trading_volume_usd: string
  usdh_position: string
}

interface HypercoreByProtocolRecord {
  date: string
  perp_dex: string
  trading_volume_usd: string
}

interface HypercoreByCoinRecord {
  date: string
  coin: string
  trading_volume_usd: string
}

interface HypercoreByProtocolAndCoinRecord {
  date: string
  perp_dex: string
  coin: string
  trading_volume_usd: string
}

interface DailyActiveUsersRecord {
  date: string
  lending_users: number
  spot_users: number
  perp_users: number
  total_unique_users: number
}

export default function Dashboard() {
  // Date range state - default to Sep 15, 2025 to today
  const [startDate, setStartDate] = useState('2025-09-15')
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])

  // Chart data state
  const [lendingFlowData, setLendingFlowData] = useState<any[]>([])
  const [lendingTVLData, setLendingTVLData] = useState<any[]>([])
  const [dexByProjectData, setDexByProjectData] = useState<any[]>([])
  const [dexByTokenPairData, setDexByTokenPairData] = useState<any[]>([])
  const [hypercoreByProtocolData, setHypercoreByProtocolData] = useState<any[]>([])
  const [hypercoreByCoinData, setHypercoreByCoinData] = useState<any[]>([])
  const [hypercoreByProtocolAndCoinData, setHypercoreByProtocolAndCoinData] = useState<any[]>([])
  const [dailyActiveUsersData, setDailyActiveUsersData] = useState<any[]>([])
  const [topProjects, setTopProjects] = useState<any>({})

  useEffect(() => {
    processAllData()
  }, [startDate, endDate])

  const filterByDateRange = (dateStr: string) => {
    const date = dateStr.split('T')[0]
    return date >= startDate && date <= endDate
  }

  const processAllData = () => {
    processLendingFlowData()
    processLendingTVLData()
    processDexByProject()
    processDexByTokenPair()
    processHypercoreByProtocol()
    processHypercoreByCoin()
    processHypercoreByProtocolAndCoin()
    processDailyActiveUsers()
    calculateTopProjects()
  }

  const processLendingFlowData = () => {
    const records = (lendingData.data as LendingRecord[]).filter(r => filterByDateRange(r.date))
    const grouped: { [key: string]: any } = {}

    records.forEach(record => {
      const dateKey = record.date.split('T')[0]
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: dateKey,
          sortDate: new Date(record.date).getTime()
        }
      }

      const key = `${record.project}_${record.action_type}`
      const value = record.action_type === 'withdrawal' ? -record.volume_usd : record.volume_usd
      grouped[dateKey][key] = (grouped[dateKey][key] || 0) + value
    })

    const sortedData = Object.values(grouped)
      .sort((a, b) => a.sortDate - b.sortDate)
      .map(item => ({
        ...item,
        displayDate: new Date(item.sortDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }))

    setLendingFlowData(sortedData)
  }

  const processLendingTVLData = () => {
    const records = (lendingData.data as LendingRecord[]).filter(r => filterByDateRange(r.date))
    const grouped: { [key: string]: any } = {}

    records.forEach(record => {
      const dateKey = record.date.split('T')[0]
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: dateKey,
          sortDate: new Date(record.date).getTime()
        }
      }

      const projectKey = `${record.project}_tvl`
      if (!grouped[dateKey][projectKey]) {
        grouped[dateKey][projectKey] = 0
      }

      const netFlow = record.action_type === 'deposit' ? record.volume_usd : -record.volume_usd
      grouped[dateKey][projectKey] += netFlow
    })

    // Calculate cumulative TVL per project
    const sortedDates = Object.keys(grouped).sort()
    const projectTVLs: { [key: string]: number } = {}

    sortedDates.forEach(dateKey => {
      Object.keys(grouped[dateKey]).forEach(key => {
        if (key !== 'date' && key !== 'sortDate' && key.endsWith('_tvl')) {
          projectTVLs[key] = (projectTVLs[key] || 0) + grouped[dateKey][key]
          grouped[dateKey][key] = projectTVLs[key]
        }
      })
      // Calculate total TVL across all projects
      grouped[dateKey].total_tvl = Object.keys(grouped[dateKey])
        .filter(key => key !== 'date' && key !== 'sortDate' && key.endsWith('_tvl'))
        .reduce((sum, key) => sum + (grouped[dateKey][key] || 0), 0)
    })

    const sortedData = Object.values(grouped)
      .sort((a, b) => a.sortDate - b.sortDate)
      .map(item => ({
        ...item,
        displayDate: new Date(item.sortDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }))

    setLendingTVLData(sortedData)
  }

  const processDexByProject = () => {
    const records = (dexData.data as DexRecord[]).filter(r => filterByDateRange(r.date))
    const grouped: { [key: string]: any } = {}

    records.forEach(record => {
      const dateKey = record.date.split('T')[0]
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: dateKey,
          sortDate: new Date(record.date).getTime()
        }
      }
      grouped[dateKey][record.project] = (grouped[dateKey][record.project] || 0) + record.trading_volume_usd
    })

    const sortedData = Object.values(grouped)
      .sort((a, b) => a.sortDate - b.sortDate)
      .map(item => ({
        ...item,
        displayDate: new Date(item.sortDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }))

    setDexByProjectData(sortedData)
  }

  const processDexByTokenPair = () => {
    const records = (dexTokenPairsData.data as DexTokenPairRecord[]).filter(r => filterByDateRange(r.date))
    const grouped: { [key: string]: any } = {}

    records.forEach(record => {
      const dateKey = record.date.split('T')[0]
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: dateKey,
          sortDate: new Date(record.date).getTime()
        }
      }
      grouped[dateKey][record.token_pair] = (grouped[dateKey][record.token_pair] || 0) + record.trading_volume_usd
    })

    const sortedData = Object.values(grouped)
      .sort((a, b) => a.sortDate - b.sortDate)
      .map(item => ({
        ...item,
        displayDate: new Date(item.sortDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }))

    setDexByTokenPairData(sortedData)
  }

  const processHypercoreByProtocol = () => {
    if (!hypercoreByProtocolRawData?.data) {
      setHypercoreByProtocolData([])
      return
    }
    const records = (hypercoreByProtocolRawData.data as HypercoreByProtocolRecord[]).filter(r => filterByDateRange(r.date))
    const grouped: { [key: string]: any } = {}

    records.forEach(record => {
      const dateKey = record.date.split('T')[0]
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: dateKey,
          sortDate: new Date(record.date).getTime()
        }
      }
      grouped[dateKey][record.perp_dex] = (grouped[dateKey][record.perp_dex] || 0) + parseFloat(record.trading_volume_usd)
    })

    const sortedData = Object.values(grouped)
      .sort((a, b) => a.sortDate - b.sortDate)
      .map(item => ({
        ...item,
        displayDate: new Date(item.sortDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }))

    setHypercoreByProtocolData(sortedData)
  }

  const processHypercoreByCoin = () => {
    if (!hypercoreByCoinRawData?.data) {
      setHypercoreByCoinData([])
      return
    }
    const records = (hypercoreByCoinRawData.data as HypercoreByCoinRecord[]).filter(r => filterByDateRange(r.date))
    const grouped: { [key: string]: any } = {}

    records.forEach(record => {
      const dateKey = record.date.split('T')[0]
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: dateKey,
          sortDate: new Date(record.date).getTime()
        }
      }
      grouped[dateKey][record.coin] = (grouped[dateKey][record.coin] || 0) + parseFloat(record.trading_volume_usd)
    })

    const sortedData = Object.values(grouped)
      .sort((a, b) => a.sortDate - b.sortDate)
      .map(item => ({
        ...item,
        displayDate: new Date(item.sortDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }))

    setHypercoreByCoinData(sortedData)
  }

  const processHypercoreByProtocolAndCoin = () => {
    if (!hypercoreByProtocolAndCoinRawData?.data) {
      setHypercoreByProtocolAndCoinData([])
      return
    }
    const records = (hypercoreByProtocolAndCoinRawData.data as HypercoreByProtocolAndCoinRecord[]).filter(r => filterByDateRange(r.date))
    const grouped: { [key: string]: any } = {}

    records.forEach(record => {
      const dateKey = record.date.split('T')[0]
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: dateKey,
          sortDate: new Date(record.date).getTime()
        }
      }
      // Use coin as key since it already contains protocol prefix (e.g., "flx:SILVER", "km:US500")
      grouped[dateKey][record.coin] = (grouped[dateKey][record.coin] || 0) + parseFloat(record.trading_volume_usd)
    })

    const sortedData = Object.values(grouped)
      .sort((a, b) => a.sortDate - b.sortDate)
      .map(item => ({
        ...item,
        displayDate: new Date(item.sortDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }))

    setHypercoreByProtocolAndCoinData(sortedData)
  }

  const processDailyActiveUsers = () => {
    if (!dailyActiveUsersRawData?.data) {
      setDailyActiveUsersData([])
      return
    }
    const records = (dailyActiveUsersRawData.data as DailyActiveUsersRecord[]).filter(r => filterByDateRange(r.date))

    const processedData = records.map(record => ({
      date: record.date.split('T')[0],
      sortDate: new Date(record.date).getTime(),
      displayDate: new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      lending_users: record.lending_users,
      spot_users: record.spot_users,
      perp_users: record.perp_users,
      total_unique_users: record.total_unique_users
    }))

    const sortedData = processedData.sort((a, b) => a.sortDate - b.sortDate)
    setDailyActiveUsersData(sortedData)
  }

  const calculateTopProjects = () => {
    const lendingRecords = (lendingData.data as LendingRecord[]).filter(r => filterByDateRange(r.date))
    const dexRecords = (dexData.data as DexRecord[]).filter(r => filterByDateRange(r.date))

    // Calculate lending volumes by project (deposits only)
    const lendingVolumes: { [key: string]: number } = {}
    lendingRecords.forEach(record => {
      if (record.action_type === 'deposit') {
        lendingVolumes[record.project] = (lendingVolumes[record.project] || 0) + record.volume_usd
      }
    })

    // Calculate DEX volumes by project
    const dexVolumes: { [key: string]: number } = {}
    dexRecords.forEach(record => {
      dexVolumes[record.project] = (dexVolumes[record.project] || 0) + record.trading_volume_usd
    })

    const topLending = Object.entries(lendingVolumes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)

    const topDex = Object.entries(dexVolumes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)

    setTopProjects({ lending: topLending, dex: topDex })
  }

  const formatCurrency = (value: number) => {
    const absValue = Math.abs(value)
    if (absValue >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    }
    if (absValue >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`
    }
    return `$${value.toFixed(0)}`
  }

  const formatProjectName = (project: string) => {
    const nameMap: { [key: string]: string } = {
      'morpho_blue': 'Morpho Blue',
      'hyperlend': 'HyperLend',
      'hypurrfi': 'Hypurrfi',
      'euler': 'Euler',
      'project_x': 'Project X',
      'hybra_finance': 'Hybra Finance',
      'hyperswap': 'HyperSwap',
    }
    return nameMap[project] || project
  }

  return (
    <div className="container">
      <header>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>USDH Ecosystem Usage</h1>
            <p className="subtitle">
              Tracking USDH activity across HyperEVM and HyperCore in terms of lending, spot trading, and perps
            </p>
          </div>
          <div style={{ textAlign: 'right', paddingTop: '0.5rem' }}>
            <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>Powered by</p>
            <p style={{ fontSize: '1.2rem', fontWeight: 600, color: '#1a1a1a', margin: 0 }}>Allium</p>
          </div>
        </div>

        {/* Table of Contents */}
        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e0e0e0'
        }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: '#1a1a1a' }}>Dashboard Sections</h2>
          <p style={{ fontSize: '1rem', color: '#666', marginBottom: '1rem' }}>
            This dashboard provides comprehensive analytics on USDH stablecoin usage across multiple protocols and chains:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#10b981' }}>💰 Lending</h3>
              <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.6 }}>
                Track USDH deposits and withdrawals across lending protocols on HyperEVM (Morpho Blue, HyperLend, Hypurrfi, Euler)
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#3b82f6' }}>🔄 Spot Trading</h3>
              <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.6 }}>
                Monitor USDH trading volume on HyperEVM DEXs by project and token pairs (WHYPE, USDC, thBILL, etc.)
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#8b5cf6' }}>📈 Perpetuals</h3>
              <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.6 }}>
                Analyze USDH perpetual trading on HyperCore (Hyperliquid) across protocols (Felix, Kinetiq) and assets (SILVER, GOLD, S&P 500, etc.)
              </p>
            </div>
          </div>
          <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e0e0e0' }}>
            <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>
              <strong>Additional Analytics:</strong> Top projects by TVL/volume, user activity breakdown, and daily active users trends
            </p>
          </div>
        </div>

        {/* Date Range Selector */}
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontSize: '0.9rem', color: '#666', marginRight: '0.5rem' }}>Start Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                fontSize: '0.9rem'
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.9rem', color: '#666', marginRight: '0.5rem' }}>End Date:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                fontSize: '0.9rem'
              }}
            />
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <a
              href="https://dune.com/agaperste/usdh-growth-felix-campaign-on-morpho-through-merkl"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.9rem',
                color: '#8b5cf6',
                textDecoration: 'none',
                padding: '8px 16px',
                border: '1px solid #8b5cf6',
                borderRadius: '4px',
                display: 'inline-block',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#8b5cf6'
                e.currentTarget.style.color = '#ffffff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = '#8b5cf6'
              }}
            >
              📊 View Dune Dashboard
            </a>
          </div>
        </div>
      </header>

      {/* Top Projects Summary */}
      <div className="section">
        <h2>Top Projects Driving USDH Usage</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#666' }}>HyperEVM Lending</h3>
            <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: '1rem' }}>By Current TVL</p>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '1px solid #e0e0e0'
            }}>
              <span style={{ fontWeight: 500 }}>1. Morpho Blue</span>
              <span style={{ color: '#666' }}>$22.5M</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '1px solid #e0e0e0'
            }}>
              <span style={{ fontWeight: 500 }}>2. HyperLend</span>
              <span style={{ color: '#666' }}>$8.1M</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0'
            }}>
              <span style={{ fontWeight: 500 }}>3. Hypurrfi</span>
              <span style={{ color: '#666' }}>$0.5M</span>
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#666' }}>HyperEVM DEX</h3>
            <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: '1rem' }}>By L7D Trading Volume</p>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '1px solid #e0e0e0'
            }}>
              <span style={{ fontWeight: 500 }}>1. Project X</span>
              <span style={{ color: '#666' }}>$43.9M</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '1px solid #e0e0e0'
            }}>
              <span style={{ fontWeight: 500 }}>2. Hybra Finance</span>
              <span style={{ color: '#666' }}>$69K</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0'
            }}>
              <span style={{ fontWeight: 500 }}>3. HyperSwap</span>
              <span style={{ color: '#666' }}>$78</span>
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#666' }}>HyperCore Perps</h3>
            <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: '1rem' }}>By L7D Trading Volume</p>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '1px solid #e0e0e0'
            }}>
              <span style={{ fontWeight: 500 }}>1. Felix Exchange</span>
              <span style={{ color: '#666' }}>$493.6M</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '1px solid #e0e0e0'
            }}>
              <span style={{ fontWeight: 500 }}>2. Markets by Kinetiq</span>
              <span style={{ color: '#666' }}>$398.2M</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0'
            }}>
              <span style={{ fontWeight: 500 }}>3. Hyperliquid</span>
              <span style={{ color: '#666' }}>$146.4M</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section Break */}
      <div style={{ borderTop: '3px solid #e0e0e0', margin: '3rem 0' }} />

      {/* ============================================ */}
      {/* LENDING SECTION */}
      {/* ============================================ */}
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '2rem', color: '#1a1a1a' }}>
          HyperEVM Lending
        </h1>

        {/* Two Charts Side by Side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Lending Chart 1: Deposit vs Withdrawal Flow */}
          <div className="section">
            <h2>Daily Deposit & Withdrawal Flow</h2>
            <div className="chart-container">
              {lendingFlowData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={lendingFlowData} barSize={30} margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="displayDate" angle={-45} textAnchor="end" height={80} />
                    <YAxis tickFormatter={formatCurrency} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />

                    {/* Deposits (positive) */}
                    <Bar dataKey="morpho_blue_deposit" stackId="deposits" fill="#8b5cf6" name="Morpho Blue (Deposit)" />
                    <Bar dataKey="hyperlend_deposit" stackId="deposits" fill="#3b82f6" name="HyperLend (Deposit)" />
                    <Bar dataKey="hypurrfi_deposit" stackId="deposits" fill="#10b981" name="Hypurrfi (Deposit)" />
                    <Bar dataKey="euler_deposit" stackId="deposits" fill="#f59e0b" name="Euler (Deposit)" />

                    {/* Withdrawals (negative) */}
                    <Bar dataKey="morpho_blue_withdrawal" stackId="withdrawals" fill="#a78bfa" name="Morpho Blue (Withdrawal)" />
                    <Bar dataKey="hyperlend_withdrawal" stackId="withdrawals" fill="#60a5fa" name="HyperLend (Withdrawal)" />
                    <Bar dataKey="hypurrfi_withdrawal" stackId="withdrawals" fill="#34d399" name="Hypurrfi (Withdrawal)" />
                    <Bar dataKey="euler_withdrawal" stackId="withdrawals" fill="#fbbf24" name="Euler (Withdrawal)" />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="loading">Loading lending flow data...</div>
              )}
            </div>
          </div>

          {/* Lending Chart 2: TVL by Project */}
          <div className="section">
            <h2>TVL by Project</h2>
            <div className="chart-container">
              {lendingTVLData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={lendingTVLData} margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="displayDate" angle={-45} textAnchor="end" height={80} />
                    <YAxis tickFormatter={formatCurrency} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Line type="monotone" dataKey="morpho_blue_tvl" stroke="#8b5cf6" strokeWidth={2} name="Morpho Blue" dot={false} />
                    <Line type="monotone" dataKey="hyperlend_tvl" stroke="#3b82f6" strokeWidth={2} name="HyperLend" dot={false} />
                    <Line type="monotone" dataKey="hypurrfi_tvl" stroke="#10b981" strokeWidth={2} name="Hypurrfi" dot={false} />
                    <Line type="monotone" dataKey="euler_tvl" stroke="#f59e0b" strokeWidth={2} name="Euler" dot={false} />
                    <Line type="monotone" dataKey="total_tvl" stroke="#1a1a1a" strokeWidth={4} name="Total TVL" dot={false} strokeDasharray="5 5" />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="loading">Loading TVL data...</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section Break */}
      <div style={{ borderTop: '3px solid #e0e0e0', margin: '3rem 0' }} />

      {/* ============================================ */}
      {/* DEX SECTION */}
      {/* ============================================ */}
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '2rem', color: '#1a1a1a' }}>
          HyperEVM DEX
        </h1>

        {/* Two Charts Side by Side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* DEX Chart 1: By Project */}
          <div className="section">
            <h2>Daily Trading Volume by Project</h2>
            <div className="chart-container">
              {dexByProjectData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dexByProjectData} barSize={30} margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="displayDate" angle={-45} textAnchor="end" height={80} />
                    <YAxis tickFormatter={formatCurrency} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="project_x" stackId="a" fill="#6366f1" name="Project X (Uniswap v3)" />
                    <Bar dataKey="hybra_finance" stackId="a" fill="#ec4899" name="Hybra Finance (Uniswap v3)" />
                    <Bar dataKey="hyperswap" stackId="a" fill="#f97316" name="HyperSwap (Uniswap v2/v3)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="loading">Loading DEX project data...</div>
              )}
            </div>
          </div>

          {/* DEX Chart 2: By Token Pair */}
          <div className="section">
            <h2>Daily Trading Volume by Token Pair</h2>
            <div className="chart-container">
              {dexByTokenPairData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dexByTokenPairData} barSize={30} margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="displayDate" angle={-45} textAnchor="end" height={80} />
                    <YAxis tickFormatter={formatCurrency} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="WHYPE-USDH" stackId="a" fill="#8b5cf6" name="WHYPE-USDH" />
                    <Bar dataKey="USD₮0-USDH" stackId="a" fill="#3b82f6" name="USD₮0-USDH" />
                    <Bar dataKey="USDC-USDH" stackId="a" fill="#10b981" name="USDC-USDH" />
                    <Bar dataKey="kHYPE-USDH" stackId="a" fill="#f59e0b" name="kHYPE-USDH" />
                    <Bar dataKey="thBILL-USDH" stackId="a" fill="#ef4444" name="thBILL-USDH" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="loading">Loading token pair data...</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section Break */}
      <div style={{ borderTop: '3px solid #e0e0e0', margin: '3rem 0' }} />

      {/* ============================================ */}
      {/* HYPERCORE SECTION */}
      {/* ============================================ */}
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '2rem', color: '#1a1a1a' }}>
          HyperCore (Hyperliquid) Perpetuals
        </h1>

        {/* Two Charts Side by Side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Perps Chart 1: By Protocol */}
          <div className="section">
            <h2>Daily Trading Volume by Protocol</h2>
            <div className="chart-container">
              {hypercoreByProtocolData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hypercoreByProtocolData} barSize={30} margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="displayDate" angle={-45} textAnchor="end" height={80} />
                    <YAxis tickFormatter={formatCurrency} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="flx" stackId="a" fill="#ef4444" name="Felix Exchange (flx)" />
                    <Bar dataKey="km" stackId="a" fill="#0ea5e9" name="Markets by Kinetiq (km)" />
                    <Bar dataKey="vntl" stackId="a" fill="#8b5cf6" name="Ventuals (vntl)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="loading">Loading protocol data...</div>
              )}
            </div>
          </div>

          {/* Perps Chart 2: By Asset/Coin */}
          <div className="section">
            <h2>Daily Trading Volume by Asset</h2>
            <div className="chart-container">
              {hypercoreByCoinData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hypercoreByCoinData} barSize={30} margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="displayDate" angle={-45} textAnchor="end" height={80} />
                    <YAxis tickFormatter={formatCurrency} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="flx:SILVER" stackId="a" fill="#c0c0c0" name="SILVER (flx)" />
                    <Bar dataKey="km:US500" stackId="a" fill="#3b82f6" name="S&P 500 (km)" />
                    <Bar dataKey="flx:TSLA" stackId="a" fill="#ef4444" name="TSLA (flx)" />
                    <Bar dataKey="flx:GOLD" stackId="a" fill="#fbbf24" name="GOLD (flx)" />
                    <Bar dataKey="flx:XMR" stackId="a" fill="#ff6600" name="XMR (flx)" />
                    <Bar dataKey="km:USTECH" stackId="a" fill="#10b981" name="NASDAQ (km)" />
                    <Bar dataKey="km:SILVER" stackId="a" fill="#94a3b8" name="SILVER (km)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="loading">Loading asset data...</div>
              )}
            </div>
          </div>
        </div>

        {/* Perps Chart 3: Asset + Protocol Breakdown (Full Width) */}
        <div className="section" style={{ marginTop: '2rem' }}>
          <h2>Daily Trading Volume by Asset + Protocol</h2>
          <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
            Shows which protocols trade which assets (e.g., Felix vs Kinetiq for SILVER, US500, GOLD)
          </p>
          <div className="chart-container">
            {hypercoreByProtocolAndCoinData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hypercoreByProtocolAndCoinData} barSize={20} margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="displayDate" angle={-45} textAnchor="end" height={80} />
                  <YAxis tickFormatter={formatCurrency} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  {/* Group by asset: SILVER */}
                  <Bar dataKey="flx:SILVER" stackId="a" fill="#c0c0c0" name="SILVER (Felix)" />
                  <Bar dataKey="km:SILVER" stackId="a" fill="#94a3b8" name="SILVER (Kinetiq)" />
                  {/* Group by asset: GOLD */}
                  <Bar dataKey="flx:GOLD" stackId="a" fill="#fbbf24" name="GOLD (Felix)" />
                  <Bar dataKey="km:GOLD" stackId="a" fill="#fde68a" name="GOLD (Kinetiq)" />
                  {/* Group by asset: Stock indices */}
                  <Bar dataKey="km:US500" stackId="a" fill="#3b82f6" name="S&P 500 (Kinetiq)" />
                  <Bar dataKey="km:USTECH" stackId="a" fill="#10b981" name="NASDAQ (Kinetiq)" />
                  {/* Other assets */}
                  <Bar dataKey="flx:TSLA" stackId="a" fill="#ef4444" name="TSLA (Felix)" />
                  <Bar dataKey="flx:XMR" stackId="a" fill="#ff6600" name="XMR (Felix)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="loading">Loading asset+protocol data...</div>
            )}
          </div>
        </div>
      </div>

      {/* Section Break */}
      <div style={{ borderTop: '3px solid #e0e0e0', margin: '3rem 0' }} />

      {/* ============================================ */}
      {/* USER ANALYTICS SECTION */}
      {/* ============================================ */}
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '1rem', color: '#1a1a1a' }}>
          Active Users Analytics
        </h1>
        <p style={{ fontSize: '1rem', color: '#666', marginBottom: '2rem' }}>
          Distinct wallet addresses across lending, spot trading, and perpetual trading activities
        </p>

        <div className="section">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Total Users Card */}
            <div style={{
              padding: '2rem',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '2px solid #e0e0e0'
            }}>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: '#1a1a1a' }}>Total Unique Users</h2>
              <p style={{ fontSize: '3rem', fontWeight: 700, color: '#8b5cf6', margin: '1rem 0' }}>43,808</p>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>Distinct wallet addresses participating in USDH activities</p>
            </div>

            {/* Breakdown by Category */}
            <div style={{
              padding: '2rem',
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #e0e0e0'
            }}>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: '#1a1a1a' }}>User Activity Breakdown</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ fontWeight: 500 }}>Perp Only</span>
                  <span style={{ color: '#666', fontWeight: 600 }}>28,474</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ fontWeight: 500 }}>Spot Only</span>
                  <span style={{ color: '#666', fontWeight: 600 }}>9,417</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ fontWeight: 500 }}>Spot + Perp</span>
                  <span style={{ color: '#666', fontWeight: 600 }}>4,700</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ fontWeight: 500 }}>All Three</span>
                  <span style={{ color: '#666', fontWeight: 600 }}>553</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ fontWeight: 500 }}>Lending + Perp</span>
                  <span style={{ color: '#666', fontWeight: 600 }}>308</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ fontWeight: 500 }}>Lending + Spot</span>
                  <span style={{ color: '#666', fontWeight: 600 }}>262</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                  <span style={{ fontWeight: 500 }}>Lending Only</span>
                  <span style={{ color: '#666', fontWeight: 600 }}>94</span>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Active Users Time Series Chart */}
          <div style={{ marginTop: '2rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>Daily Active Users Over Time</h2>
            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
              Total unique users line shows true distinct wallet addresses (deduplicated across all three categories)
            </p>
            <div className="chart-container">
              {dailyActiveUsersData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyActiveUsersData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="displayDate" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="lending_users" stroke="#10b981" name="Lending Users" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="spot_users" stroke="#3b82f6" name="Spot Trading Users" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="perp_users" stroke="#8b5cf6" name="Perp Trading Users" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="total_unique_users" stroke="#ef4444" name="Total Unique Users (Deduplicated)" strokeWidth={3} dot={false} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="loading">Loading daily active users data...</div>
              )}
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#fffbeb', borderRadius: '8px', border: '1px solid #fbbf24' }}>
            <p style={{ fontSize: '0.9rem', color: '#92400e', margin: 0 }}>
              <strong>Note:</strong> Hyperliquid (HyperCore) addresses may differ from EVM addresses, potentially leading to a slight overcount for users active on both chains.
            </p>
          </div>
        </div>
      </div>

      {/*
        TODO: Add campaign markers to charts

        REMINDER: Need to add vertical markers on the charts to denote:
        - USDH Felix Campaign on HyperEVM on Morpho
        - Campaign start date (TBD)
        - Campaign end date (TBD)

        Implementation: Use ReferenceLine component from Recharts with:
        - x={campaignStartDate}
        - stroke="#00ff00" (or appropriate color)
        - strokeWidth={2}
        - label="Campaign Start"

        Apply to relevant charts:
        - HyperEVM Lending: Daily Deposit & Withdrawal Flow
        - HyperEVM Lending: TVL by Project
      */}
    </div>
  )
}
