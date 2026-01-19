import { NextResponse } from 'next/server';

const FRED_BASE = 'https://api.stlouisfed.org/fred/series/observations';
const FRED_API_KEY = process.env.FRED_API_KEY || 'your_fred_api_key_here';

async function getYahooQuote(symbol: string): Promise<number | null> {
    try {
          const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
          const res = await fetch(url, { 
                                        next: { revalidate: 300 },
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

async function getFredSeries(seriesId: string): Promise<number | null> {
    try {
          const url = `${FRED_BASE}?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&sort_order=desc&limit=1`;
          const res = await fetch(url, { next: { revalidate: 3600 } });
          const data = await res.json();
          const value = data?.observations?.[0]?.value;
          return value && value !== '.' ? parseFloat(value) : null;
    } catch (error) {
          console.error(`FRED error for ${seriesId}:`, error);
          return null;
    }
}

async function getMarketData() {
    const [vix, dxy, wti, usdjpy, us10y, gold] = await Promise.all([
          getYahooQuote('^VIX'),
          getYahooQuote('DX-Y.NYB'),
          getYahooQuote('CL=F'),
          getYahooQuote('JPY=X'),
          getYahooQuote('^TNX'),
          getYahooQuote('GC=F'),
        ]);

  return {
        vix: vix || 15.4,
        dxy: dxy || 99.25,
        wti: wti || 59.44,
        usdjpy: usdjpy ? (1 / usdjpy) * 10000 : 158.0,
        us10y: us10y ? us10y / 100 : 4.52,
        gold: gold || 2700,
  };
}

async function getFedData() {
    const [fedBalance, tga, rrp, reserves] = await Promise.all([
          getFredSeries('WALCL'),
          getFredSeries('WTREGEN'),
          getFredSeries('RRPONTSYD'),
          getFredSeries('TOTRESNS'),
        ]);

  return {
        fedBalance: fedBalance ? fedBalance / 1000000 : 6.58,
        tga: tga ? tga / 1000000 : 0.841,
        rrp: rrp ? rrp / 1000 : 0.005,
        bankReserves: reserves ? reserves / 1000 : 2.99,
  };
}

export async function GET() {
    try {
          const [marketData, fedData] = await Promise.all([
                  getMarketData(),
                  getFedData(),
                ]);

      const data = {
              fedBalance: fedData.fedBalance,
              tga: fedData.tga,
              rrp: fedData.rrp,
              bankReserves: fedData.bankReserves,
              tgaStressThreshold: 0.650,
              reserveAbundanceThreshold: 2.5,
              usjpyDangerThreshold: 145,
              dxyAlertThreshold: 105,
              wtiAlertThreshold: 80,
              vix: marketData.vix,
              vixTermStructure: 'contango',
              dxy: marketData.dxy,
              wti: marketData.wti,
              usdjpy: marketData.usdjpy,
              us10y: marketData.us10y,
              bojRate: 0.5,
              jgb10y: 1.05,
              ismManufacturing: 48.2,
              cpiYoY: 2.7,
              coreCpiYoY: 2.8,
              gdpGrowth: 4.3,
              deficitToGdp: 5.2,
              gdpGrowthTarget: 3.0,
              oilProductionMbpd: 13.3,
              nextDebtCeilingDeadline: '2026-01-30',
              fedChairTermExpiry: '2026-05-15',
              midtermElection: '2026-11-03',
              lastUpdate: new Date().toISOString(),
      };

      return NextResponse.json(data);
    } catch (error) {
          console.error('API Error:', error);
          return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
