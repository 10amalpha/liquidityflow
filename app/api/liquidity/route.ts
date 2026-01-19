import { NextResponse } from 'next/server';

// FRED API - Free, no key required for basic access
const FRED_BASE = 'https://api.stlouisfed.org/fred/series/observations';
const FRED_API_KEY = process.env.FRED_API_KEY || 'your_fred_api_key_here';

// Yahoo Finance API (via query1.finance.yahoo.com - no key needed)
async function getYahooQuote(symbol: string): Promise<number | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
    const res = await fetch(url, { 
      next: { revalidate: 300 }, // Cache for 5 minutes
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const data = await res.json();
    const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
    return price || null;
  } catch (error) {
    console.error(`Yahoo Finance error for ${symbol}:`, error);
    return null;
  }
}

// FRED Data
async function getFredSeries(seriesId: string): Promise<number | null> {
  try {
    const url = `${FRED_BASE}?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&sort_order=desc&limit=1`;
    const res = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour
    const data = await res.json();
    const value = data?.observations?.[0]?.value;
    return value && value !== '.' ? parseFloat(value) : null;
  } catch (error) {
    console.error(`FRED error for ${seriesId}:`, error);
    return null;
  }
}

// Alternative: Scrape from public sources or use fallback values
async function getMarketData() {
  const [
    vix,
    dxy,
    wti,
    usdjpy,
    us10y,
    gold,
  ] = await Promise.all([
    getYahooQuote('^VIX'),      // VIX
    getYahooQuote('DX-Y.NYB'),  // Dollar Index
    getYahooQuote('CL=F'),      // WTI Crude
    getYahooQuote('JPY=X'),     // USD/JPY (inverted, need to calc)
    getYahooQuote('^TNX'),      // 10Y Treasury Yield
    getYahooQuote('GC=F'),      // Gold
  ]);

  return {
    vix: vix || 15.4,
    dxy: dxy || 99.25,
    wti: wti || 59.44,
    usdjpy: usdjpy ? (1 / usdjpy) * 10000 : 158.0, // Convert from JPY=X format
    us10y: us10y ? us10y / 100 : 4.52, // Yahoo returns as percentage points
    gold: gold || 2700,
  };
}

// Get Fed/Treasury data from FRED
async function getFedData() {
  // FRED Series IDs:
  // WALCL - Fed Total Assets (Weekly)
  // WTREGEN - TGA Balance (Weekly)  
  // RRPONTSYD - Reverse Repo (Daily)
  // TOTRESNS - Total Reserves (Monthly)
  
  const [fedBalance, tga, rrp, reserves] = await Promise.all([
    getFredSeries('WALCL'),      // Fed Balance Sheet (Millions)
    getFredSeries('WTREGEN'),    // TGA (Millions)
    getFredSeries('RRPONTSYD'),  // RRP (Billions)
    getFredSeries('TOTRESNS'),   // Bank Reserves (Billions)
  ]);

  return {
    fedBalance: fedBalance ? fedBalance / 1000000 : 6.58, // Convert to Trillions
    tga: tga ? tga / 1000000 : 0.841,                      // Convert to Trillions
    rrp: rrp ? rrp / 1000 : 0.005,                         // Convert to Trillions
    bankReserves: reserves ? reserves / 1000 : 2.99,       // Convert to Trillions
  };
}

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
      
      // Market Data
      vix: marketData.vix,
      vixTermStructure: 'contango',
      dxy: marketData.dxy,
      wti: marketData.wti,
      usdjpy: marketData.usdjpy,
      us10y: marketData.us10y,
      
      // Japan Carry Trade
      bojRate: 0.5,  // Update manually or find API
      jgb10y: 1.05,  // Update manually or find API
      
      // Macro (updated less frequently)
      ismManufacturing: 48.2,
      cpiYoY: 2.7,
      coreCpiYoY: 2.8,
      gdpGrowth: 4.3,
      
      // Bessent Framework
      deficitToGdp: 5.2,
      gdpGrowthTarget: 3.0,
      oilProductionMbpd: 13.3,
      
      // Important Dates
      nextDebtCeilingDeadline: '2026-01-30',
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
