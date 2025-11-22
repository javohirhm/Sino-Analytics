import type { TooltipProps } from 'recharts';
import {
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useId } from 'react';
import { chartColors, tooltipContainer } from './chartTheme';

interface LineChartProps<T extends Record<string, unknown>> {
  data?: T[];
  xKey: keyof T;
  yKey: keyof T;
  height?: number;
  color?: string;
  yFormatter?: (value: number) => string;
  xFormatter?: (value: unknown) => string;
}

export function LineChart<T extends Record<string, unknown>>({
  data = [],
  xKey,
  yKey,
  height = 260,
  color = chartColors[0],
  yFormatter,
  xFormatter,
}: LineChartProps<T>) {
  const gradientId = useId();

  const renderTooltip = (props: TooltipProps<any, any>) => {
    if (!props.active || !props.payload?.length) return null;
    const [payload] = props.payload;
    const value = typeof payload.value === 'number' ? payload.value : 0;
    const formattedValue = yFormatter ? yFormatter(value) : value.toString();

    const xValue = payload.payload?.[xKey as string];
    const formattedDate = xFormatter
      ? xFormatter(xValue)
      : typeof xValue === 'string'
        ? new Date(xValue).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : String(xValue ?? '');

    return (
      <div className={tooltipContainer}>
        {formattedDate && (
          <p className="text-xs uppercase tracking-[0.15em] text-white/60">
            {formattedDate}
          </p>
        )}
        <p className="text-xs uppercase tracking-[0.15em] text-white/60">
          {payload.name}
        </p>
        <p className="text-lg font-semibold text-white">{formattedValue}</p>
      </div>
    );
  };

  if (!data.length) {
    return (
      <div
        className="flex h-[240px] items-center justify-center text-sm text-white/50"
        role="status"
      >
        No data available
      </div>
    );
  }

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={data}
          margin={{ top: 10, right: 20, bottom: 10, left: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.45} />
              <stop offset="100%" stopColor={color} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey={xKey as string}
            tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={xFormatter}
          />
          <YAxis
            tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={yFormatter}
            width={50}
          />
          <Tooltip content={renderTooltip} />
          <Line
            type="monotone"
            dataKey={yKey as string}
            stroke={`url(#${gradientId})`}
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, strokeWidth: 0, fill: color }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}
