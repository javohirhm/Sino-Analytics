import type { TooltipProps } from 'recharts';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { chartColors, tooltipContainer } from './chartTheme';

interface DonutChartProps<T extends Record<string, unknown>> {
  data?: T[];
  dataKey: keyof T;
  nameKey: keyof T;
  colors?: string[];
  height?: number;
}

const renderTooltip = (props: TooltipProps<any, any>) => {
  if (!props.active || !props.payload?.length) return null;
  const [payload] = props.payload;
  return (
    <div className={tooltipContainer}>
      <p className="text-xs uppercase tracking-[0.15em] text-white/60">
        {payload.name}
      </p>
      <p className="text-lg font-semibold text-white">
        {payload.value?.toString()}
      </p>
    </div>
  );
};

export function DonutChart<T extends Record<string, unknown>>({
  data = [],
  dataKey,
  nameKey,
  colors = chartColors,
  height = 260,
}: DonutChartProps<T>) {
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
        <PieChart>
          <Pie
            data={data}
            dataKey={dataKey as string}
            nameKey={nameKey as string}
            innerRadius="60%"
            outerRadius="85%"
            paddingAngle={3}
            stroke="transparent"
          >
            {data.map((entry, index) => (
              <Cell
                key={String(entry[nameKey])}
                fill={colors[index % colors.length]}
              />
            ))}
          </Pie>
          <Tooltip content={renderTooltip} />
          <Legend
            verticalAlign="bottom"
            iconSize={10}
            formatter={(value) => (
              <span className="text-xs text-white/70">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
