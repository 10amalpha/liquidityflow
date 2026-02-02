'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Activity, DollarSign, Gauge, Shield, Zap, Globe, BarChart3, Clock, Target, RefreshCw, Fuel, Banknote, Loader2 } from 'lucide-react';

// ============================================================
// DATOS — Última actualización: Febrero 2, 2026
// Sources: FRED (WALCL, WDTGAL, RRPONTSYD), BLS, ISM, Treasury DTS
// ============================================================
const DEFAULT_DATA = {
  fedBalance: 6.58,        // WALCL Jan 28, 2026: $6,584,580M
  tga: 0.968,              // DTS Jan 29, 2026: $968B (up from $841B)
  rrp: 0.006,              // RRPONTSYD Jan 30, 2026: ~$6B (effectively zero)
  tgaStressThreshold: 0.650,
  reserveAbundanceThreshold: 2.5,
  bankReserves: 2.99,
  vix: 16.4,
  vixTermStructure: 'contango',
  bojRate: 0.5,
  usdjpy: 155.2,
  jgb10y: 1.05,
  usjpyDangerThreshold: 145,
  dxy: 99.25,
  dxyAlertThreshold: 105,
  wti: 72.53,              // Updated from $59.44
  wtiAlertThreshold: 80,
  brent: 76.20,
  btcFundingRate: 0.008,
  btcOpenInterest: 45.2,
  btcMarketCap: 1850,
  ismManufacturing: 52.6,  // Jan 2026: EXPANSION (was 49.3 in Dec)
  cpiYoY: 2.7,             // Dec 2025 BLS
  coreCpiYoY: 2.6,         // Dec 2025 BLS: lowest since Mar 2021
  gdpGrowth: 2.3,          // Q4 2025 advance estimate
  us10y: 4.54,
  deficitToGdp: 5.2,
  gdpGrowthTarget: 3.0,
  oilProductionMbpd: 13.3,
  foreignTreasuryHoldings: 8.67,
  nextDebtCeilingDeadline: '2026-06-30', // X-date estimate mid-2026
  fedChairTermExpiry: '2026-05-15',
  midtermElection: '2026-11-03',
  lastUpdate: '2026-02-02T12:00:00',
};

// ============================================================
// COLORES
// ============================================================
const colors: Record<string, { bg: string; border: string; text: string }> = {
  bullish: { bg: 'rgba(16, 185, 129, 0.2)', border: 'rgba(16, 185, 129, 0.5)', text: '#34d399' },
  bearish: { bg: 'rgba(239, 68, 68, 0.2)', border: 'rgba(239, 68, 68, 0.5)', text: '#f87171' },
  neutral: { bg: 'rgba(100, 116, 139, 0.2)', border: 'rgba(100, 116, 139, 0.5)', text: '#94a3b8' },
  caution: { bg: 'rgba(245, 158, 11, 0.2)', border: 'rgba(245, 158, 11, 0.5)', text: '#fbbf24' },
};

// ============================================================
// METRIC CARD
// ============================================================
const MetricCard = ({ title, value, subtitle, status, icon: Icon, detail, threshold }: any) => {
  const color = colors[status as keyof typeof colors] || colors.neutral;
  
  return (
    <div style={{
      padding: '16px',
      borderRadius: '12px',
      border: `2px solid ${color.border}`,
      backgroundColor: color.bg,
      transition: 'transform 0.2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)' }}>
            <Icon style={{ width: '16px', height: '16px', color: color.text }} />
          </div>
          <span style={{ fontSize: '14px', fontWeight: 500, color: '#d1d5db' }}>{title}</span>
        </div>
        <span style={{
          padding: '4px 8px',
          borderRadius: '9999px',
          fontSize: '10px',
          fontWeight: 700,
          backgroundColor: color.text,
          color: '#0f172a',
        }}>
          {status.toUpperCase()}
        </span>
      </div>
      <div style={{ fontSize: '28px', fontWeight: 700, color: color.text, marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '12px', color: '#9ca3af' }}>{subtitle}</div>
      {threshold && (
        <div style={{ marginTop: '8px', fontSize: '11px', color: '#6b7280' }}>
          Umbral: {threshold}
        </div>
      )}
      {detail && (
        <div style={{ marginTop: '4px', fontSize: '11px', color: '#6b7280' }}>{detail}</div>
      )}
    </div>
  );
};

