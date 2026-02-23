'use client';

import { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  bridgeWideImpact,
  developerImpact,
  monthlyTrend,
  customerSegmentation,
  type DeveloperImpact,
  type CustomerSegment,
} from '@/data/blast-radius';

const fmt = (n: number | null | undefined, decimals = 0) => {
  if (n == null) return '-';
  return n.toLocaleString('en-US', { maximumFractionDigits: decimals });
};

const fmtUsd = (n: number | null | undefined) => {
  if (n == null) return '-';
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
};

const pctClass = (pct: number | null) => {
  if (pct == null) return '';
  if (pct >= 50) return 'pct-high';
  if (pct >= 15) return 'pct-med';
  return 'pct-low';
};

// Impact to Bridge: what % of Bridge's total EU exposure does this developer represent
const impactClass = (pct: number) => {
  if (pct >= 25) return 'pct-high';
  if (pct >= 10) return 'pct-med';
  return 'pct-low';
};

const impactLabel = (balShare: number, volShare: number) => {
  const max = Math.max(balShare, volShare);
  if (max >= 25) return { cls: 'eu-only', label: 'High' };
  if (max >= 10) return { cls: 'mixed', label: 'Medium' };
  return { cls: 'non-eu', label: 'Low' };
};

const COLORS = {
  domicile: '#3b82f6',
  custody: '#f97316',
  total: '#525252',
};

type TrendMetric = 'volume' | 'trips' | 'customers';
type SortDir = 'asc' | 'desc';
type SortState<K extends string> = { key: K; dir: SortDir };

function toggleSort<K extends string>(prev: SortState<K>, key: K): SortState<K> {
  if (prev.key === key) return { key, dir: prev.dir === 'desc' ? 'asc' : 'desc' };
  return { key, dir: 'desc' };
}

function sortedBy<T>(arr: T[], key: keyof T, dir: SortDir): T[] {
  return [...arr].sort((a, b) => {
    const av = a[key] ?? -Infinity;
    const bv = b[key] ?? -Infinity;
    if (av < bv) return dir === 'asc' ? -1 : 1;
    if (av > bv) return dir === 'asc' ? 1 : -1;
    return 0;
  });
}

type DevSortKey = 'developer_name' | 'total_customers' | 'total_balance_usd' | 'total_jan_volume' | 'dom_eu_customers' | 'dom_eu_balance' | 'dom_eu_volume' | 'pct_cust_dom_eu' | 'pct_bal_dom_eu' | 'pct_vol_dom_eu' | 'cust_eu_customers' | 'cust_eu_balance' | 'cust_eu_volume' | 'pct_cust_custody_eu' | 'pct_bal_custody_eu' | 'pct_vol_custody_eu';
type SegSortKey = 'developer_name' | 'total_customers' | 'eu_only_customers' | 'eu_only_balance' | 'mixed_customers' | 'mixed_eu_balance' | 'non_eu_customers' | 'non_eu_balance' | 'pct_fully_stuck';

const bw = bridgeWideImpact;

const trendChartData = (metric: TrendMetric) => monthlyTrend.map(m => ({
  month: m.month,
  'Domicile EU %': metric === 'volume' ? m.pct_vol_dom_eu
    : metric === 'trips' ? m.pct_trips_dom_eu
    : m.pct_cust_dom_eu,
  'Custody EU %': metric === 'volume' ? m.pct_vol_cust_eu
    : metric === 'trips' ? m.pct_trips_cust_eu
    : m.pct_cust_cust_eu,
}));

const truncName = (name: string) => name.length > 18 ? name.slice(0, 16) + '..' : name;

const devVolumePctData = developerImpact
  .filter(d => (d.dom_eu_volume > 0 || d.cust_eu_volume > 0) && d.total_jan_volume > 0)
  .sort((a, b) => (b.pct_vol_dom_eu ?? 0) - (a.pct_vol_dom_eu ?? 0))
  .slice(0, 12)
  .map(d => ({ name: truncName(d.developer_name), fullName: d.developer_name, 'Domicile EU %': d.pct_vol_dom_eu ?? 0, 'Custody EU %': d.pct_vol_custody_eu ?? 0 }));

const devVolumeAbsData = developerImpact
  .filter(d => d.dom_eu_volume > 0 || d.cust_eu_volume > 0)
  .sort((a, b) => b.dom_eu_volume - a.dom_eu_volume)
  .slice(0, 12)
  .map(d => ({ name: truncName(d.developer_name), fullName: d.developer_name, 'Domicile EU Vol': d.dom_eu_volume, 'Custody EU Vol': d.cust_eu_volume }));

