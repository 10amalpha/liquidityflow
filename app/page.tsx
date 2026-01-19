'use client';

import React, { useState } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Activity, DollarSign, Gauge, Shield, Zap, Globe, BarChart3, Clock, Target, RefreshCw, Fuel, Banknote } from 'lucide-react';

// Datos actuales - Enero 19, 2026
const CURRENT_DATA = {
  // Liquidez Neta = Balance Fed - TGA - RRP
  fedBalance: 6.58, // Trillones (Jan 14, 2026)
  tga: 0.841, // Trillones (841B - Jan 15, 2026)
  rrp: 0.005, // Trillones (~5B - efectivamente drenado)
  
  // Umbrales críticos CORREGIDOS
  tgaStressThreshold: 0.650, // $650B - tu umbral
  reserveAbundanceThreshold: 2.5, // 2.5T
  bankReserves: 2.89, // Trillones
  
  // VIX
  vix: 15.4,
  vixTermStructure: 'contango',
  
  // Japan Carry Trade
  bojRate: 0.5,
  usdjpy: 158.0, // Jan 16, 2026
  jgb10y: 1.95,
  usjpyDangerThreshold: 145, // Tu umbral
  
  // DXY y Petróleo - NUEVOS
  dxy: 99.25, // Jan 19, 2026
  dxyAlertThreshold: 105, // Tu umbral
  wti: 59.44, // Jan 16, 2026
  wtiAlertThreshold: 80, // Tu umbral
  brent: 64.13,
  
  // Crypto Leverage
  btcFundingRate: 0.008,
  btcOpenInterest: 45.2,
  btcMarketCap: 1850,
  
  // Macro
  ismManufacturing: 48.2,
  cpiYoY: 2.7,
  coreCpiYoY: 2.6,
  gdpGrowth: 4.3,
  
  // Treasury
  us10y: 4.52,
  foreignTreasuryHoldings: 9.05,
  chinaHoldings: 0.756,
  japanHoldings: 1.18,
  
  // Gold/Copper Ratio
  goldCopperRatio: 0.00068,
  goldCopperCrisisLevel: 0.0015,
  
  // Bessent Framework 3-3-3
  deficitToGdp: 6.2,
  gdpGrowthTarget: 3.0,
  oilProductionMbpd: 13.2,
  
  // Fechas importantes
  nextDebtCeilingDeadline: '2026-01-30',
  fedChairTermExpiry: '2026-05-15',
  midtermElection: '2026-11-03',
  
  // Última actualización
  lastUpdate: '2026-01-19T12:00:00',
};

