import React, { useState, useEffect, useMemo } from 'react';
import { fetchKlines } from '../lib/market';
import {
  ResponsiveContainer,
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

interface ChartPoint {
  timestamp: number;
  label: string;
  price: number;
}

interface AreaChartProps {
  data?: ChartPoint[];
  color?: string;
  theme?: 'dark' | 'light';
  symbol?: string;
  currentPrice?: number;
  change24h?: number;
}

type Timeframe = '1H' | '24H' | '7D' | '1M' | '1Y';

// Each timeframe maps to a real Binance interval + candle count.
const TIMEFRAME_CONFIG: Record<Timeframe, { interval: string; limit: number }> = {
  '1H': { interval: '1m', limit: 60 },
  '24H': { interval: '15m', limit: 96 },
  '7D': { interval: '1h', limit: 168 },
  '1M': { interval: '4h', limit: 180 },
  '1Y': { interval: '1d', limit: 365 },
};

function formatLabel(ts: number, timeframe: Timeframe): string {
  const d = new Date(ts);
  if (timeframe === '1H' || timeframe === '24H') {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (timeframe === '1Y') {
    return d.toLocaleDateString([], { month: 'short', year: '2-digit' });
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

// Compact axis labels so a five-figure price does not crowd the plot.
function formatAxisPrice(v: number): string {
  const n = Number(v);
  if (!Number.isFinite(n)) return '';
  const abs = Math.abs(n);
  if (abs >= 1000) return '$' + (n / 1000).toFixed(abs >= 100000 ? 0 : 1) + 'k';
  return '$' + n.toFixed(2);
}

export const AreaChart: React.FC<AreaChartProps> = ({
  data,
  color,
  theme = 'dark',
  symbol = 'BTC/USDT',
  currentPrice = 0,
  change24h = 0,
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('24H');
  const [points, setPoints] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedError, setFeedError] = useState(false);

  const coin = String(symbol).split('/')[0].toUpperCase();

  // Gradient ids live in the document, not the component. Two charts sharing
  // one id would paint each other's fills, so scope it to this symbol.
  const gradientId = 'priceFill-' + String(symbol).replace(/[^a-zA-Z0-9]/g, '');

  useEffect(() => {
    if (data && data.length > 0) {
      setPoints(
        data.map((p) => ({
          timestamp: p.timestamp,
          label: formatLabel(p.timestamp, timeframe),
          price: p.price,
        }))
      );
      setLoading(false);
      return;
    }

    let cancelled = false;
    const cfg = TIMEFRAME_CONFIG[timeframe];

    const load = async () => {
      setLoading(true);
      setFeedError(false);
      try {
        const raw = await fetchKlines(coin, cfg.interval, cfg.limit);
        if (cancelled) return;
        if (!raw || raw.length === 0) throw new Error('empty');
        setPoints(
          raw.map((k: any) => ({
            timestamp: k.timestamp,
            label: formatLabel(k.timestamp, timeframe),
            price: k.price,
          }))
        );
      } catch {
        if (!cancelled) {
          setPoints([]);
          setFeedError(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [coin, timeframe, data]);

  const isPositive = change24h >= 0;
  const strokeColor = color || (isPositive ? '#00FFB2' : '#EF4444');

  const first = points.length > 0 ? points[0].price : 0;
  const last = points.length > 0 ? points[points.length - 1].price : 0;
  const seriesChange = first > 0 ? ((last - first) / first) * 100 : 0;
  const shownChange = points.length > 0 ? seriesChange : change24h;
  const shownPrice = points.length > 0 ? last : currentPrice;

  // Pad the vertical range so the series never sits flush against the frame.
  const yDomain = useMemo<[number, number]>(() => {
    if (points.length === 0) return ['auto', 'auto'] as unknown as [number, number];
    const values = points.map((p) => p.price).filter((v) => Number.isFinite(v));
    if (values.length === 0) return ['auto', 'auto'] as unknown as [number, number];
    const lo = Math.min(...values);
    const hi = Math.max(...values);
    const pad = (hi - lo) * 0.12 || Math.max(hi * 0.01, 1);
    return [Math.max(0, lo - pad), hi + pad];
  }, [points]);

  const rangeOpen = points.length > 0 ? points[0].price : 0;

  return (
    <div className="w-full flex flex-col space-y-4">
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-slate-900 dark:text-white">{symbol}</span>
              <span
                className={
                  'text-xs font-bold px-2 py-0.5 rounded-full ' +
                  (isPositive
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                    : 'bg-red-500/10 text-red-500 border border-red-500/20')
                }
              >
                {isPositive ? '+' : ''}
                {shownChange.toFixed(2)}%
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              $
              {Number(shownPrice || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
        </div>

        {/* Timeframe pill selector */}
        <div className="flex items-center bg-slate-100 dark:bg-gray-900 p-1 rounded-xl border border-slate-200 dark:border-gray-800">
          {(Object.keys(TIMEFRAME_CONFIG) as Timeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={
                'px-3 py-1 text-xs font-bold rounded-lg transition ' +
                (timeframe === tf
                  ? 'bg-[#00FFB2] text-black shadow-md'
                  : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white')
              }
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart Canvas */}
      <div className="h-64 sm:h-72 w-full relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <span className="w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && feedError && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 text-center px-4">
            <span className="text-xs font-bold text-rose-500 dark:text-rose-400">
              Live market feed unavailable
            </span>
            <span className="text-[11px] text-slate-500 dark:text-gray-400">
              Price history could not be loaded. Please retry shortly.
            </span>
          </div>
        )}

        {points.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsAreaChart data={points} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={strokeColor} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={theme === 'dark' ? '#1E293B' : '#E2E8F0'}
                vertical={false}
              />
              <XAxis
                dataKey="label"
                stroke={theme === 'dark' ? '#64748B' : '#94A3B8'}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                minTickGap={28}
              />
              <YAxis
                domain={yDomain}
                stroke={theme === 'dark' ? '#64748B' : '#94A3B8'}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickCount={5}
                width={66}
                tickFormatter={formatAxisPrice}
              />
              <Tooltip
                cursor={{ stroke: theme === 'dark' ? '#334155' : '#CBD5E1', strokeWidth: 1 }}
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const pt = payload[0].payload as ChartPoint;
                  const delta = rangeOpen > 0 ? ((pt.price - rangeOpen) / rangeOpen) * 100 : 0;
                  const up = delta >= 0;
                  return (
                    <div
                      className={
                        'rounded-xl border px-3 py-2 shadow-xl ' +
                        (theme === 'dark'
                          ? 'bg-[#0B0E14] border-[#1E293B]'
                          : 'bg-white border-slate-200')
                      }
                    >
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-gray-400">
                        {new Date(pt.timestamp).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      <div className="text-sm font-black text-slate-900 dark:text-white">
                        {'$' +
                          Number(pt.price).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                      </div>
                      <div
                        className={
                          'text-[11px] font-bold ' + (up ? 'text-emerald-500' : 'text-rose-500')
                        }
                      >
                        {(up ? '+' : '') + delta.toFixed(2)}% vs range open
                      </div>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={strokeColor}
                strokeWidth={2.5}
                fillOpacity={1}
                fill={'url(#' + gradientId + ')'}
                isAnimationActive={false}
              />
              {points.length > 0 && (
                <ReferenceLine
                  y={last}
                  stroke={theme === 'dark' ? '#475569' : '#94A3B8'}
                  strokeDasharray="3 3"
                  label={{
                    value: '$' + last.toLocaleString(undefined, { maximumFractionDigits: 2 }),
                    position: 'insideTopRight',
                    fill: theme === 'dark' ? '#94A3B8' : '#64748B',
                    fontSize: 10,
                  }}
                />
              )}
            </RechartsAreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default AreaChart;