const devBalancePctData = developerImpact
  .filter(d => (d.pct_bal_dom_eu ?? 0) > 0 || (d.pct_bal_custody_eu ?? 0) > 0)
  .sort((a, b) => (b.pct_bal_dom_eu ?? 0) - (a.pct_bal_dom_eu ?? 0))
  .slice(0, 12)
  .map(d => ({ name: truncName(d.developer_name), fullName: d.developer_name, 'Domicile EU %': d.pct_bal_dom_eu ?? 0, 'Custody EU %': d.pct_bal_custody_eu ?? 0 }));

const devBalanceAbsData = developerImpact
  .filter(d => d.cust_eu_balance > 0)
  .sort((a, b) => b.cust_eu_balance - a.cust_eu_balance)
  .slice(0, 12)
  .map(d => ({ name: truncName(d.developer_name), fullName: d.developer_name, 'EU Balance': d.cust_eu_balance, 'Non-EU Balance': (d.total_balance_usd ?? 0) - d.cust_eu_balance }));

// Enrich developer data with impact metrics (share of Bridge's total EU exposure)
const enriched = developerImpact
  .filter(d => d.cust_eu_balance > 0 || d.cust_eu_volume > 0)
  .map(d => ({
    ...d,
    maxRiskPct: Math.max(d.pct_cust_custody_eu ?? 0, d.pct_bal_custody_eu ?? 0, d.pct_vol_custody_eu ?? 0),
    balShareOfBridge: bw.custody_eu_balance > 0 ? (d.cust_eu_balance / bw.custody_eu_balance) * 100 : 0,
    volShareOfBridge: bw.custody_eu_volume > 0 ? (d.cust_eu_volume / bw.custody_eu_volume) * 100 : 0,
    custShareOfBridge: bw.custody_eu_customers > 0 ? (d.cust_eu_customers / bw.custody_eu_customers) * 100 : 0,
  }));

// By absolute impact to Bridge (sorted by EU balance share of Bridge total)
const topByAbsolute = [...enriched].sort((a, b) => b.balShareOfBridge - a.balShareOfBridge).slice(0, 10);

// By proportional risk to developer (sorted by max % EU across any metric)
const topByProportion = [...enriched].sort((a, b) => b.maxRiskPct - a.maxRiskPct).slice(0, 10);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 6, padding: '8px 12px', fontSize: '0.8rem' }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{payload[0]?.payload?.fullName || label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' && p.name.includes('%') ? `${p.value.toFixed(2)}%` : fmtUsd(p.value)}
        </div>
      ))}
    </div>
  );
};

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'top-developers', label: 'Top Developers' },
  { id: 'methodology', label: 'Methodology' },
  { id: 'findings', label: 'Findings' },
  { id: 'trend', label: 'Trend' },
  { id: 'dev-exposure', label: 'Dev Exposure' },
  { id: 'dev-detail', label: 'Dev Detail' },
  { id: 'segmentation', label: 'Segmentation' },
];

const SortTh = <K extends string>({ label, sortKey, sort, onSort, className, style }: {
  label: string; sortKey: K; sort: SortState<K>;
  onSort: (k: K) => void; className?: string; style?: React.CSSProperties;
}) => (
  <th
    className={`sortable ${sort.key === sortKey ? 'sort-active' : ''} ${className || ''}`}
    style={style}
    onClick={() => onSort(sortKey)}
  >
    {label}
    <span className="sort-arrow">{sort.key === sortKey ? (sort.dir === 'desc' ? '\u25BC' : '\u25B2') : '\u25BC'}</span>
  </th>
);

