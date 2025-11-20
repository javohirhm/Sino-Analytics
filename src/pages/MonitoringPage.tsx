import { SectionCard } from '../components/Cards/SectionCard';
import { LineChart } from '../components/Charts/LineChart';
import { BarChart } from '../components/Charts/BarChart';
import { useFetch } from '../hooks/useFetch';
import type { DateRange } from '../config';

type PageProps = {
  range: string;
  refreshKey: number;
  dateRange: DateRange;
};

type ActivePoint = { date: string; count: number };
type MessagesPoint = { date: string; value: number };
type RatingPoint = { date: string; value: number };
type PeakHour = { hour: string; value: number };

export const MonitoringPage = ({
  range: _range,
  refreshKey,
  dateRange,
}: PageProps) => {
  const query = `?date_from=${dateRange.from}&date_to=${dateRange.to}&_=${refreshKey}`;
  const active = useFetch<ActivePoint[]>(
    `/api/analytics/users/active${query}`
  );
  const backlog = useFetch<MessagesPoint[]>(
    `/api/analytics/ai/messages-per-day${query}`
  );
  const ratingTrend = useFetch<RatingPoint[]>(
    `/api/analytics/ratings/trend${query}`
  );
  const peakHours = useFetch<PeakHour[]>(
    `/api/analytics/ai/peak-hours${query}`
  );

  const currentActive = active.data?.at(-1)?.count ?? 0;
  const prevActive = active.data?.at(-2)?.count ?? currentActive;
  const currentMessages = backlog.data?.at(-1)?.value ?? 0;
  const prevMessages = backlog.data?.at(-2)?.value ?? currentMessages;
  const currentRating = ratingTrend.data?.at(-1)?.value ?? 0;
  const prevRating = ratingTrend.data?.at(-2)?.value ?? currentRating;

  const cardMetrics = [
    {
      label: 'Active Users',
      value: currentActive.toLocaleString(),
      delta: formatDelta(currentActive - prevActive),
      status: currentActive >= prevActive ? 'Stable' : 'Watch',
    },
    {
      label: 'AI Load',
      value: currentMessages.toLocaleString(),
      delta: formatDelta(currentMessages - prevMessages),
      status: currentMessages >= prevMessages ? 'Rising' : 'Cooling',
    },
    {
      label: 'Avg Rating',
      value: currentRating.toFixed(2),
      delta: formatDelta(currentRating - prevRating),
      status: currentRating >= prevRating ? 'Healthy' : 'Attention',
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-5 md:grid-cols-3">
        {cardMetrics.map((metric) => (
          <div
            key={metric.label}
            className="glass-card rounded-card border border-white/5 bg-white/5 p-5"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">
              {metric.label}
            </p>
            <p className="mt-3 text-3xl font-semibold">{metric.value}</p>
            <p className="text-sm text-teal-300">{metric.delta}</p>
            <p className="text-xs text-white/60">{metric.status}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard
          title="Activity Pulse"
          subtitle="Live user throughput"
          loading={active.loading}
          error={active.error}
        >
          <LineChart
            data={active.data ?? []}
            xKey="date"
            yKey="count"
            yFormatter={(value) => value.toLocaleString()}
            xFormatter={(value) =>
              new Date(value as string).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })
            }
          />
        </SectionCard>
        <SectionCard
          title="Quality Monitor"
          subtitle="Rolling customer rating"
          loading={ratingTrend.loading}
          error={ratingTrend.error}
        >
          <LineChart
            data={ratingTrend.data ?? []}
            xKey="date"
            yKey="value"
            yFormatter={(value) => value.toFixed(2)}
            xFormatter={(value) =>
              new Date(value as string).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })
            }
          />
        </SectionCard>
      </div>

        <SectionCard
          title="Traffic Stress Test"
          subtitle="Peak hour load distribution"
          loading={peakHours.loading}
          error={peakHours.error}
        >
          <div className="space-y-4">
            <BarChart
              data={peakHours.data ?? []}
              xKey="hour"
              bars={[{ key: 'value', name: 'Messages' }]}
              xLabel="Hour"
              yLabel="Messages"
            />
            <div className="flex flex-wrap justify-between text-[10px] uppercase tracking-wide text-white/60">
              {Array.from({ length: 25 }).map((_, index) => (
                <span key={index}>{index}</span>
              ))}
            </div>
          </div>
        </SectionCard>

      <SectionCard
        title="Backlog Tracker"
        subtitle="AI queue depth vs previous period"
        loading={backlog.loading}
        error={backlog.error}
      >
        <LineChart
          data={backlog.data ?? []}
          xKey="date"
          yKey="value"
          color="#ffea00ff"
          yFormatter={(value) => value.toLocaleString()}
          xFormatter={(value) =>
            new Date(value as string).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })
          }
        />
      </SectionCard>
    </div>
  );
};

const formatDelta = (value: number) => {
  const prefix = value >= 0 ? '+' : '-';
  return `${prefix}${Math.abs(value).toLocaleString()}`;
};
