import { SectionCard } from '../components/Cards/SectionCard';
import { BarChart } from '../components/Charts/BarChart';
import { LineChart } from '../components/Charts/LineChart';
import { useFetch } from '../hooks/useFetch';
import type { DateRange } from '../config';

type PageProps = {
  range: string;
  refreshKey: number;
  dateRange: DateRange;
};

type RatingSummary = {
  total_chats: number;
  avg_chat_length: number;
  total_ratings: number;
  avg_rating: number;
};

type HistogramBucket = { bucket: string; value: number };
type TrendPoint = { date: string; value: number };
type TopUser = { name: string; messages: number; rating: number };

const formatDecimal = (value?: number | null, fallback = '--') => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return fallback;
  }
  return value.toFixed(2);
};

// ${query}

export const RatingPage = ({
  range: _range,
  refreshKey,
  dateRange,
}: PageProps) => {
  const query = `?date_from=${dateRange.from}&date_to=${dateRange.to}&_=${refreshKey}`;
  const summary = useFetch<RatingSummary>(
    `/api/analytics/ratings/summary`
  );
  const histogram = useFetch<HistogramBucket[]>(
    `/api/analytics/ratings/histogram${query}`
  );
  const trend = useFetch<TrendPoint[]>(
    `/api/analytics/ratings/trend${query}`
  );
  const topUsers = useFetch<TopUser[]>(
    `/api/analytics/ratings/top-users${query}`
  );

  return (
    <div className="flex flex-col gap-5">
      <SectionCard
        title="Rating Summary"
        subtitle="Quality signals"
        loading={summary.loading}
        error={summary.error}
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {summary.data ? (
            <>
              <SummaryMetric
                label="Total Chats"
                value={summary.data.total_chats.toLocaleString()}
              />
              <SummaryMetric
                label="Avg. Chat Length"
                value={formatDecimal(summary.data.avg_chat_length)}
              />
              <SummaryMetric
                label="Total Ratings"
                value={summary.data.total_ratings.toLocaleString()}
              />
              <SummaryMetric
                label="Avg. Rating"
                value={formatDecimal(summary.data.avg_rating)}
              />
            </>
          ) : (
            <div className="col-span-full text-sm text-white/60">
              Awaiting data...
            </div>
          )}
        </div>
      </SectionCard>

      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard
          title="Rating Distribution"
          subtitle="Histogram"
          loading={histogram.loading}
          error={histogram.error}
        >
          <div className="space-y-4">
            <BarChart
              data={histogram.data ?? []}
              xKey="bucket"
              bars={[{ key: 'value', name: 'Votes' }]}
              xLabel="Rating bucket"
              yLabel="Votes"
            />
            <div className="flex items-center justify-between text-xs uppercase tracking-wide text-white/60">
              {[1, 2, 3, 4, 5].map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Rating Trend"
          subtitle="Smoothed daily rating"
          loading={trend.loading}
          error={trend.error}
        >
          <LineChart
            data={trend.data ?? []}
            xKey="date"
            yKey="value"
            yFormatter={(value) => formatDecimal(value)}
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
        title="Top Engaged Users"
        subtitle="High impact contributors"
        loading={topUsers.loading}
        error={topUsers.error}
      >
        <div className="space-y-3">
          {(topUsers.data ?? []).map((user) => (
            <div
              key={user.name}
              className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3"
            >
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-white/60">
                  {user.messages.toLocaleString()} msgs
                </p>
              </div>
              <span className="text-lg font-semibold text-teal-300">
                {formatDecimal(user.rating)}
              </span>
            </div>
          ))}
          {!topUsers.data?.length && (
            <p className="text-sm text-white/60">No engaged users found.</p>
          )}
        </div>
      </SectionCard>
    </div>
  );
};

const SummaryMetric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
    <p className="text-xs uppercase tracking-[0.2em] text-white/60">{label}</p>
    <p className="mt-2 text-3xl font-semibold">{value}</p>
  </div>
);
