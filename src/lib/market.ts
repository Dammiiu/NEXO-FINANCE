// ─────────────────────────────────────────────────────────────────────────────
// Market data with graceful fallback.
//
// Order of preference:
//   1. our own server proxy (/api/market/*) - cached, fastest
//   2. Binance directly from the browser   (serves Access-Control-Allow-Origin: *)
//   3. CoinGecko                          (serves Access-Control-Allow-Origin: *)
//
// The direct fallbacks keep prices and charts working even when the backend has
// not yet been rebuilt with the market routes.
// ─────────────────────────────────────────────────────────────────────────────

export interface Ticker {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
}

export interface Candle {
  timestamp: number;
  price: number;
  open: number;
  high: number;
  low: number;
  volume: number;
}

const BINANCE = 'https://api.binance.com/api/v3';
const COINGECKO = 'https://api.coingecko.com/api/v3';

const COIN_IDS: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  BNB: 'binancecoin',
  XRP: 'ripple',
  USDT: 'tether',
};

const DECIMALS: Record<string, number> = { BTC: 2, ETH: 2, BNB: 2, XRP: 4, SOL: 4, USDT: 4 };

const round = (n: number, dp: number) => Number(Number(n).toFixed(dp));
const dp = (coin: string) => DECIMALS[coin] ?? 4;

async function getJson(url: string, timeoutMs = 9000): Promise<any | null> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function tickersFromBinance(raw: any): Ticker[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((t: any) => {
    const coin = String(t.symbol).replace('USDT', '');
    return {
      symbol: coin,
      name: coin === 'USDT' ? 'Tether USD' : coin,
      price: round(parseFloat(t.lastPrice), dp(coin)),
      change24h: round(parseFloat(t.priceChangePercent), 2),
      high24h: round(parseFloat(t.highPrice), dp(coin)),
      low24h: round(parseFloat(t.lowPrice), dp(coin)),
      volume24h: round(parseFloat(t.quoteVolume), 0),
    };
  });
}

function tickersFromCoinGecko(raw: any): Ticker[] {
  if (!raw) return [];
  const out: Ticker[] = [];
  for (const coin of Object.keys(COIN_IDS)) {
    const row = raw[COIN_IDS[coin]];
    if (!row || typeof row.usd !== 'number') continue;
    out.push({
      symbol: coin,
      name: coin === 'USDT' ? 'Tether USD' : coin,
      price: round(row.usd, dp(coin)),
      change24h: round(row.usd_24h_change ?? 0, 2),
      high24h: round(row.usd, dp(coin)),
      low24h: round(row.usd, dp(coin)),
      volume24h: round(row.usd_24h_vol ?? 0, 0),
    });
  }
  return out;
}

function withPeggedUsdt(list: Ticker[]): Ticker[] {
  if (list.some((t) => t.symbol === 'USDT')) return list;
  return [
    ...list,
    { symbol: 'USDT', name: 'Tether USD', price: 1, change24h: 0, high24h: 1, low24h: 1, volume24h: 0 },
  ];
}

export async function fetchTickers(): Promise<Ticker[]> {
  // 1. server proxy
  try {
    const res = await fetch('/api/market/tickers');
    if (res.ok) {
      const j = await res.json();
      if (Array.isArray(j) && j.length > 0) return j;
    }
  } catch {
    /* fall through */
  }

  // 2. Binance - USDT/USDT is not a pair, so it is excluded and pegged below.
  const pairs = Object.keys(COIN_IDS)
    .filter((c) => c !== 'USDT')
    .map((c) => c + 'USDT');
  const binance = await getJson(
    BINANCE + '/ticker/24hr?symbols=' + encodeURIComponent(JSON.stringify(pairs)),
    7000
  );
  const fromBinance = withPeggedUsdt(tickersFromBinance(binance));
  if (fromBinance.length > 1) return fromBinance;

  // 3. CoinGecko
  const ids = Object.values(COIN_IDS).join(',');
  const cg = await getJson(
    COINGECKO + '/simple/price?ids=' + ids + '&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true',
    8000
  );
  const fromCg = withPeggedUsdt(tickersFromCoinGecko(cg));
  return fromCg;
}

function candlesFromBinance(raw: any): Candle[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((k: any[]) => ({
    timestamp: k[0],
    open: round(parseFloat(k[1]), 6),
    high: round(parseFloat(k[2]), 6),
    low: round(parseFloat(k[3]), 6),
    price: round(parseFloat(k[4]), 6),
    volume: round(parseFloat(k[5]), 4),
  }));
}

export async function fetchKlines(coin: string, interval: string, limit: number): Promise<Candle[]> {
  const symbol = coin.toUpperCase().replace('USDT', '');

  // 1. server proxy
  try {
    const res = await fetch(
      '/api/market/klines?symbol=' + encodeURIComponent(symbol) + '&interval=' + interval + '&limit=' + limit
    );
    if (res.ok) {
      const j = await res.json();
      if (Array.isArray(j) && j.length > 0) return j;
    }
  } catch {
    /* fall through */
  }

  // 2. Binance directly
  const raw = await getJson(
    BINANCE + '/klines?symbol=' + symbol + 'USDT&interval=' + interval + '&limit=' + limit,
    8000
  );
  return candlesFromBinance(raw);
}

// 42 x 4h candles = 7 days of real history for the table sparklines.
export async function fetchSparkline(coin: string): Promise<number[]> {
  const rows = await fetchKlines(coin, '4h', 42);
  return rows.map((r) => r.price);
}
