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

type MessagesPoint = { date: string; value: number };
type TopicDatum = { topic: string; ai: number; doctor: number };
type DoctorDatum = { label: string; value: number };
type PeakHourDatum = { hour: string; value: number };

export const AISumPage = ({
  range: _range,
  refreshKey,
  dateRange,
}: PageProps) => {
  const query = `?date_from=${dateRange.from}&date_to=${dateRange.to}&_=${refreshKey}`;
  const messages = useFetch<MessagesPoint[]>(
    `/api/analytics/ai/messages-per-day${query}`
  );
  const topics = useFetch<TopicDatum[]>(`/api/analytics/ai/topics${query}`);
  const doctors = useFetch<DoctorDatum[]>(`/api/analytics/ai/doctors${query}`);
  const peakHours = useFetch<PeakHourDatum[]>(
    `/api/analytics/ai/peak-hours${query}`
  );

  return (
    <div className="flex flex-col gap-5">
      <SectionCard
        title="AI Messages per Day"
        subtitle="Combined platform activity"
        loading={messages.loading}
        error={messages.error}
      >
        <LineChart
          data={messages.data ?? []}
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

      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard
          title="Topics"
          subtitle="AI vs human handled"
          loading={topics.loading}
          error={topics.error}
        >
          <BarChart
            data={topics.data ?? []}
            xKey="topic"
            bars={[
              { key: 'ai', name: 'AI', stackId: 'topics' },
              { key: 'doctor', name: 'Doctor', stackId: 'topics' },
            ]}
            xLabel="Topics"
            yLabel="Messages"
          />
        </SectionCard>

        <SectionCard
          title="Doctor Distribution"
          subtitle="Sessions handled"
          loading={doctors.loading}
          error={doctors.error}
        >
          <BarChart
            data={doctors.data ?? []}
            xKey="label"
            bars={[{ key: 'value', name: 'Sessions' }]}
            barSize={18}
            categoryGap="10%"
            xLabel="Label"
            yLabel="Sessions"
          />
        </SectionCard>
      </div>

      <SectionCard
        title="Peak Hours"
        subtitle="Hourly intensity"
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
    </div>
  );
};