const MetricCard = ({ title, value, subtitle, status, icon: Icon, detail, threshold }) => {
  const statusColors = {
    bullish: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400',
    bearish: 'bg-red-500/20 border-red-500/50 text-red-400',
    neutral: 'bg-slate-500/20 border-slate-500/50 text-slate-400',
    caution: 'bg-amber-500/20 border-amber-500/50 text-amber-400',
  };

  const statusBg = {
    bullish: 'bg-emerald-500',
    bearish: 'bg-red-500',
    neutral: 'bg-slate-500',
    caution: 'bg-amber-500',
  };

  const statusLabel = {
    bullish: 'BULLISH',
    bearish: 'BEARISH',
    neutral: 'NEUTRAL',
    caution: 'CAUTION',
  };

  return (
    <div className={`p-4 rounded-xl border-2 ${statusColors[status]} backdrop-blur-sm transition-all hover:scale-[1.02]`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-white/5">
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium text-gray-300">{title}</span>
        </div>
        <div className={`px-2 py-0.5 rounded text-xs font-bold ${statusBg[status]} text-white`}>
          {statusLabel[status]}
        </div>
      </div>
      <div className="text-3xl font-black text-white mb-1">{value}</div>
      {subtitle && <div className="text-sm text-gray-400">{subtitle}</div>}
      {threshold && <div className="text-xs text-gray-500 mt-2 font-mono">Umbral: {threshold}</div>}
      {detail && <div className="text-xs text-gray-500 mt-1">{detail}</div>}
    </div>
  );
};

const LiquidityFormula = ({ fedBalance, tga, rrp }) => {
  const netLiquidity = fedBalance - tga - rrp;
  
  return (
    <div className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 rounded-2xl p-6 border border-cyan-500/30">
      <div className="text-center mb-6">
        <div className="text-sm text-cyan-300 mb-2 font-mono">NET LIQUIDITY FLOW</div>
        <div className="flex items-center justify-center gap-2 text-xl font-mono text-white flex-wrap">
          <span className="px-3 py-1 bg-cyan-500/30 rounded">${fedBalance}T</span>
          <span className="text-cyan-400">−</span>
          <span className="px-3 py-1 bg-amber-500/30 rounded">${tga}T</span>
          <span className="text-cyan-400">−</span>
          <span className="px-3 py-1 bg-emerald-500/30 rounded">${rrp}T</span>
          <span className="text-cyan-400">=</span>
          <span className="px-4 py-2 bg-white/20 rounded-lg font-black text-2xl">${netLiquidity.toFixed(2)}T</span>
        </div>
        <div className="flex justify-center gap-8 mt-4 text-xs text-gray-400">
          <span>Fed Balance</span>
          <span>TGA</span>
          <span>RRP</span>
          <span className="font-bold text-white">Net Liquidity</span>
        </div>
      </div>
    </div>
  );
};

const SignalGauge = ({ label, value, min, max, threshold, isAboveThresholdBad = true, unit = '' }) => {
  const percentage = ((value - min) / (max - min)) * 100;
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  const thresholdPercentage = ((threshold - min) / (max - min)) * 100;
  
  const isBad = isAboveThresholdBad ? value > threshold : value < threshold;
  const color = isBad ? 'bg-red-500' : 'bg-emerald-500';

  return (
    <div className="mb-6">
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-400">{label}</span>
        <span className={`font-bold ${isBad ? 'text-red-400' : 'text-emerald-400'}`}>
          {value}{unit}
        </span>
      </div>
      <div className="relative h-3 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`absolute h-full ${color} transition-all duration-700 rounded-full`}
          style={{ width: `${clampedPercentage}%` }}
        />
        <div 
          className="absolute h-full w-0.5 bg-white/60"
          style={{ left: `${thresholdPercentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{min}{unit}</span>
        <span className="text-amber-400">Umbral: {threshold}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
};

const OverallSignal = ({ signal, recommendation, reasoning, checks }) => {
  const signalStyles = {
    'RISK ON': { bg: 'from-emerald-600 to-green-700', border: 'border-emerald-400', text: 'text-emerald-100' },
    'CAUTION': { bg: 'from-amber-600 to-orange-700', border: 'border-amber-400', text: 'text-amber-100' },
    'RISK OFF': { bg: 'from-red-600 to-rose-700', border: 'border-red-400', text: 'text-red-100' },
    'NEUTRAL': { bg: 'from-slate-600 to-gray-700', border: 'border-slate-400', text: 'text-slate-100' },
  };

  const style = signalStyles[signal];
  const bullishCount = checks.filter(c => c.status === 'bullish').length;
  const bearishCount = checks.filter(c => c.status === 'bearish').length;
  const cautionCount = checks.filter(c => c.status === 'caution').length;

  return (
    <div className={`bg-gradient-to-br ${style.bg} rounded-2xl p-8 border-2 ${style.border} shadow-2xl`}>
      <div className="text-center">
        <div className="text-6xl font-black text-white mb-3 tracking-tight">{signal}</div>
        <div className="text-xl font-medium text-white/90 mb-4">{recommendation}</div>
        <div className="text-sm text-white/70 max-w-xl mx-auto">{reasoning}</div>
        <div className="flex justify-center gap-6 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-300">{bullishCount}</div>
            <div className="text-xs text-white/60">Bullish</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-300">{cautionCount}</div>
            <div className="text-xs text-white/60">Caution</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-300">{bearishCount}</div>
            <div className="text-xs text-white/60">Bearish</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChecklistItem = ({ label, checked, value, threshold, detail }) => (
  <div className={`flex items-center gap-3 p-3 rounded-lg ${checked ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${checked ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
      {checked ? '✓' : '✗'}
    </div>
    <div className="flex-1">
      <div className="text-sm text-white font-medium">{label}</div>
      <div className="text-xs text-gray-500">{detail}</div>
    </div>
    <div className="text-right">
      <div className={`text-sm font-mono font-bold ${checked ? 'text-emerald-400' : 'text-red-400'}`}>{value}</div>
      <div className="text-xs text-gray-500">vs {threshold}</div>
    </div>
  </div>
);

const Dashboard = () => {
  const [data, setData] = useState(CURRENT_DATA);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Cálculos
  const netLiquidity = data.fedBalance - data.tga - data.rrp;
  
  // Determinar status de cada métrica
  const getChecks = () => {
    return [
      {
        id: 'tga',
        label: 'TGA bajo umbral',
        status: data.tga < data.tgaStressThreshold ? 'bullish' : 'caution',
        checked: data.tga < data.tgaStressThreshold,
        value: `$${(data.tga * 1000).toFixed(0)}B`,
        threshold: `<$${data.tgaStressThreshold * 1000}B`,
        detail: 'Treasury General Account'
      },
      {
        id: 'rrp',
        label: 'RRP drenado',
        status: data.rrp < 0.1 ? 'bullish' : 'neutral',
        checked: data.rrp < 0.1,
        value: `$${(data.rrp * 1000).toFixed(1)}B`,
        threshold: '<$100B',
        detail: 'Reverse Repo Facility'
      },
      {
        id: 'vix',
        label: 'VIX en rango normal',
        status: data.vix >= 15 && data.vix <= 25 ? 'bullish' : data.vix < 15 ? 'caution' : data.vix > 40 ? 'bullish' : 'caution',
        checked: data.vix >= 15 && data.vix <= 25,
        value: data.vix.toFixed(1),
        threshold: '15-25',
        detail: 'Índice de volatilidad'
      },
      {
        id: 'usdjpy',
        label: 'Yen estable (carry trade safe)',
        status: data.usdjpy > data.usjpyDangerThreshold ? 'bullish' : 'bearish',
        checked: data.usdjpy > data.usjpyDangerThreshold,
        value: `¥${data.usdjpy.toFixed(1)}`,
        threshold: `>¥${data.usjpyDangerThreshold}`,
        detail: 'USD/JPY tipo de cambio'
      },
      {
        id: 'dxy',
        label: 'Dólar no demasiado fuerte',
        status: data.dxy < data.dxyAlertThreshold ? 'bullish' : 'bearish',
        checked: data.dxy < data.dxyAlertThreshold,
        value: data.dxy.toFixed(2),
        threshold: `<${data.dxyAlertThreshold}`,
        detail: 'Dollar Index'
      },
      {
        id: 'wti',
        label: 'Petróleo bajo control',
        status: data.wti < data.wtiAlertThreshold ? 'bullish' : 'bearish',
        checked: data.wti < data.wtiAlertThreshold,
        value: `$${data.wti.toFixed(2)}`,
        threshold: `<$${data.wtiAlertThreshold}`,
        detail: 'WTI Crude Oil'
      },
      {
        id: 'reserves',
        label: 'Reservas bancarias abundantes',
        status: data.bankReserves > data.reserveAbundanceThreshold ? 'bullish' : 'caution',
        checked: data.bankReserves > data.reserveAbundanceThreshold,
        value: `$${data.bankReserves}T`,
        threshold: `>$${data.reserveAbundanceThreshold}T`,
        detail: 'Bank Reserves'
      },
    ];
  };

  const checks = getChecks();
  
  const getOverallSignal = () => {
    const bullishCount = checks.filter(c => c.status === 'bullish').length;
    const bearishCount = checks.filter(c => c.status === 'bearish').length;
    const cautionCount = checks.filter(c => c.status === 'caution').length;
    
    if (bearishCount >= 2) {
      return { 
        signal: 'RISK OFF', 
        recommendation: 'Reducir exposición, considerar hedges', 
        reasoning: `${bearishCount} señales bearish activas. Priorizar empresas con FCF positivo y mantener liquidez.` 
      };
    }
    if (bullishCount >= 5 && bearishCount === 0) {
      return { 
        signal: 'RISK ON', 
        recommendation: 'Mantener o incrementar exposición', 
        reasoning: `${bullishCount} señales bullish. Condiciones favorables para risk assets y posiciones largas.` 
      };
    }
    if (cautionCount >= 2 || (bullishCount >= 3 && cautionCount >= 1)) {
      return { 
        signal: 'CAUTION', 
        recommendation: 'Posición neutral, no agregar agresivamente', 
        reasoning: 'Señales mixtas. Monitorear desarrollos antes de mover capital significativo.' 
      };
    }
    return { 
      signal: 'NEUTRAL', 
      recommendation: 'Mantener estrategia base', 
      reasoning: 'Sin señales claras de dirección. Seguir plan establecido.' 
    };
  };

  const overallSignal = getOverallSignal();

  const daysUntil = (dateStr: string): number => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 text-white p-4 md:p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                LiquidityFlow
              </h1>
            </div>
            <p className="text-gray-500 text-sm mt-1 ml-13">
              Monitoreo de liquidez macro en tiempo real
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right text-xs text-gray-500">
              <div>Última actualización</div>
              <div className="text-white font-mono">{new Date(data.lastUpdate).toLocaleString()}</div>
            </div>
            <button 
              onClick={handleRefresh}
              className={`p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Signal */}
        <div className="mb-8">
          <OverallSignal {...overallSignal} checks={checks} />
        </div>

        {/* Critical Dates */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: 'Debt Ceiling', date: data.nextDebtCeilingDeadline, color: 'orange' },
            { label: 'Fed Chair Term', date: data.fedChairTermExpiry, color: 'blue' },
            { label: 'Midterms', date: data.midtermElection, color: 'purple' },
          ].map(item => (
            <div key={item.label} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-400">{item.label}</span>
              </div>
              <div className={`text-2xl font-black text-${item.color}-400`}>{daysUntil(item.date)}d</div>
              <div className="text-xs text-gray-600 font-mono">{item.date}</div>
            </div>
          ))}
        </div>

        {/* Liquidity Formula */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Net Liquidity Flow
          </h2>
          <LiquidityFormula fedBalance={data.fedBalance} tga={data.tga} rrp={data.rrp} />
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="TGA"
            value={`$${(data.tga * 1000).toFixed(0)}B`}
            subtitle="Treasury General Account"
            status={data.tga < data.tgaStressThreshold ? 'bullish' : 'caution'}
            icon={DollarSign}
            threshold={`< $${data.tgaStressThreshold * 1000}B`}
            detail="Alto = drena liquidez"
          />
          <MetricCard
            title="DXY"
            value={data.dxy.toFixed(2)}
            subtitle="Dollar Index"
            status={data.dxy < data.dxyAlertThreshold ? 'bullish' : 'bearish'}
            icon={Banknote}
            threshold={`< ${data.dxyAlertThreshold}`}
            detail="Alto = presión risk assets"
          />
          <MetricCard
            title="WTI"
            value={`$${data.wti.toFixed(2)}`}
            subtitle="Crude Oil"
            status={data.wti < data.wtiAlertThreshold ? 'bullish' : 'bearish'}
            icon={Fuel}
            threshold={`< $${data.wtiAlertThreshold}`}
            detail="Alto = presión inflación"
          />
          <MetricCard
            title="VIX"
            value={data.vix.toFixed(1)}
            subtitle="Volatility Index"
            status={data.vix >= 15 && data.vix <= 25 ? 'bullish' : data.vix < 15 ? 'caution' : 'neutral'}
            icon={Activity}
            threshold="15-25 normal"
            detail={data.vix < 15 ? '⚠️ Complacencia' : data.vix > 40 ? '🎯 Oportunidad' : '✓ Normal'}
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Japan Carry Trade */}
          <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700/50">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-red-400" />
              Japan Carry Trade
            </h3>
            <div className="space-y-4">
              <SignalGauge
                label="USD/JPY"
                value={data.usdjpy}
                min={130}
                max={165}
                threshold={data.usjpyDangerThreshold}
                isAboveThresholdBad={false}
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <div className="text-xs text-gray-500">BOJ Rate</div>
                  <div className="text-xl font-bold text-white">{data.bojRate}%</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <div className="text-xs text-gray-500">JGB 10Y</div>
                  <div className="text-xl font-bold text-white">{data.jgb10y}%</div>
                </div>
              </div>
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-red-400 text-xs">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Si USD/JPY &lt; 145: Riesgo de unwinding violento (ver Agosto 2024)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700/50">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              Checklist de Posicionamiento
            </h3>
            <div className="space-y-2">
              {checks.map(check => (
                <ChecklistItem key={check.id} {...check} />
              ))}
            </div>
          </div>
        </div>

        {/* Bessent Framework */}
        <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700/50 mb-8">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-400" />
            Framework Bessent 3-3-3
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <SignalGauge
                label="Déficit/GDP"
                value={data.deficitToGdp}
                min={0}
                max={10}
                threshold={3}
                isAboveThresholdBad={true}
                unit="%"
              />
              <div className="text-xs text-center text-gray-500">Objetivo Bessent: 3% para 2028</div>
            </div>
            <div>
              <SignalGauge
                label="GDP Growth"
                value={data.gdpGrowth}
                min={0}
                max={6}
                threshold={3}
                isAboveThresholdBad={false}
                unit="%"
              />
              <div className="text-xs text-center text-gray-500">Objetivo: 3% sostenido</div>
            </div>
            <div>
              <SignalGauge
                label="Oil Production"
                value={data.oilProductionMbpd}
                min={10}
                max={18}
                threshold={16}
                isAboveThresholdBad={false}
                unit="M bpd"
              />
              <div className="text-xs text-center text-gray-500">Objetivo: +3M bpd (→16M)</div>
            </div>
          </div>
        </div>

        {/* Macro Data Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="ISM Manufacturing"
            value={data.ismManufacturing}
            subtitle={data.ismManufacturing > 50 ? 'Expansión' : 'Contracción'}
            status={data.ismManufacturing > 50 ? 'bullish' : data.ismManufacturing > 42.3 ? 'neutral' : 'bearish'}
            icon={BarChart3}
            detail=">42.3 = GDP positivo"
          />
          <MetricCard
            title="CPI YoY"
            value={`${data.cpiYoY}%`}
            subtitle={`Core: ${data.coreCpiYoY}%`}
            status={data.cpiYoY < 2.5 ? 'bullish' : data.cpiYoY < 3.5 ? 'neutral' : 'bearish'}
            icon={TrendingUp}
          />
          <MetricCard
            title="US 10Y Yield"
            value={`${data.us10y}%`}
            subtitle="Treasury 10 años"
            status={data.us10y > 5 ? 'bearish' : 'neutral'}
            icon={DollarSign}
          />
          <MetricCard
            title="GDP Q3 2025"
            value={`${data.gdpGrowth}%`}
            subtitle="Anualizado"
            status="bullish"
            icon={TrendingUp}
            detail="vs consenso 3.2%"
          />
        </div>

        {/* Footer */}
        <div className="text-center py-6 border-t border-gray-800">
          <p className="text-gray-600 text-sm italic">
            "El algoritmo es el mapa. La ejecución disciplinada es el territorio."
          </p>
          <p className="text-gray-700 text-xs mt-2">
            LiquidityFlow • Powered by 10AMPRO
          </p>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  return <Dashboard />;
};