export default function Dashboard() {
  const [trendMetric, setTrendMetric] = useState<TrendMetric>('volume');
  const [volView, setVolView] = useState<'pct' | 'abs'>('pct');
  const [balView, setBalView] = useState<'pct' | 'abs'>('abs');
  const [devSort, setDevSort] = useState<SortState<DevSortKey>>({ key: 'cust_eu_balance', dir: 'desc' });
  const [segSort, setSegSort] = useState<SortState<SegSortKey>>({ key: 'eu_only_balance', dir: 'desc' });

  const sortedDevs = sortedBy(developerImpact, devSort.key, devSort.dir);
  const sortedSegs = sortedBy(customerSegmentation, segSort.key, segSort.dir);

  return (
    <div className="container">
      <div className="header">
        <h1>EU Wallet Custody Blast Radius</h1>
        <p>
          Impact analysis if Bridge cannot support custody in Europe (BBZ entity) &middot; Data as of Jan 2026
          &nbsp;&middot;&nbsp;
          <a href="https://dbc-028a7c00-c649.cloud.databricks.com/editor/queries/4116199161485473?o=2242275340100390" target="_blank" rel="noopener" style={{ color: '#3b82f6' }}>Source Query</a>
          &nbsp;&middot;&nbsp;
          <a href="https://docs.google.com/spreadsheets/d/1vBXBVXmpyMJH0vzWJaZn7sYOg5AgOfDI5A3s6I6Esro/edit?gid=1868248767#gid=1868248767" target="_blank" rel="noopener" style={{ color: '#3b82f6' }}>Raw Data (GSheet)</a>
        </p>
      </div>

      {/* Sticky section nav */}
      <nav className="section-nav">
        {sections.map(s => (
          <a key={s.id} href={`#${s.id}`} className="section-nav-link">{s.label}</a>
        ))}
      </nav>

      {/* Callout */}
      <div className="callout ok">
        EU exposure is <strong style={{ color: '#22c55e' }}>small and declining</strong>: ~2% of balance, &lt;1% of volume, ~3.7% of customers.
        The decline is driven by Bridge&apos;s overall volume growing 2.7x (Aug &apos;25 to Jan &apos;26) while EU activity stayed flat.
        Virtually zero &quot;mixed&quot; customers exist &mdash; nearly all EU customers have only EU wallets with no non-EU fallback.
      </div>

      {/* Developers to watch callout */}
      <div className="callout">
        <strong>Developers requiring closest attention:</strong>{' '}
        <strong style={{ color: '#ef4444' }}>OneSafe</strong> (holds 58% of all EU balance at $812K &mdash; by far the largest single-developer impact to Bridge),{' '}
        <strong style={{ color: '#ef4444' }}>Sauki</strong> (98% of their 1,032 customers are EU-only &mdash; almost entirely an EU business),{' '}
        and <strong style={{ color: '#ef4444' }}>Moneco</strong> (broadest customer reach with 1,728 EU customers and 17% of their volume from EU).
        See <a href="#top-developers" style={{ color: '#3b82f6' }}>detailed analysis below</a>.
      </div>

      {/* Overview */}
      <div className="section" id="overview">
        <h2>Overview</h2>
        <p className="subtitle">Bridge-wide EU exposure using the custody definition (wallet region = &apos;eu&apos;)</p>
        <div className="summary-grid">
          <div className="summary-card risk">
            <div className="label">EU Balance at Risk</div>
            <div className="value">{fmtUsd(bw.custody_eu_balance)}</div>
            <div className="sub">{bw.pct_bal_custody_eu}% of {fmtUsd(bw.total_balance_usd)} total</div>
          </div>
          <div className="summary-card neutral">
            <div className="label">EU Customers</div>
            <div className="value">{fmt(bw.custody_eu_customers)}</div>
            <div className="sub">{bw.pct_cust_custody_eu}% of {fmt(bw.total_customers)} total</div>
          </div>
          <div className="summary-card ok">
            <div className="label">EU Jan Volume</div>
            <div className="value">{fmtUsd(bw.custody_eu_volume)}</div>
            <div className="sub">{bw.pct_vol_custody_eu}% of {fmtUsd(bw.total_volume_usd)} total</div>
          </div>
          <div className="summary-card neutral">
            <div className="label">EU Developers</div>
            <div className="value">{fmt(bw.custody_eu_developers)}</div>
            <div className="sub">{((bw.custody_eu_developers / bw.total_developers) * 100).toFixed(1)}% of {fmt(bw.total_developers)} total</div>
          </div>
          <div className="summary-card ok">
            <div className="label">EU Jan Trips</div>
            <div className="value">{fmt(bw.custody_eu_trips)}</div>
            <div className="sub">{((bw.custody_eu_trips / bw.total_trips) * 100).toFixed(2)}% of {fmt(bw.total_trips)} total</div>
          </div>
        </div>
      </div>

      {/* Top impacted developers */}
      <div className="section" id="top-developers">
        <h2>Most Impacted Developers</h2>
        <p className="subtitle">
          Using <strong>custody EU</strong> definition (wallet region = &apos;eu&apos;).
          Two dimensions: <strong>Impact to Bridge</strong> (what share of Bridge&apos;s total EU exposure this developer represents &mdash; high means Bridge loses more if this developer is affected)
          and <strong>Risk to Developer</strong> (what % of the developer&apos;s own business is EU &mdash; high means the developer is heavily EU-dependent).
          Small developers with near-100% EU show high risk but low impact; large developers with modest EU % can still be high impact.
        </p>

        {/* Highlight cards - with clear reasoning */}
        <div className="chart-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
          <div className="summary-card risk">
            <div className="label">Highest Impact to Bridge</div>
            <div className="value" style={{ fontSize: '1.25rem' }}>OneSafe</div>
            <div className="sub">
              Holds 58% of all Bridge EU balance ($812K of $1.39M total).
              EU is only 13% of their own business, but they alone represent most of Bridge&apos;s EU custody exposure.
            </div>
          </div>
          <div className="summary-card risk">
            <div className="label">Highest Risk to Developer</div>
            <div className="value" style={{ fontSize: '1.25rem' }}>Sauki Inc</div>
            <div className="sub">
              97.9% of their 1,032 customers are EU-only with $1M EU volume (48% of their total).
              Custody disruption would affect nearly their entire user base.
            </div>
          </div>
          <div className="summary-card risk">
            <div className="label">Broadest Customer Reach</div>
            <div className="value" style={{ fontSize: '1.25rem' }}>Moneco</div>
            <div className="sub">
              1,728 EU customers (most of any developer, 38% of all Bridge EU customers).
              19% of their business and $670K EU volume &mdash; significant on both dimensions.
            </div>
          </div>
        </div>

        {/* Absolute impact to Bridge table */}
        <h3 style={{ fontSize: '0.9rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#a3a3a3' }}>
          By Impact to Bridge
          <span style={{ fontSize: '0.75rem', fontWeight: 400, marginLeft: '0.5rem' }}>(what share of Bridge&apos;s total EU exposure each developer represents, sorted by EU balance share)</span>
        </h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Developer</th>
                <th className="num">EU Balance</th>
                <th className="num">% of Bridge EU Bal</th>
                <th className="num">EU Volume</th>
                <th className="num">% of Bridge EU Vol</th>
                <th className="num">EU Customers</th>
                <th>Impact</th>
                <th>Risk</th>
              </tr>
            </thead>
            <tbody>
              {topByAbsolute.map((d, i) => {
                const impact = impactLabel(d.balShareOfBridge, d.volShareOfBridge);
                const riskPct = d.maxRiskPct;
                const risk = riskPct >= 50 ? { cls: 'eu-only', label: 'High' } : riskPct >= 15 ? { cls: 'mixed', label: 'Medium' } : { cls: 'non-eu', label: 'Low' };
                return (
                  <tr key={i}>
                    <td><strong>{d.developer_name}</strong></td>
                    <td className="num">{fmtUsd(d.cust_eu_balance)}</td>
                    <td className={`num ${impactClass(d.balShareOfBridge)}`}>{d.balShareOfBridge.toFixed(1)}%</td>
                    <td className="num">{fmtUsd(d.cust_eu_volume)}</td>
                    <td className={`num ${impactClass(d.volShareOfBridge)}`}>{d.volShareOfBridge.toFixed(1)}%</td>
                    <td className="num">{fmt(d.cust_eu_customers)}</td>
                    <td><span className={`badge ${impact.cls}`}>{impact.label}</span></td>
                    <td><span className={`badge ${risk.cls}`}>{risk.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Proportional risk to developer table */}
        <h3 style={{ fontSize: '0.9rem', marginTop: '1.5rem', marginBottom: '0.5rem', color: '#a3a3a3' }}>
          By Risk to Developer
          <span style={{ fontSize: '0.75rem', fontWeight: 400, marginLeft: '0.5rem' }}>(what % of each developer&apos;s own business is EU, sorted by highest % across any metric)</span>
        </h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Developer</th>
                <th className="num">% Cust EU</th>
                <th className="num">% Bal EU</th>
                <th className="num">% Vol EU</th>
                <th className="num">EU Balance</th>
                <th className="num">EU Volume</th>
                <th>Risk</th>
                <th>Impact</th>
              </tr>
            </thead>
            <tbody>
              {topByProportion.map((d, i) => {
                const risk = d.maxRiskPct >= 50 ? { cls: 'eu-only', label: 'High' } : d.maxRiskPct >= 15 ? { cls: 'mixed', label: 'Medium' } : { cls: 'non-eu', label: 'Low' };
                const impact = impactLabel(d.balShareOfBridge, d.volShareOfBridge);
                return (
                  <tr key={i}>
                    <td><strong>{d.developer_name}</strong></td>
                    <td className={`num ${pctClass(d.pct_cust_custody_eu)}`}>{d.pct_cust_custody_eu != null ? `${d.pct_cust_custody_eu}%` : '-'}</td>
                    <td className={`num ${pctClass(d.pct_bal_custody_eu)}`}>{d.pct_bal_custody_eu != null ? `${d.pct_bal_custody_eu}%` : '-'}</td>
                    <td className={`num ${pctClass(d.pct_vol_custody_eu)}`}>{d.pct_vol_custody_eu != null ? `${d.pct_vol_custody_eu}%` : '-'}</td>
                    <td className="num">{fmtUsd(d.cust_eu_balance)}</td>
                    <td className="num">{fmtUsd(d.cust_eu_volume)}</td>
                    <td><span className={`badge ${risk.cls}`}>{risk.label}</span></td>
                    <td><span className={`badge ${impact.cls}`}>{impact.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <hr className="section-divider" />

      {/* Methodology: Domicile vs Custody */}
      <div className="section" id="methodology">
        <h2>Methodology: Domicile EU vs Custody EU</h2>
        <p className="subtitle">Two definitions of &quot;EU&quot; were analyzed. They produce nearly identical results but have different implications.</p>
        <div className="chart-row">
          <div className="chart-container">
            <h3 style={{ fontSize: '0.85rem', marginBottom: '0.75rem', color: '#a3a3a3' }}>Domicile EU (contracting_entity = &apos;eu&apos;)</h3>
            <p style={{ fontSize: '0.8rem', color: '#a3a3a3', lineHeight: 1.6 }}>
              Based on the <strong style={{ color: '#e5e5e5' }}>customer&apos;s address</strong>. Stored in <code style={{ background: '#262626', padding: '1px 4px', borderRadius: 3 }}>entity_details.contracting_entity</code>. EEA customers map to BBZ, US to BBI, rest of world to BBL.
              This tells you where the customer <em>lives</em>.
            </p>
            <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: '#0a0a0a', borderRadius: 4, fontSize: '0.8rem' }}>
              {fmt(bw.domicile_eu_customers)} customers &middot; {fmtUsd(bw.domicile_eu_balance)} balance &middot; {fmtUsd(bw.domicile_eu_volume)} volume
            </div>
          </div>
          <div className="chart-container">
            <h3 style={{ fontSize: '0.85rem', marginBottom: '0.75rem', color: '#a3a3a3' }}>Custody EU (wallet region = &apos;eu&apos;)</h3>
            <p style={{ fontSize: '0.8rem', color: '#a3a3a3', lineHeight: 1.6 }}>
              Based on the <strong style={{ color: '#e5e5e5' }}>wallet&apos;s operating entity</strong>. Stored in <code style={{ background: '#262626', padding: '1px 4px', borderRadius: 3 }}>bridge_wallets.region</code> (aliased to <code style={{ background: '#262626', padding: '1px 4px', borderRadius: 3 }}>legal_entity</code>). &apos;eu&apos; means BBZ (Poland VASP) manages custody.
              This tells you where the <em>funds are custodied</em>.
            </p>
            <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: '#0a0a0a', borderRadius: 4, fontSize: '0.8rem' }}>
              {fmt(bw.custody_eu_customers)} customers &middot; {fmtUsd(bw.custody_eu_balance)} balance &middot; {fmtUsd(bw.custody_eu_volume)} volume
            </div>
          </div>
        </div>
        <div className="callout" style={{ marginTop: '1rem' }}>
          <strong>Overlap: 99.2%</strong> &mdash; {fmt(bw.both_eu_customers)} of {fmt(bw.either_eu_customers)} EU-exposed customers match on both definitions. Only {bw.either_eu_customers - bw.both_eu_customers} edge cases diverge.
          The two lenses are effectively interchangeable for this analysis. All sections on this page use the <strong>custody</strong> definition unless otherwise noted.
        </div>
      </div>

      {/* Key findings */}
      <div className="section" id="findings">
        <h2>Key Findings</h2>
        <div className="findings">
          <ul>
            <li><strong>Low overall exposure:</strong> EU represents ~2% of balance ($1.39M / $68.4M), &lt;1% of volume ($8.8M / $1.13B), and 3.65% of customers (4,594 / 125,959).</li>
            <li><strong>EU share is declining:</strong> EU volume as % of Bridge fell from 2.45% (Aug &apos;25) to 0.79% (Jan &apos;26). Bridge&apos;s total volume grew 2.7x over this period while EU absolute volume stayed flat &mdash; EU is shrinking as a share purely because Bridge is growing faster elsewhere.</li>
            <li><strong>Zero mixed customers:</strong> Virtually all EU customers are EU-only (no non-EU fallback wallets). Migration will require moving all their funds, not partial rebalancing.</li>
            <li><strong>Concentration in few developers:</strong> OneSafe alone holds 58% of all EU balance ($812K). Moneco has the most EU customers (1,728). Together with Sauki, these three developers represent the bulk of EU exposure.</li>
            <li><strong>Some developers are heavily EU:</strong> TaxAdvice (95.8%), Sauki (97.9%), NEITEC (75%), Innovative Concepts (74%) have majority-EU customer bases. High risk to these developers, though their absolute Bridge impact is smaller.</li>
            <li><strong>High-volume outliers:</strong> Wayex (80.9% of vol is EU despite only 14% of customers) and Dasbanq (8% of vol is EU) route disproportionate volume through EU wallets.</li>
          </ul>
        </div>
      </div>

      {/* Trend section */}
      <div className="section" id="trend">
        <h2>EU Share of Bridge Over Time</h2>
        <p className="subtitle">6-month trend showing EU as a percentage of total Bridge activity (both domicile and custody lens)</p>
        <div className="tab-row">
          {(['volume', 'trips', 'customers'] as TrendMetric[]).map(m => (
            <button
              key={m}
              className={`tab ${trendMetric === m ? 'active' : ''}`}
              onClick={() => setTrendMetric(m)}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={trendChartData(trendMetric)} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="month" stroke="#737373" fontSize={12} />
              <YAxis stroke="#737373" fontSize={12} tickFormatter={v => `${v}%`} />
              <Tooltip
                contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 6, fontSize: '0.8rem' }}
                formatter={(v: number) => `${v.toFixed(2)}%`}
              />
              <Legend />
              <Line type="monotone" dataKey="Domicile EU %" stroke={COLORS.domicile} strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Custody EU %" stroke={COLORS.custody} strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Developer impact charts */}
      <div className="section" id="dev-exposure">
        <h2>Developer-Level EU Exposure</h2>
        <p className="subtitle">Top 12 developers by EU wallet exposure (Jan 2026). Toggle between percentage and absolute views.</p>
        <div className="chart-row">
          <div className="chart-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '0.85rem', color: '#a3a3a3', margin: 0 }}>
                {volView === 'pct' ? '% of Jan Volume from EU Wallets' : 'EU Volume (USD) by Developer'}
              </h3>
              <div className="tab-row" style={{ marginBottom: 0 }}>
                <button className={`tab ${volView === 'pct' ? 'active' : ''}`} onClick={() => setVolView('pct')}>%</button>
                <button className={`tab ${volView === 'abs' ? 'active' : ''}`} onClick={() => setVolView('abs')}>USD</button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={380}>
              {volView === 'pct' ? (
                <BarChart data={devVolumePctData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" horizontal={false} />
                  <XAxis type="number" stroke="#737373" fontSize={11} tickFormatter={v => `${v}%`} />
                  <YAxis type="category" dataKey="name" stroke="#737373" fontSize={11} width={120} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="Domicile EU %" fill={COLORS.domicile} radius={[0, 3, 3, 0]} barSize={14} />
                  <Bar dataKey="Custody EU %" fill={COLORS.custody} radius={[0, 3, 3, 0]} barSize={14} />
                </BarChart>
              ) : (
                <BarChart data={devVolumeAbsData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" horizontal={false} />
                  <XAxis type="number" stroke="#737373" fontSize={11} tickFormatter={v => fmtUsd(v)} />
                  <YAxis type="category" dataKey="name" stroke="#737373" fontSize={11} width={120} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="Domicile EU Vol" fill={COLORS.domicile} radius={[0, 3, 3, 0]} barSize={14} />
                  <Bar dataKey="Custody EU Vol" fill={COLORS.custody} radius={[0, 3, 3, 0]} barSize={14} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
          <div className="chart-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '0.85rem', color: '#a3a3a3', margin: 0 }}>
                {balView === 'pct' ? '% of Balance from EU Wallets' : 'EU vs Non-EU Balance by Developer'}
              </h3>
              <div className="tab-row" style={{ marginBottom: 0 }}>
                <button className={`tab ${balView === 'pct' ? 'active' : ''}`} onClick={() => setBalView('pct')}>%</button>
                <button className={`tab ${balView === 'abs' ? 'active' : ''}`} onClick={() => setBalView('abs')}>USD</button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={380}>
              {balView === 'pct' ? (
                <BarChart data={devBalancePctData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" horizontal={false} />
                  <XAxis type="number" stroke="#737373" fontSize={11} tickFormatter={v => `${v}%`} />
                  <YAxis type="category" dataKey="name" stroke="#737373" fontSize={11} width={120} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="Domicile EU %" fill={COLORS.domicile} radius={[0, 3, 3, 0]} barSize={14} />
                  <Bar dataKey="Custody EU %" fill={COLORS.custody} radius={[0, 3, 3, 0]} barSize={14} />
                </BarChart>
              ) : (
                <BarChart data={devBalanceAbsData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" horizontal={false} />
                  <XAxis type="number" stroke="#737373" fontSize={11} tickFormatter={v => fmtUsd(v)} />
                  <YAxis type="category" dataKey="name" stroke="#737373" fontSize={11} width={120} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="EU Balance" stackId="a" fill={COLORS.custody} radius={[0, 0, 0, 0]} barSize={16} />
                  <Bar dataKey="Non-EU Balance" stackId="a" fill={COLORS.total} radius={[0, 3, 3, 0]} barSize={16} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Full developer table */}
      <div className="section" id="dev-detail">
        <h2>Developer Impact Detail</h2>
        <p className="subtitle">Full breakdown: total vs EU exposure per developer, showing both domicile and custody definitions. Rows tinted by max custody EU % across any metric.</p>
        <div className="table-container table-scroll">
          <table>
            <thead>
              <tr>
                <SortTh label="Developer" sortKey="developer_name" sort={devSort} onSort={k => setDevSort(toggleSort(devSort, k))} />
                <SortTh label="Total Cust" sortKey="total_customers" sort={devSort} onSort={k => setDevSort(toggleSort(devSort, k))} className="num" />
                <SortTh label="Total Bal" sortKey="total_balance_usd" sort={devSort} onSort={k => setDevSort(toggleSort(devSort, k))} className="num" />
                <SortTh label="Jan Vol" sortKey="total_jan_volume" sort={devSort} onSort={k => setDevSort(toggleSort(devSort, k))} className="num" />
                <SortTh label="Dom Cust" sortKey="dom_eu_customers" sort={devSort} onSort={k => setDevSort(toggleSort(devSort, k))} className="num" style={{ borderLeft: '2px solid #3b82f6' }} />
                <SortTh label="Dom Bal" sortKey="dom_eu_balance" sort={devSort} onSort={k => setDevSort(toggleSort(devSort, k))} className="num" />
                <SortTh label="Dom Vol" sortKey="dom_eu_volume" sort={devSort} onSort={k => setDevSort(toggleSort(devSort, k))} className="num" />
                <SortTh label="% D.Cust" sortKey="pct_cust_dom_eu" sort={devSort} onSort={k => setDevSort(toggleSort(devSort, k))} className="num" />
                <SortTh label="% D.Bal" sortKey="pct_bal_dom_eu" sort={devSort} onSort={k => setDevSort(toggleSort(devSort, k))} className="num" />
                <SortTh label="% D.Vol" sortKey="pct_vol_dom_eu" sort={devSort} onSort={k => setDevSort(toggleSort(devSort, k))} className="num" />
                <SortTh label="Cust Cust" sortKey="cust_eu_customers" sort={devSort} onSort={k => setDevSort(toggleSort(devSort, k))} className="num" style={{ borderLeft: '2px solid #f97316' }} />
                <SortTh label="Cust Bal" sortKey="cust_eu_balance" sort={devSort} onSort={k => setDevSort(toggleSort(devSort, k))} className="num" />
                <SortTh label="Cust Vol" sortKey="cust_eu_volume" sort={devSort} onSort={k => setDevSort(toggleSort(devSort, k))} className="num" />
                <SortTh label="% C.Cust" sortKey="pct_cust_custody_eu" sort={devSort} onSort={k => setDevSort(toggleSort(devSort, k))} className="num" />
                <SortTh label="% C.Bal" sortKey="pct_bal_custody_eu" sort={devSort} onSort={k => setDevSort(toggleSort(devSort, k))} className="num" />
                <SortTh label="% C.Vol" sortKey="pct_vol_custody_eu" sort={devSort} onSort={k => setDevSort(toggleSort(devSort, k))} className="num" />
              </tr>
            </thead>
            <tbody>
              {sortedDevs.map((d, i) => {
                const maxPct = Math.max(d.pct_cust_custody_eu ?? 0, d.pct_bal_custody_eu ?? 0, d.pct_vol_custody_eu ?? 0);
                const rowClass = maxPct >= 50 ? 'row-high-risk' : maxPct >= 15 ? 'row-med-risk' : '';
                return (
                  <tr key={i} className={rowClass}>
                    <td><strong>{d.developer_name}</strong></td>
                    <td className="num">{fmt(d.total_customers)}</td>
                    <td className="num">{fmtUsd(d.total_balance_usd)}</td>
                    <td className="num">{fmtUsd(d.total_jan_volume)}</td>
                    <td className={`num ${d.dom_eu_customers > 0 ? 'val-eu' : 'val-zero'}`} style={{ borderLeft: '2px solid #1d3a5f' }}>{fmt(d.dom_eu_customers)}</td>
                    <td className={`num ${d.dom_eu_balance > 0 ? 'val-eu' : 'val-zero'}`}>{d.dom_eu_balance > 0 ? fmtUsd(d.dom_eu_balance) : '-'}</td>
                    <td className={`num ${d.dom_eu_volume > 0 ? 'val-eu' : 'val-zero'}`}>{d.dom_eu_volume > 0 ? fmtUsd(d.dom_eu_volume) : '-'}</td>
                    <td className={`num ${pctClass(d.pct_cust_dom_eu)}`}>{d.pct_cust_dom_eu != null ? `${d.pct_cust_dom_eu}%` : '-'}</td>
                    <td className={`num ${pctClass(d.pct_bal_dom_eu)}`}>{d.pct_bal_dom_eu != null ? `${d.pct_bal_dom_eu}%` : '-'}</td>
                    <td className={`num ${pctClass(d.pct_vol_dom_eu)}`}>{d.pct_vol_dom_eu != null ? `${d.pct_vol_dom_eu}%` : '-'}</td>
                    <td className={`num ${d.cust_eu_customers > 0 ? '' : 'val-zero'}`} style={{ borderLeft: '2px solid #5c3010' }}>{fmt(d.cust_eu_customers)}</td>
                    <td className={`num ${d.cust_eu_balance > 0 ? '' : 'val-zero'}`}>{d.cust_eu_balance > 0 ? fmtUsd(d.cust_eu_balance) : '-'}</td>
                    <td className={`num ${d.cust_eu_volume > 0 ? '' : 'val-zero'}`}>{d.cust_eu_volume > 0 ? fmtUsd(d.cust_eu_volume) : '-'}</td>
                    <td className={`num ${pctClass(d.pct_cust_custody_eu)}`}>{d.pct_cust_custody_eu != null ? `${d.pct_cust_custody_eu}%` : '-'}</td>
                    <td className={`num ${pctClass(d.pct_bal_custody_eu)}`}>{d.pct_bal_custody_eu != null ? `${d.pct_bal_custody_eu}%` : '-'}</td>
                    <td className={`num ${pctClass(d.pct_vol_custody_eu)}`}>{d.pct_vol_custody_eu != null ? `${d.pct_vol_custody_eu}%` : '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer segmentation */}
      <div className="section" id="segmentation">
        <h2>Customer Segmentation</h2>
        <p className="subtitle">EU-Only vs Mixed vs Non-EU customers per developer. &quot;Fully stuck&quot; = customers with only EU wallets and no fallback.</p>
        <div className="table-container table-scroll">
          <table>
            <thead>
              <tr>
                <SortTh label="Developer" sortKey="developer_name" sort={segSort} onSort={k => setSegSort(toggleSort(segSort, k))} />
                <SortTh label="Total" sortKey="total_customers" sort={segSort} onSort={k => setSegSort(toggleSort(segSort, k))} className="num" />
                <SortTh label="EU-Only" sortKey="eu_only_customers" sort={segSort} onSort={k => setSegSort(toggleSort(segSort, k))} className="num" style={{ borderLeft: '2px solid #ef4444' }} />
                <SortTh label="EU-Only Bal" sortKey="eu_only_balance" sort={segSort} onSort={k => setSegSort(toggleSort(segSort, k))} className="num" />
                <SortTh label="Mixed" sortKey="mixed_customers" sort={segSort} onSort={k => setSegSort(toggleSort(segSort, k))} className="num" style={{ borderLeft: '2px solid #eab308' }} />
                <SortTh label="Mixed EU Bal" sortKey="mixed_eu_balance" sort={segSort} onSort={k => setSegSort(toggleSort(segSort, k))} className="num" />
                <SortTh label="Non-EU" sortKey="non_eu_customers" sort={segSort} onSort={k => setSegSort(toggleSort(segSort, k))} className="num" style={{ borderLeft: '2px solid #22c55e' }} />
                <SortTh label="Non-EU Bal" sortKey="non_eu_balance" sort={segSort} onSort={k => setSegSort(toggleSort(segSort, k))} className="num" />
                <SortTh label="% Stuck" sortKey="pct_fully_stuck" sort={segSort} onSort={k => setSegSort(toggleSort(segSort, k))} className="num" />
              </tr>
            </thead>
            <tbody>
              {sortedSegs.map((s, i) => {
                const rowClass = s.pct_fully_stuck >= 50 ? 'row-high-risk' : s.pct_fully_stuck >= 15 ? 'row-med-risk' : '';
                return (
                  <tr key={i} className={rowClass}>
                    <td><strong>{s.developer_name}</strong></td>
                    <td className="num">{fmt(s.total_customers)}</td>
                    <td className={`num ${s.eu_only_customers > 0 ? 'pct-high' : 'val-zero'}`} style={{ borderLeft: '2px solid #5c1a1a' }}>{s.eu_only_customers > 0 ? fmt(s.eu_only_customers) : '-'}</td>
                    <td className={`num ${s.eu_only_balance > 0 ? '' : 'val-zero'}`}>{s.eu_only_balance > 0 ? fmtUsd(s.eu_only_balance) : '-'}</td>
                    <td className={`num ${s.mixed_customers > 0 ? 'pct-med' : 'val-zero'}`} style={{ borderLeft: '2px solid #4a3a0a' }}>{s.mixed_customers > 0 ? fmt(s.mixed_customers) : '-'}</td>
                    <td className={`num ${s.mixed_eu_balance > 0 ? '' : 'val-zero'}`}>{s.mixed_eu_balance > 0 ? fmtUsd(s.mixed_eu_balance) : '-'}</td>
                    <td className={`num ${s.non_eu_customers > 0 ? 'pct-low' : 'val-zero'}`} style={{ borderLeft: '2px solid #0f3a1f' }}>{s.non_eu_customers > 0 ? fmt(s.non_eu_customers) : '-'}</td>
                    <td className={`num ${s.non_eu_balance > 0 ? '' : 'val-zero'}`}>{s.non_eu_balance > 0 ? fmtUsd(s.non_eu_balance) : '-'}</td>
                    <td className={`num ${pctClass(s.pct_fully_stuck)}`}>{s.pct_fully_stuck}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ color: '#525252', fontSize: '0.75rem', textAlign: 'center', padding: '2rem 0 1rem' }}>
        Data sourced from <a href="https://dbc-028a7c00-c649.cloud.databricks.com/editor/queries/4116199161485473?o=2242275340100390" target="_blank" rel="noopener" style={{ color: '#525252' }}>Databricks</a> &middot; Feb 2026
      </div>
    </div>
  );
}
