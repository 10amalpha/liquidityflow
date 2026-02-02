import { NextResponse } from 'next/server';

// ============================================================
// Market Data from Yahoo Finance
// ============================================================
async function getMarketData() {
  try {
    const symbols = ['^VIX', 'DX-Y.NYB', 'CL=F', '^TNX', 'JPY=X', 'GC=F'];
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols.join(',')}`;
    
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 300 },
    });
    
    if (!res.ok) throw new Error('Yahoo Finance unavailable');
    
    const data = await res.json();
    const quotes = data.quoteResponse?.result || [];
    
    const findQuote = (symbol: string) => {
      const q = quotes.find((q: any) => q.symbol === symbol);
      return q?.regularMarketPrice || null;
    };
    
    const usdjpy = findQuote('JPY=X');
    const us10y = findQuote('^TNX');
    
    return {
      vix: findQuote('^VIX') || 16.4,
      dxy: findQuote('DX-Y.NYB') || 99.25,
      wti: findQuote('CL=F') || 72.53,
      usdjpy: usdjpy ? (1 / usdjpy) * 10000 : 155.2,
      us10y: us10y ? us10y / 100 : 4.54,
      gold: findQuote('GC=F') || 2800,
    };
  } catch {
    return {
      vix: 16.4,
      dxy: 99.25,
      wti: 72.53,
      usdjpy: 155.2,
      us10y: 4.54,
      gold: 2800,
    };
  }
}

// ============================================================
// Fed Data from FRED
// ============================================================
async function getFedData() {
  try {
    const series = ['WALCL', 'WDTGAL', 'RRPONTSYD', 'WRESBAL'];
    const results = await Promise.all(
      series.map(async (id) => {
        const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${id}&sort_order=desc&limit=1&api_key=${process.env.FRED_API_KEY}&file_type=json`;
        const res = await fetch(url, { next: { revalidate: 3600 } });
        if (!res.ok) return null;
        const data = await res.json();
        return { id, value: parseFloat(data.observations?.[0]?.value || '0') };
      })
    );

    const getValue = (id: string) => results.find(r => r?.id === id)?.value || 0;

    const walcl = getValue('WALCL');
    const tga = getValue('WDTGAL');
    const rrp = getValue('RRPONTSYD');
    const reserves = getValue('WRESBAL');

    return {
      fedBalance: walcl ? walcl / 1000000 : 6.58,
      tga: tga ? tga / 1000000 : 0.968,
      rrp: rrp ? rrp / 1000 : 0.006,
      bankReserves: reserves ? reserves / 1000 : 2.99,
    };
  } catch {
    return {
      fedBalance: 6.58,
      tga: 0.968,
      rrp: 0.006,
      bankReserves: 2.99,
    };
  }
}

// ============================================================
// API Handler
// ============================================================
export async function GET() {
  try {
    const [marketData, fedData] = await Promise.all([
      getMarketData(),
      getFedData(),
    ]);

    const data = {
      // Fed/Treasury Data
      fedBalance: fedData.fedBalance,
      tga: fedData.tga,
      rrp: fedData.rrp,
      bankReserves: fedData.bankReserves,

      // Thresholds (static)
      tgaStressThreshold: 0.650,
      reserveAbundanceThreshold: 2.5,
      usjpyDangerThreshold: 145,
      dxyAlertThreshold: 105,
      wtiAlertThreshold: 80,

      // Market Data (live from Yahoo)
      vix: marketData.vix,
      vixTermStructure: 'contango',
      dxy: marketData.dxy,
      wti: marketData.wti,
      usdjpy: marketData.usdjpy,
      us10y: marketData.us10y,

      // Japan Carry Trade
      bojRate: 0.5,
      jgb10y: 1.05,

      // BTC
      btcFundingRate: 0.008,
      btcOpenInterest: 45.2,
      btcMarketCap: 1850,

      // Macro — Updated Feb 2, 2026
      ismManufacturing: 52.6,   // Jan 2026 ISM: EXPANSION
      cpiYoY: 2.7,              // Dec 2025 BLS
      coreCpiYoY: 2.6,          // Dec 2025 BLS (lowest since Mar 2021)
      gdpGrowth: 2.3,           // Q4 2025 advance estimate

      // Bessent Framework
      deficitToGdp: 5.2,
      gdpGrowthTarget: 3.0,
      oilProductionMbpd: 13.3,
      foreignTreasuryHoldings: 8.67,

      // Important Dates
      nextDebtCeilingDeadline: '2026-06-30',
      fedChairTermExpiry: '2026-05-15',
      midtermElection: '2026-11-03',

      // Timestamp
      lastUpdate: new Date().toISOString(),
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
