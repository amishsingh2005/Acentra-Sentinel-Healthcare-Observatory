import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { MetricsPoint } from '../types';

interface ChartProps {
  data: MetricsPoint[];
  threshold: number;
  baselineMean: number;
  baselineReady: boolean;
}

export function ErrorRateChart({ data, threshold, baselineMean, baselineReady }: ChartProps) {
  if (data.length === 0) {
    return <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Waiting for metrics...</div>;
  }

  return (
    <div style={{ height: 300, width: '100%' }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} tickMargin={8} />
          <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={(val) => `${val}%`} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }}
            itemStyle={{ color: 'var(--accent-primary)' }}
          />
          <Line
            type="monotone"
            dataKey="error_rate"
            stroke="var(--accent-primary)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          {baselineReady && (
            <>
              <ReferenceLine y={baselineMean} stroke="var(--text-muted)" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Baseline', fill: 'var(--text-muted)', fontSize: 11 }} />
              <ReferenceLine y={threshold} stroke="var(--status-critical)" strokeDasharray="3 3" opacity={0.5} label={{ position: 'insideTopLeft', value: 'Threshold', fill: 'var(--status-critical)', fontSize: 11 }} />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
