import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface ChartPoint {
  timestamp: string;
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

const generateMockTimeline = (basePrice: number, timeframe: string): ChartPoint[] => {
  const points: ChartPoint[] = [];
  let count = 24;
  let volatility = 0.008;

  if (timeframe === '1H') {
    count = 12;
    volatility = 0.002;
  } else if (timeframe === '24H') {
    count = 24;
    volatility = 0.006;
  } else if (timeframe === '7D') {
    count = 28;
    volatility = 0.015;
  } else if (timeframe === '1M') {
    count = 30;
    volatility = 0.025;
  } else if (timeframe === '1Y') {
    count = 52;
    volatility = 0.04;
  }

  let curr = basePrice * (1 - volatility * (count / 3));
  const now = Date.now();
  const stepMs = (24 * 3600 * 1000) / count;

  for (let i = 0; i < count; i++) {
    const change = (Math.random() - 0.48) * curr * volatility;
    curr += change;
    const time = new Date(now - (count - i) * stepMs);
    points.push({
      timestamp:
        timeframe === '1H' || timeframe === '24H'
          ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : time.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      price: Math.max(1, Math.round(curr * 100) / 100),
    });
  }

  // Ensure last point matches basePrice
  if (points.length > 0) {
    points[points.length - 1].price = basePrice;
  }
  return points;
};

export const AreaChart: React.FC<AreaChartProps> = ({
  data,
  color = '#00FFB2',
  theme = 'dark',
  symbol = 'BTC/USDT',
  currentPrice = 96420,
  change24h = 3.45,
}) => {
  const [timeframe, setTimeframe] = useState<'1H' | '24H' | '7D' | '1M' | '1Y'>('24H');
  const chartPoints = data || generateMockTimeline(currentPrice, timeframe);

  const isPositive = change24h >= 0;
  const strokeColor = color || (isPositive ? '#00FFB2' : '#EF4444');

  return (
    <div className="w-full flex flex-col space-y-4">
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-slate-900 dark:text-white">{symbol}</span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  isPositive
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                    : 'bg-red-500/10 text-red-500 border border-red-500/20'
                }`}
              >
                {isPositive ? '+' : ''}
                {change24h}%
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Timeframe pill selector */}
        <div className="flex items-center bg-slate-100 dark:bg-gray-900 p-1 rounded-xl border border-slate-200 dark:border-gray-800">
          {(['1H', '24H', '7D', '1M', '1Y'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                timeframe === tf
                  ? 'bg-[#00FFB2] text-black shadow-md'
                  : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart Canvas */}
      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsAreaChart data={chartPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.35} />
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={theme === 'dark' ? '#1E293B' : '#E2E8F0'}
              vertical={false}
            />
            <XAxis
              dataKey="timestamp"
              stroke={theme === 'dark' ? '#64748B' : '#94A3B8'}
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={['auto', 'auto']}
              stroke={theme === 'dark' ? '#64748B' : '#94A3B8'}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v.toLocaleString()}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: theme === 'dark' ? '#0B0E14' : '#FFFFFF',
                borderColor: theme === 'dark' ? '#1E293B' : '#CBD5E1',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                color: theme === 'dark' ? '#FFFFFF' : '#0F172A',
                fontSize: '12px',
                fontWeight: 600,
              }}
              formatter={(val: number) => [`$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Price']}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={strokeColor}
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#areaGradient)"
            />
          </RechartsAreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
export default AreaChart;
