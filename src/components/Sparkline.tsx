import React from 'react';
import { ResponsiveContainer, LineChart, Line, YAxis, Tooltip } from 'recharts';

interface SparklineProps {
  data: number[];
  isPositive: boolean;
  theme?: 'dark' | 'light';
}

export const Sparkline: React.FC<SparklineProps> = ({ data, isPositive, theme = 'dark' }) => {
  const chartData = data.map((price, index) => ({ index, price }));
  const strokeColor = isPositive ? '#10B981' : '#EF4444';

  return (
    <div className="w-24 h-10 select-none pointer-events-auto" id="sparkline-container">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 2, bottom: 2, left: 2, right: 2 }}>
          <YAxis domain={['auto', 'auto']} hide />
          <Tooltip
            contentStyle={{
              backgroundColor: theme === 'dark' ? '#0F172A' : '#FFFFFF',
              borderColor: theme === 'dark' ? '#1E293B' : '#E2E8F0',
              borderRadius: '8px',
              fontSize: '10px',
              padding: '2px 6px',
              color: theme === 'dark' ? '#F8FAFC' : '#0F172A',
            }}
            formatter={(value: number) => [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Price']}
            labelFormatter={() => ''}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke={strokeColor}
            strokeWidth={1.75}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
export default Sparkline;
