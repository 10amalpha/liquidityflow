'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Activity, DollarSign, Gauge, Shield, Zap, Globe, BarChart3, Clock, Target, RefreshCw, Fuel, Banknote, Loader2 } from 'lucide-react';

// Datos por defecto (fallback)
const DEFAULT_DATA = {
  fedBalance: 6.58,
  tga: 0.841,
  rrp: 0.005,
  tgaStressThreshold: 0.650,
  reserveAbundanceThreshold: 2.5,
  bankReserves: 2.99,
  vix: 15.4,
  vixTermStructure: 'contango',
  bojRate: 0.5,
  usdjpy: 158.0,
  jgb10y: 1.05,
  usjpyDangerThreshold: 145,
  dxy: 99.25,
  dxyAlertThreshold: 105,
  wti: 59.44,
  wtiAlertThreshold: 80,
  brent: 64.13,
  btcFundingRate: 0.008,
  btcOpenInterest: 45.2,
  btcMarketCap: 1850,
  ismManufacturing: 48.2,
  cpiYoY: 2.7,
  coreCpiYoY: 2.8,
  gdpGrowth: 4.3,
  us10y: 4.52,
  deficitToGdp: 5.2,
  gdpGrowthTarget: 3.0,
  oilProductionMbpd: 13.3,
  nextDebtCeilingDeadline: '2026-01-30',
  fedChairTermExpiry: '2026-05-15',
  midtermElection: '2026-11-03',
  lastUpdate: new Date().toISOString(),
};

// Colores
const colors = {
  bullish: { bg: 'rgba(16, 185, 129, 0.2)', border: 'rgba(16, 185, 129, 0.5)', text: '#34d399' },
  bearish: { bg: 'rgba(239, 68, 68, 0.2)', border: 'rgba(239, 68, 68, 0.5)', text: '#f87171' },
  neutral: { bg: 'rgba(100, 116, 139, 0.2)', border: 'rgba(100, 116, 139, 0.5)', text: '#94a3b8' },
  caution: { bg: 'rgba(245, 158, 11, 0.2)', border: 'rgba(245, 158, 11, 0.5)', text: '#fbbf24' },
};

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
        <div style={{ marginTop: '8px', fontSize: '11px', color: '#6b7280' }}>{detail}</div>
      )}
    </div>
  );
};

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
        NET LIQUIDITY FLOW
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
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#a78bfa' }}>${rrp.toFixed(2)}T</div>
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

const SignalGauge = ({ label, value, threshold, unit, isAboveGood }: any) => {
  const isGood = isAboveGood ? value >= threshold : value <= threshold;
  const percentage = Math.min((value / (threshold * 1.5)) * 100, 100);
  
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '12px', color: '#9ca3af' }}>{label}</span>
        <span style={{ fontSize: '12px', fontWeight: 600, color: isGood ? '#34d399' : '#f87171' }}>
          {value}{unit}
        </span>
      </div>
      <div style={{ height: '8px', backgroundColor: 'rgba(100, 116, 139, 0.3)', borderRadius: '9999px', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${percentage}%`,
          backgroundColor: isGood ? '#34d399' : '#f87171',
          borderRadius: '9999px',
          transition: 'width 0.5s',
        }} />
      </div>
      <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>
        Objetivo: {isAboveGood ? '>' : '<'}{threshold}{unit}
      </div>
    </div>
  );
};

const ChecklistItem = ({ label, checked, metric, value, threshold }: any) => (
  <div style={{
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: checked ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
    border: `1px solid ${checked ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
  }}>
    <div style={{
      width: '20px',
      height: '20px',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: checked ? '#34d399' : '#f87171',
      color: '#0f172a',
      fontSize: '12px',
      fontWeight: 700,
      flexShrink: 0,
    }}>
      {checked ? '✓' : '✗'}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '13px', fontWeight: 500, color: checked ? '#34d399' : '#f87171' }}>{label}</div>
      <div style={{ fontSize: '11px', color: '#6b7280' }}>{metric}</div>
      <div style={{ fontSize: '11px', color: '#9ca3af' }}>{value}</div>
      <div style={{ fontSize: '10px', color: '#6b7280' }}>vs {threshold}</div>
    </div>
  </div>
);

