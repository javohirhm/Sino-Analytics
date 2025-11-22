import { useMemo } from 'react';
import { SectionCard } from '../components/Cards/SectionCard';
import { LineChart } from '../components/Charts/LineChart';
import { BarChart } from '../components/Charts/BarChart';
import { DonutChart } from '../components/Charts/DonutChart';
import { useFetch } from '../hooks/useFetch';
import type { DateRange } from '../config';

type PageProps = {
  range: string;
  refreshKey: number;
  dateRange: DateRange;
};

type MessagesPoint = { date: string; value: number };
type DoctorDatum = { label: string; value: number };
type PeakHourDatum = { hour: string; value: number };
type ConclusionCount = { conclusion_count: number };
type ConclusionPoint = { date: string; value: number };

// Static data for Kasalliklar
const kasalliklarData = [
  { label: "Oshqozon ichak", value: 244 },
  { label: "Erkaklar va Ayollar jinsiy muammosi", value: 138 },
  { label: "Bo'g'imlar (oyoq, yelka, qo'l, bel)", value: 117 },
  { label: "Asab, Stress, Uyqu", value: 91 },
  { label: "Burun, Tomoq, Quloq", value: 83 },
  { label: "Yurak qon tomirlar va qon bosimi", value: 75 },
  { label: "Teri, terlash", value: 69 },
  { label: "Bosh og'rig'i va aylanishi", value: 52 },
  { label: "O'pka", value: 30 },
  { label: "Ko'z", value: 27 },
  { label: "Tish", value: 25 },
  { label: "Yuz (husnbuzar, o'gri)", value: 20 },
  { label: "Soch va tuklar", value: 15 },
  { label: "Allergiya", value: 13 },
  { label: "Barmoq (qo'l va oyoq barmoqlari)", value: 5 },
];

const normalizeDoctorLabel = (label?: string) => {
  if (!label) return null;
  const cleaned = label
    .toLowerCase()
    .replace(/[-_/]/g, ' ')
    .split(/[,+]/)[0]
    .trim();

  if (!cleaned || cleaned === 'no doctor') {
    return null;
  }

  return cleaned
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

export const AISumPage = ({
  range: _range,
  refreshKey,
  dateRange,
}: PageProps) => {
  const query = `?date_from=${dateRange.from}&date_to=${dateRange.to}&_=${refreshKey}`;
  const messages = useFetch<MessagesPoint[]>(
    `/api/analytics/ai/messages-per-day${query}`
  );
  const doctors = useFetch<DoctorDatum[]>(`/api/analytics/ai/doctors${query}`);
  const peakHours = useFetch<PeakHourDatum[]>(
    `/api/analytics/ai/peak-hours${query}`
  );
  const conclusionCount = useFetch<ConclusionCount>(
    `/api/analytics/conclusions/count${query}`
  );
  const conclusionSeries = useFetch<ConclusionPoint[]>(
    `/api/analytics/conclusions/timeseries${query}`
  );

  const aggregatedDoctors = useMemo(() => {
    const bucket = new Map<string, number>();
    (doctors.data ?? []).forEach((doctor) => {
      const normalized = normalizeDoctorLabel(doctor.label);
      if (!normalized) return;
      bucket.set(normalized, (bucket.get(normalized) ?? 0) + doctor.value);
    });

    return Array.from(bucket.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [doctors.data]);

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

      <SectionCard
        title="Doctor Distribution"
        subtitle="Sessions handled"
        loading={doctors.loading}
        error={doctors.error}
      >
        <BarChart
          data={aggregatedDoctors}
          xKey="label"
          bars={[{ key: 'value', name: 'Sessions' }]}
          barSize={20}
          categoryGap="8%"
          xLabel="Doctor"
          yLabel="Sessions"
          xTickAngle={-55}
        />
      </SectionCard>

      <SectionCard
        title="Conclusion Messages"
        subtitle="Assistant summaries over time"
        loading={conclusionCount.loading || conclusionSeries.loading}
        error={conclusionCount.error || conclusionSeries.error}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-sm text-white/70">Total conclusions</p>
            <p className="text-2xl font-semibold text-white">
              {conclusionCount.data
                ? conclusionCount.data.conclusion_count.toLocaleString()
                : '--'}
            </p>
          </div>
          <LineChart
            data={conclusionSeries.data ?? []}
            xKey="date"
            yKey="value"
            color="#2fd6c5"
            yFormatter={(value) => value.toLocaleString()}
            xFormatter={(value) =>
              new Date(value as string).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })
            }
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Kasalliklar"
        subtitle="Disease categories"
      >
        <DonutChart
          data={kasalliklarData}
          dataKey="value"
          nameKey="label"
        />
      </SectionCard>

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