// ============================================================
// LIQUIDITY FORMULA
// ============================================================
const LiquidityFormula = ({ fedBalance, tga, rrp }: any) => {
  const netLiquidity = fedBalance - tga - rrp;
  return (
    <div style={{
      padding: '24px',
      borderRadius: '16px',
      background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(59, 130, 246, 0.1))',
      border: '1px solid rgba(6, 182, 212, 0.3)',
    }}>
      <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#22d3ee', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Activity style={{ width: '20px', height: '20px' }} />
        Net Liquidity Flow
      </h3>
      <div style={{ fontFamily: 'monospace', fontSize: '14px', marginBottom: '16px', color: '#94a3b8' }}>
        NET LIQUIDITY = FED BALANCE SHEET − TGA − RRP
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', fontFamily: 'monospace' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#22d3ee' }}>${fedBalance}T</div>
          <div style={{ fontSize: '10px', color: '#6b7280' }}>Fed Balance</div>
        </div>
        <span style={{ fontSize: '24px', color: '#ef4444' }}>−</span>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#fbbf24' }}>${tga.toFixed(2)}T</div>
          <div style={{ fontSize: '10px', color: '#6b7280' }}>TGA</div>
        </div>
        <span style={{ fontSize: '24px', color: '#ef4444' }}>−</span>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#a78bfa' }}>${rrp.toFixed(3)}T</div>
          <div style={{ fontSize: '10px', color: '#6b7280' }}>RRP</div>
        </div>
        <span style={{ fontSize: '24px', color: '#22d3ee' }}>=</span>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#34d399' }}>${netLiquidity.toFixed(2)}T</div>
          <div style={{ fontSize: '10px', color: '#6b7280' }}>Net Liquidity</div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// COUNTDOWN