const CountdownCard = ({ label, date, icon: Icon }: any) => {
  const daysUntil = (dateStr: string): number => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };
  const days = daysUntil(date);
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

export default function Dashboard() {
  const [data, setData] = useState(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      
      const res = await fetch('/api/liquidity');
      if (!res.ok) throw new Error('Failed to fetch data');
      
      const newData = await res.json();
      setData({ ...DEFAULT_DATA, ...newData });
      setError(null);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Error al cargar datos. Usando valores por defecto.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => fetchData(true), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);
  
  const netLiquidity = data.fedBalance - data.tga - data.rrp;
  
  // Determinar status de cada métrica
  const tgaStatus = data.tga > data.tgaStressThreshold ? 'caution' : 'bullish';
  const rrpStatus = data.rrp < 0.1 ? 'bullish' : 'caution';
  const vixStatus = data.vix < 15 ? 'caution' : data.vix > 40 ? 'bullish' : data.vix <= 25 ? 'bullish' : 'caution';
  const usdJpyStatus = data.usdjpy > data.usjpyDangerThreshold ? 'bullish' : 'bearish';
  const dxyStatus = data.dxy < data.dxyAlertThreshold ? 'bullish' : 'bearish';
  const wtiStatus = data.wti < data.wtiAlertThreshold ? 'bullish' : 'bearish';
  const reservesStatus = data.bankReserves > data.reserveAbundanceThreshold ? 'bullish' : 'caution';
  
  // Contar señales
  const statuses = [tgaStatus, rrpStatus, vixStatus, usdJpyStatus, dxyStatus, wtiStatus, reservesStatus];
  const bullishCount = statuses.filter(s => s === 'bullish').length;
  const cautionCount = statuses.filter(s => s === 'caution').length;
  const bearishCount = statuses.filter(s => s === 'bearish').length;
  
  // Señal general
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
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#030712',
        color: '#e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 style={{ 
            width: '48px', 
            height: '48px', 
            color: '#22d3ee',
            animation: 'spin 1s linear infinite',
          }} />
          <p style={{ marginTop: '16px', color: '#9ca3af' }}>Cargando datos de mercado...</p>
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#030712',
      color: '#e2e8f0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      {/* Top Navigation Bar */}
      <div style={{
        backgroundColor: '#1e293b',
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(100, 116, 139, 0.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity style={{ width: '20px', height: '20px', color: '#22d3ee' }} />
          <span style={{ fontSize: '16px', fontWeight: 600, color: '#e2e8f0' }}>LiquidityFlow</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <a href="https://10am.pro" target="_blank" rel="noopener noreferrer" style={{ fontSize: '14px', color: '#94a3b8', textDecoration: 'none' }}>10am.pro</a>
          <a href="https://10am.pro/dashboards" target="_blank" rel="noopener noreferrer" style={{ fontSize: '14px', color: '#94a3b8', textDecoration: 'none' }}>Dashboards</a>
          <a href="https://twitter.com/holdmybirra" target="_blank" rel="noopener noreferrer" style={{ fontSize: '14px', color: '#94a3b8', textDecoration: 'none' }}>@holdmybirra</a>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Activity style={{ width: '32px', height: '32px', color: '#22d3ee' }} />
            <h1 style={{
              fontSize: '36px',
              fontWeight: 700,
              background: 'linear-gradient(to right, #22d3ee, #3b82f6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0,
            }}>
              LiquidityFlow
            </h1>
          </div>
          <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>Monitoreo de liquidez macro en tiempo real</p>
          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>
              Última actualización: {new Date(data.lastUpdate).toLocaleString()}
            </span>
            <button 
              onClick={() => fetchData(true)}
              disabled={refreshing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 12px',
                borderRadius: '6px',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                backgroundColor: refreshing ? 'rgba(100, 116, 139, 0.2)' : 'transparent',
                color: '#9ca3af',
                fontSize: '12px',
                cursor: refreshing ? 'not-allowed' : 'pointer',
              }}
            >
              {refreshing ? (
                <Loader2 style={{ width: '12px', height: '12px', animation: 'spin 1s linear infinite' }} />
              ) : (
                <RefreshCw style={{ width: '12px', height: '12px' }} />
              )}
              {refreshing ? 'Actualizando...' : 'Actualizar'}
            </button>
            {error && (
              <span style={{ fontSize: '11px', color: '#f87171' }}>{error}</span>
            )}
          </div>
        </div>

        {/* Overall Signal */}
        <div style={{
          padding: '24px',
          borderRadius: '16px',
          backgroundColor: signalBg,
          border: `2px solid ${signalColor}`,
          marginBottom: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>SEÑAL GENERAL</div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: signalColor }}>{overallSignal}</div>
              <div style={{ fontSize: '14px', color: '#9ca3af', marginTop: '4px' }}>{signalDescription}</div>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#34d399' }}>{bullishCount}</div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>Bullish</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#fbbf24' }}>{cautionCount}</div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>Caution</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#f87171' }}>{bearishCount}</div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>Bearish</div>
              </div>
            </div>
          </div>
        </div>

        {/* Countdowns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <CountdownCard label="Debt Ceiling" date={data.nextDebtCeilingDeadline} icon={Clock} />
          <CountdownCard label="Fed Chair Term" date={data.fedChairTermExpiry} icon={Target} />
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
            detail="Alto = drena liquidez"
          />
          <MetricCard
            title="RRP"
            value={`$${(data.rrp * 1000).toFixed(0)}B`}
            subtitle="Reverse Repo Facility"
            status={rrpStatus}
            icon={DollarSign}
            threshold="< $100B"
            detail="Drenado = más liquidez"
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
            detail={data.vix < 15 ? '⚠️ Complacencia' : data.vix > 40 ? '🎯 Oportunidad' : '✓ Normal'}
          />
          <MetricCard
            title="Bank Reserves"
            value={`$${data.bankReserves}T`}
            subtitle="Reservas Bancarias"
            status={reservesStatus}
            icon={Shield}
            threshold={`> $${data.reserveAbundanceThreshold}T`}
            detail="Abundancia = estabilidad"
          />
        </div>

        {/* Japan Carry Trade Section */}
        <div style={{
          padding: '24px',
          borderRadius: '16px',
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          marginBottom: '24px',
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#c4b5fd', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe style={{ width: '20px', height: '20px' }} />
            Japan Carry Trade
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#9ca3af' }}>USD/JPY</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: usdJpyStatus === 'bullish' ? '#34d399' : '#f87171' }}>
                {data.usdjpy}
              </div>
              <div style={{ fontSize: '10px', color: '#6b7280' }}>Umbral: &gt;{data.usjpyDangerThreshold}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#9ca3af' }}>BOJ Rate</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#c4b5fd' }}>{data.bojRate}%</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#9ca3af' }}>JGB 10Y</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#c4b5fd' }}>{data.jgb10y}%</div>
            </div>
          </div>
          {data.usdjpy < data.usjpyDangerThreshold && (
            <div style={{
              marginTop: '16px',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <AlertTriangle style={{ width: '16px', height: '16px', color: '#f87171' }} />
              <span style={{ fontSize: '13px', color: '#f87171' }}>
                ⚠️ Si USD/JPY &lt; {data.usjpyDangerThreshold}: Riesgo de unwinding violento (ver Agosto 2024)
              </span>
            </div>
          )}
        </div>

        {/* Checklist */}
        <div style={{
          padding: '24px',
          borderRadius: '16px',
          backgroundColor: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid rgba(100, 116, 139, 0.3)',
          marginBottom: '24px',
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#e2e8f0', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target style={{ width: '20px', height: '20px', color: '#22d3ee' }} />
            Checklist de Posicionamiento
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            <ChecklistItem
              label="TGA bajo umbral"
              checked={data.tga < data.tgaStressThreshold}
              metric="Treasury General Account"
              value={`$${(data.tga * 1000).toFixed(0)}B`}
              threshold={`<$${data.tgaStressThreshold * 1000}B`}
            />
            <ChecklistItem
              label="RRP drenado"
              checked={data.rrp < 0.1}
              metric="Reverse Repo Facility"
              value={`$${(data.rrp * 1000).toFixed(0)}B`}
              threshold="<$100B"
            />
            <ChecklistItem
              label="VIX en rango normal"
              checked={data.vix >= 15 && data.vix <= 25}
              metric="Índice de volatilidad"
              value={data.vix.toFixed(1)}
              threshold="15-25"
            />
            <ChecklistItem
              label="Yen estable (carry trade safe)"
              checked={data.usdjpy > data.usjpyDangerThreshold}
              metric="USD/JPY tipo de cambio"
              value={data.usdjpy.toFixed(2)}
              threshold={`>${data.usjpyDangerThreshold}`}
            />
            <ChecklistItem
              label="Dollar no demasiado fuerte"
              checked={data.dxy < data.dxyAlertThreshold}
              metric="Dollar Index"
              value={data.dxy.toFixed(2)}
              threshold={`<${data.dxyAlertThreshold}`}
            />
            <ChecklistItem
              label="Petróleo bajo control"
              checked={data.wti < data.wtiAlertThreshold}
              metric="WTI Crude Oil"
              value={`$${data.wti.toFixed(2)}`}
              threshold={`<$${data.wtiAlertThreshold}`}
            />
            <ChecklistItem
              label="Reservas bancarias abundantes"
              checked={data.bankReserves > data.reserveAbundanceThreshold}
              metric="Bank Reserves"
              value={`$${data.bankReserves}T`}
              threshold={`>$${data.reserveAbundanceThreshold}T`}
            />
          </div>
        </div>

        {/* Bessent 3-3-3 Framework */}
        <div style={{
          padding: '24px',
          borderRadius: '16px',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          marginBottom: '24px',
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#93c5fd', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target style={{ width: '20px', height: '20px' }} />
            Framework Bessent 3-3-3
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <SignalGauge label="Deficit/GDP" value={data.deficitToGdp} threshold={3} unit="%" isAboveGood={false} />
            <SignalGauge label="GDP Growth" value={data.gdpGrowth} threshold={3} unit="%" isAboveGood={true} />
            <SignalGauge label="Oil Production" value={data.oilProductionMbpd} threshold={16} unit="M bpd" isAboveGood={true} />
          </div>
        </div>

        {/* Macro Data Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <MetricCard
            title="ISM Manufacturing"
            value={data.ismManufacturing}
            subtitle="Contracción"
            status={data.ismManufacturing > 50 ? 'bullish' : data.ismManufacturing > 47.3 ? 'neutral' : 'bearish'}
            icon={BarChart3}
            detail=">47.3 = GDP positivo"
          />
          <MetricCard
            title="CPI YoY"
            value={`${data.cpiYoY}%`}
            subtitle={`Core: ${data.coreCpiYoY}%`}
            status={data.cpiYoY < 3 ? 'neutral' : 'caution'}
            icon={TrendingUp}
          />
          <MetricCard
            title="US 10Y Yield"
            value={`${data.us10y}%`}
            subtitle="Treasury 10 años"
            status="neutral"
            icon={TrendingDown}
          />
          <MetricCard
            title="GDP Q3 2025"
            value={`${data.gdpGrowth}%`}
            subtitle="Anualizado"
            status="bullish"
            icon={Zap}
            detail="vs consenso 3.2%"
          />
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', paddingTop: '24px', borderTop: '1px solid rgba(100, 116, 139, 0.2)' }}>
          <p style={{ fontSize: '12px', color: '#6b7280', fontStyle: 'italic' }}>
            "El algoritmo es el mapa, la ejecución disciplinada es el territorio."
          </p>
          <p style={{ fontSize: '11px', color: '#4b5563', marginTop: '8px' }}>
            LiquidityFlow • Powered by 10AMPRO
          </p>
        </div>
      </div>
    </div>
  );
}
