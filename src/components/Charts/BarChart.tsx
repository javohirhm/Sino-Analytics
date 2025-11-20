import type { TooltipProps } from 'recharts';
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { chartColors, tooltipContainer } from './chartTheme';

interface BarKey<T> {
  key: keyof T;
  name?: string;
  color?: string;
  stackId?: string;
}

interface BarChartProps<T extends Record<string, unknown>> {
  data?: T[];
  xKey: keyof T;
  bars: BarKey<T>[];
  height?: number;
  layout?: 'horizontal' | 'vertical';
  stacked?: boolean;
  yFormatter?: (value: number) => string;
  barSize?: number;
  categoryGap?: string | number;
  xLabel?: string;
  yLabel?: string;
  legend?: string[];
  xTickAngle?: number;
}

const renderTooltip = (props: TooltipProps<any, any>) => {
  if (!props.active || !props.payload?.length) return null;
  
  const entry = props.payload[0];
  const label = props.label;
  const value = entry?.value;
  
  return (
    <div className={tooltipContainer}>
      <p className="text-sm text-white">
        <span className="font-medium">{label}</span>
        {value !== undefined && (
          <>
            {' - '}
            <span className="text-white/80">{value.toLocaleString()} users</span>
          </>
        )}
      </p>
    </div>
  );
};

export function BarChart<T extends Record<string, unknown>>({
  data = [],
  xKey,
  bars,
  height = 260,
  layout = 'horizontal',
  yFormatter,
  barSize = 40,
  categoryGap = '20%',
  xLabel,
  yLabel,
  legend,
  xTickAngle,
}: BarChartProps<T>) {
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

  const isVertical = layout === 'vertical';
  const horizontalTickStyle: any = {
    fill: 'rgba(255,255,255,0.65)',
    fontSize: 11,
    angle: xTickAngle ?? 0,
    textAnchor: xTickAngle ? 'end' : 'middle',
    dy: 5,
  };

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          layout={isVertical ? 'vertical' : 'horizontal'}
          margin={{
            top: 10,
            right: 30,
            left: 20,
            bottom: !isVertical && xTickAngle ? 120 : 10,
          }}
          barCategoryGap={categoryGap}
        >
          <CartesianGrid
            stroke="rgba(255,255,255,0.05)"
            vertical={!isVertical}
            horizontal={isVertical}
          />
          {isVertical ? (
            <>
              <XAxis
                type="number"
                tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                label={
                  xLabel
                    ? {
                        value: xLabel,
                        fill: 'rgba(255,255,255,0.6)',
                        position: 'insideBottomRight',
                        offset: -6,
                        fontSize: 12,
                      }
                    : undefined
                }
              />
              <YAxis
                dataKey={xKey as string}
                type="category"
                tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 12 }}
                width={120}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey={xKey as string}
                type="category"
                tick={horizontalTickStyle}
                axisLine={false}
                tickLine={false}
                height={xTickAngle ? 90 : 30}
                interval={0}
                label={
                  xLabel
                    ? {
                        value: xLabel,
                        fill: 'rgba(255,255,255,0.6)',
                        position: 'insideBottom',
                        offset: -4,
                        fontSize: 12,
                      }
                    : undefined
                }
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={yFormatter}
                label={
                  yLabel
                    ? {
                        value: yLabel,
                        angle: -90,
                        position: 'insideLeft',
                        offset: -10,
                        fill: 'rgba(255,255,255,0.6)',
                        fontSize: 12,
                      }
                    : undefined
                }
              />
            </>
          )}
          <Tooltip content={renderTooltip} />
          {bars.length > 1 && (
            <Legend
              verticalAlign="bottom"
              formatter={(value) => (
                <span className="text-xs text-white/70">{value}</span>
              )}
            />
          )}
          {!bars.length && legend && (
            <Legend
              verticalAlign="bottom"
              payload={legend.map((name) => ({
                id: name,
                value: name,
                color: 'rgba(255,255,255,0.6)',
                type: 'square',
              }))}
              formatter={(value) => (
                <span className="text-xs text-white/70">{value}</span>
              )}
            />
          )}
          {bars.map((bar, index) => (
            <Bar
              key={bar.key as string}
              dataKey={bar.key as string}
              name={bar.name}
              stackId={bar.stackId}
              fill={bar.color || chartColors[index % chartColors.length]}
              radius={isVertical ? [0, 8, 8, 0] : [8, 8, 0, 0]}
              maxBarSize={barSize}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}