// ============================================================
const CountdownCard = ({ label, date, icon: Icon }: any) => {
  const now = new Date();
  const target = new Date(date);
  const days = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isUrgent = days <= 30;
  
  return (
    <div style={{
      padding: '16px',
      borderRadius: '12px',
      backgroundColor: isUrgent ? 'rgba(239, 68, 68, 0.1)' : 'rgba(100, 116, 139, 0.1)',
      border: `1px solid ${isUrgent ? 'rgba(239, 68, 68, 0.3)' : 'rgba(100, 116, 139, 0.3)'}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <Icon style={{ width: '16px', height: '16px', color: isUrgent ? '#f87171' : '#9ca3af' }} />
        <span style={{ fontSize: '12px', color: '#9ca3af' }}>{label}</span>
      </div>
      <div style={{ fontSize: '24px', fontWeight: 700, color: isUrgent ? '#f87171' : '#e2e8f0' }}>{days}d</div>
      <div style={{ fontSize: '11px', color: '#6b7280' }}>{date}</div>
    </div>
  );
};

// ============================================================
// CHECKLIST ITEM
// ============================================================
const ChecklistItem = ({ label, checked, detail }: any) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '8px 0' }}>
    <div style={{
      width: '20px', height: '20px', borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: checked ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.4)',
      color: '#fff', fontSize: '12px', fontWeight: 700, flexShrink: 0, marginTop: '2px',
    }}>
      {checked ? '✓' : '✗'}
    </div>
    <div>
      <div style={{ fontSize: '13px', color: checked ? '#34d399' : '#f87171', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: '11px', color: '#6b7280' }}>{detail}</div>
    </div>
  </div>
);

// ============================================================
// MAIN DASHBOARD
// ============================================================
export default function Dashboard() {
  const [data, setData] = useState(DEFAULT_DATA);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [btcPrice, setBtcPrice] = useState<number | null>(null);
  const [btcChange, setBtcChange] = useState<number | null>(null);
  const [lastBtcUpdate, setLastBtcUpdate] = useState<string | null>(null);

  // Fetch data from API (with fallback to defaults)
  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const res = await fetch('/api/liquidity');
      if (res.ok) {
        const apiData = await res.json();
        setData(apiData);
      } else {
        console.log('API unavailable, using defaults.');
      }
    } catch {
      console.log('API unavailable, using defaults.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // BTC live price
  useEffect(() => {
    const fetchBtc = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true');
        const json = await res.json();
        if (json.bitcoin) {
          setBtcPrice(json.bitcoin.usd);
          setBtcChange(json.bitcoin.usd_24h_change);
          setLastBtcUpdate(new Date().toLocaleTimeString());
        }
      } catch { /* silent */ }
    };
    fetchBtc();
    const interval = setInterval(fetchBtc, 60000);
    return () => clearInterval(interval);
  }, []);

  const netLiquidity = data.fedBalance - data.tga - data.rrp;

  // Status calculations
  const tgaStatus = data.tga > data.tgaStressThreshold ? 'caution' : 'bullish';
  const rrpStatus = data.rrp < 0.1 ? 'bullish' : 'caution';
  const vixStatus = data.vix < 15 ? 'caution' : data.vix > 40 ? 'bullish' : data.vix <= 25 ? 'bullish' : 'caution';
  const usdJpyStatus = data.usdjpy > data.usjpyDangerThreshold ? 'bullish' : 'bearish';
  const dxyStatus = data.dxy < data.dxyAlertThreshold ? 'bullish' : 'bearish';
  const wtiStatus = data.wti < data.wtiAlertThreshold ? 'bullish' : 'bearish';
  const reservesStatus = data.bankReserves > data.reserveAbundanceThreshold ? 'bullish' : 'caution';
  const ismStatus = data.ismManufacturing > 50 ? 'bullish' : data.ismManufacturing > 42.3 ? 'neutral' : 'bearish';

  const statuses = [tgaStatus, rrpStatus, vixStatus, usdJpyStatus, dxyStatus, wtiStatus, reservesStatus];
  const bullishCount = statuses.filter(s => s === 'bullish').length;
  const cautionCount = statuses.filter(s => s === 'caution').length;
  const bearishCount = statuses.filter(s => s === 'bearish').length;

  let overallSignal = 'NEUTRAL';
  let signalColor = '#94a3b8';
  let signalBg = 'rgba(100, 116, 139, 0.2)';
  let signalDescription = 'Condiciones mixtas. Mantener posiciones actuales.';

  if (bearishCount >= 2) {
    overallSignal = 'RISK OFF';
    signalColor = '#f87171';
    signalBg = 'rgba(239, 68, 68, 0.2)';
    signalDescription = 'Reducir exposición a risk assets. Aumentar cash y hedges.';
  } else if (bullishCount >= 5 && bearishCount === 0) {
    overallSignal = 'RISK ON';
    signalColor = '#34d399';
    signalBg = 'rgba(16, 185, 129, 0.2)';
    signalDescription = `${bullishCount} señales bullish. Condiciones favorables para risk assets y posiciones largas.`;
  } else if (cautionCount >= 3) {
    overallSignal = 'CAUTION';
    signalColor = '#fbbf24';
    signalBg = 'rgba(245, 158, 11, 0.2)';
    signalDescription = 'Volatilidad esperada. Reducir tamaño de posiciones.';
  } else if (bullishCount >= 4) {
    overallSignal = 'RISK ON';
    signalColor = '#34d399';
    signalBg = 'rgba(16, 185, 129, 0.2)';
    signalDescription = `${bullishCount} señales bullish. Mantener o incrementar exposición.`;
  }

  const usJapanSpread = (data.us10y || 4.54) - (data.jgb10y || 1.05);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#030712', color: '#e2e8f0', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px 16px 32px' }}>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 700, background: 'linear-gradient(to right, #22d3ee, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                  LiquidityFlow
                </h1>
                <a href="https://10ampro-hub.vercel.app/" target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: '#6b7280', textDecoration: 'none', padding: '2px 8px', border: '1px solid rgba(100,116,139,0.3)', borderRadius: '4px' }}>
                  ← Dashboards
                </a>
              </div>
              <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>
                Monitoreo de liquidez macro en tiempo real
              </p>
              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                  Última actualización: {new Date(data.lastUpdate).toLocaleString()}
                </span>
                <button
                  onClick={() => fetchData(true)}
                  disabled={refreshing}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '4px 12px', borderRadius: '6px',
                    border: '1px solid rgba(100, 116, 139, 0.3)',
                    backgroundColor: refreshing ? 'rgba(100, 116, 139, 0.2)' : 'transparent',
                    color: '#9ca3af', fontSize: '12px',
                    cursor: refreshing ? 'not-allowed' : 'pointer',
                  }}
                >
                  {refreshing ? (
                    <Loader2 style={{ width: '12px', height: '12px', animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <RefreshCw style={{ width: '12px', height: '12px' }} />
                  )}
                  {refreshing ? 'Updating...' : 'Refresh'}
                </button>
              </div>
            </div>

            {/* BTC Price */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 16px', borderRadius: '8px', background: 'rgba(247, 147, 26, 0.1)', border: '1px solid rgba(247, 147, 26, 0.2)' }}>
              <span style={{ fontSize: '18px' }}>₿</span>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#f7931a' }}>
                  {btcPrice ? `$${btcPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '...'}
                </div>
                {btcChange !== null && (
                  <div style={{ fontSize: '11px', color: btcChange >= 0 ? '#34d399' : '#f87171' }}>
                    {btcChange >= 0 ? '▲' : '▼'} {Math.abs(btcChange).toFixed(1)}% 24h
                    {lastBtcUpdate && <span style={{ color: '#6b7280' }}> · {lastBtcUpdate}</span>}
                  </div>
                )}
              </div>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#34d399', animation: 'pulse 2s infinite' }} />
            </div>
          </div>
        </div>

        {/* Overall Signal */}
        <div style={{ marginBottom: '24px', padding: '16px 20px', borderRadius: '16px', background: signalBg, border: `2px solid ${signalColor}60` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: signalColor }}>{overallSignal}</div>
              <div style={{ fontSize: '13px', color: '#94a3b8', maxWidth: '600px' }}>{signalDescription}</div>
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '14px' }}>
              <span style={{ color: '#34d399' }}>● {bullishCount} Bullish</span>
              <span style={{ color: '#fbbf24' }}>● {cautionCount} Caution</span>
              <span style={{ color: '#f87171' }}>● {bearishCount} Bearish</span>
            </div>
          </div>
        </div>

        {/* Countdowns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          <CountdownCard label="Debt Ceiling X-Date" date={data.nextDebtCeilingDeadline} icon={AlertTriangle} />
          <CountdownCard label="Powell Term Expires" date={data.fedChairTermExpiry} icon={Clock} />
          <CountdownCard label="Midterms" date={data.midtermElection} icon={Globe} />
        </div>

        {/* Net Liquidity Formula */}
        <div style={{ marginBottom: '24px' }}>
          <LiquidityFormula fedBalance={data.fedBalance} tga={data.tga} rrp={data.rrp} />
        </div>

        {/* Main Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <MetricCard
            title="TGA"
            value={`$${(data.tga * 1000).toFixed(0)}B`}
            subtitle="Treasury General Account"
            status={tgaStatus}
            icon={Banknote}
            threshold={`< $${data.tgaStressThreshold * 1000}B`}
            detail="Alto = drena liquidez. Bessent puede inyectar bajándola."
          />
          <MetricCard
            title="RRP"
            value={`$${(data.rrp * 1000).toFixed(0)}B`}
            subtitle="Reverse Repo Facility"
            status={rrpStatus}
            icon={DollarSign}
            threshold="< $100B"
            detail="Drenado a cero = máxima liquidez disponible"
          />
          <MetricCard
            title="DXY"
            value={data.dxy.toFixed(2)}
            subtitle="Dollar Index"
            status={dxyStatus}
            icon={DollarSign}
            threshold={`< ${data.dxyAlertThreshold}`}
            detail="Alto = presión risk assets"
          />
          <MetricCard
            title="WTI"
            value={`$${data.wti.toFixed(2)}`}
            subtitle="Crude Oil"
            status={wtiStatus}
            icon={Fuel}
            threshold={`< $${data.wtiAlertThreshold}`}
            detail="Alto = presión inflación"
          />
          <MetricCard
            title="VIX"
            value={data.vix.toFixed(1)}
            subtitle="Volatility Index"
            status={vixStatus}
            icon={Activity}
            threshold="15-25 normal"
            detail={data.vix < 15 ? '⚠️ Complacencia' : data.vix > 40 ? '🔥 Capitulación = oportunidad' : '✓ Normal'}
          />
        </div>

        {/* Japan Carry Trade */}
        <div style={{ marginBottom: '24px', padding: '20px', borderRadius: '16px', backgroundColor: 'rgba(100, 116, 139, 0.1)', border: '1px solid rgba(100, 116, 139, 0.3)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#e2e8f0', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 12px 0' }}>
            <Globe style={{ width: '18px', height: '18px', color: '#60a5fa' }} />
            Japan Carry Trade
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>USD/JPY</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: data.usdjpy > 145 ? '#34d399' : '#f87171' }}>{data.usdjpy}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>BOJ Rate</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#e2e8f0' }}>{data.bojRate}%</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>JGB 10Y</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#e2e8f0' }}>{data.jgb10y}%</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>US-JP Spread</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: usJapanSpread > 3 ? '#34d399' : '#fbbf24' }}>{usJapanSpread.toFixed(2)}%</div>
            </div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '11px', color: '#f87171', padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.08)' }}>
            ⚠️ Si USD/JPY {'<'} 145: Riesgo de unwinding violento del carry trade (ver Agosto 2024)
          </div>
        </div>

        {/* ISM + Macro Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <MetricCard
            title="ISM Manufacturing"
            value={data.ismManufacturing.toString()}
            subtitle={data.ismManufacturing > 50 ? '✅ Expansión' : '🔻 Contracción'}
            status={ismStatus}
            icon={BarChart3}
            detail={data.ismManufacturing > 50 ? 'Primera expansión en 12 meses. New Orders 57.1. Reflación confirmada.' : '>42.3 = GDP positivo'}
          />
          <MetricCard
            title="CPI YoY"
            value={`${data.cpiYoY}%`}
            subtitle={`Core: ${data.coreCpiYoY}%`}
            status={data.cpiYoY < 2.5 ? 'bullish' : data.cpiYoY < 3.5 ? 'neutral' : 'bearish'}
            icon={TrendingUp}
            detail="Bessent: caída sustancial inflación H1 2026"
          />
          <MetricCard
            title="US 10Y Yield"
            value={`${data.us10y}%`}
            subtitle="Treasury 10 años"
            status={data.us10y > 5 ? 'bearish' : data.us10y > 4.5 ? 'caution' : 'neutral'}
            icon={DollarSign}
          />
          <MetricCard
            title="GDP Q4 2025"
            value={`${data.gdpGrowth}%`}
            subtitle="Advance Estimate"
            status={data.gdpGrowth > 2 ? 'bullish' : 'neutral'}
            icon={Zap}
          />
        </div>

        {/* Checklist de Posicionamiento */}
        <div style={{ marginBottom: '24px', padding: '20px', borderRadius: '16px', backgroundColor: 'rgba(100, 116, 139, 0.08)', border: '1px solid rgba(100, 116, 139, 0.2)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#e2e8f0', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 16px 0' }}>
            <Shield style={{ width: '18px', height: '18px', color: '#a78bfa' }} />
            Checklist de Posicionamiento
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 32px' }}>
            <ChecklistItem
              label="TGA bajo umbral de estrés"
              checked={data.tga < data.tgaStressThreshold}
              detail={`Treasury General Account $${(data.tga * 1000).toFixed(0)}B vs <$${data.tgaStressThreshold * 1000}B`}
            />
            <ChecklistItem
              label="RRP drenado"
              checked={data.rrp < 0.1}
              detail={`Reverse Repo Facility $${(data.rrp * 1000).toFixed(0)}B vs <$100B`}
            />
            <ChecklistItem
              label="ISM en expansión"
              checked={data.ismManufacturing > 50}
              detail={`ISM PMI ${data.ismManufacturing} vs >50. Reflación macro activa.`}
            />
            <ChecklistItem
              label="VIX en rango normal"
              checked={data.vix >= 15 && data.vix <= 25}
              detail={`Índice de volatilidad ${data.vix} vs 15-25`}
            />
            <ChecklistItem
              label="Yen estable (carry trade safe)"
              checked={data.usdjpy > data.usjpyDangerThreshold}
              detail={`USD/JPY tipo de cambio ~${data.usdjpy.toFixed(2)}`}
            />
            <ChecklistItem
              label="Dollar no demasiado fuerte"
              checked={data.dxy < data.dxyAlertThreshold}
              detail={`Dollar Index ${data.dxy} vs <${data.dxyAlertThreshold}`}
            />
            <ChecklistItem
              label="Petróleo bajo control"
              checked={data.wti < data.wtiAlertThreshold}
              detail={`WTI Crude Oil $${data.wti.toFixed(2)} vs <$${data.wtiAlertThreshold}`}
            />
            <ChecklistItem
              label="Inflación en desinflación"
              checked={data.cpiYoY < 3}
              detail={`CPI ${data.cpiYoY}% YoY, Core ${data.coreCpiYoY}%`}
            />
            <ChecklistItem
              label="Carry trade spread sano"
              checked={usJapanSpread > 3}
              detail={`US-Japan spread ${usJapanSpread.toFixed(2)}%`}
            />
          </div>
        </div>

        {/* Bessent 3-3-3 Framework */}
        <div style={{ marginBottom: '24px', padding: '20px', borderRadius: '16px', backgroundColor: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#34d399', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 12px 0' }}>
            <Target style={{ width: '18px', height: '18px' }} />
            Framework Bessent 3-3-3
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.08)' }}>
              <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Déficit → 3% GDP</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: data.deficitToGdp > 4 ? '#fbbf24' : '#34d399' }}>
                {data.deficitToGdp}%
              </div>
              <div style={{ fontSize: '10px', color: '#6b7280' }}>Meta: 3.0%</div>
            </div>
            <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.08)' }}>
              <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>GDP Growth → 3%</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: data.gdpGrowth >= 3 ? '#34d399' : '#fbbf24' }}>
                {data.gdpGrowth}%
              </div>
              <div style={{ fontSize: '10px', color: '#6b7280' }}>Meta: 3.0%</div>
            </div>
            <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.08)' }}>
              <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Oil Production → 3M bpd+</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#34d399' }}>
                {data.oilProductionMbpd}M
              </div>
              <div style={{ fontSize: '10px', color: '#6b7280' }}>bpd</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', color: '#4b5563', fontSize: '12px', borderTop: '1px solid rgba(100, 116, 139, 0.2)', paddingTop: '24px' }}>
          <p style={{ margin: '0 0 4px 0', fontStyle: 'italic' }}>
            &quot;El algoritmo es el mapa. La ejecución disciplinada es el territorio.&quot;
          </p>
          <p style={{ margin: 0 }}>
            Dashboard basado en el Algoritmo del 10x y el Framework Bessent · <span style={{ color: '#34d399' }}>10AMPRO</span>
          </p>
        </div>

      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
