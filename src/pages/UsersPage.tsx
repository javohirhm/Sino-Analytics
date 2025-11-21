import { useMemo } from 'react';
import { SectionCard } from '../components/Cards/SectionCard';
import { LineChart } from '../components/Charts/LineChart';
import { DonutChart } from '../components/Charts/DonutChart';
import { BarChart } from '../components/Charts/BarChart';
import { useFetch } from '../hooks/useFetch';
import type { UsersStatsPayload } from '../types/analytics';
import type { DateRange } from '../config';

type PageProps = {
  range: string;
  refreshKey: number;
  stats?: UsersStatsPayload;
  dateRange: DateRange;
};

type ActiveUserPoint = { date: string; value: number };
type Distribution = { label: string; value: number };
type RegionDatum = { label: string; value: number };
type AgeGroup = { group: string; value: number };

const AGE_LABEL_ORDER = ['<20', '40-60', '60+', '20-40', 'unknown'];

const formatNumber = (value?: number) =>
  value !== undefined ? value.toLocaleString() : '--';

/* -------------------------------------------------------
   REGION NORMALIZATION MAP
   ------------------------------------------------------- */
const normalizeRegionName = (name: string) => {
  if (!name) return 'Unknown';

  const lower = name.toLowerCase().trim();

  if (lower.includes("qoraqalpog'iston")) {
    return "Qoraqalpog'iston Respublikasi";
  }

  return name.trim();
};

export const UsersPage = ({
  range: _range,
  refreshKey,
  stats,
  dateRange,
}: PageProps) => {
  const query = `?date_from=${dateRange.from}&date_to=${dateRange.to}&_=${refreshKey}`;

  const activeUsers = useFetch<ActiveUserPoint[]>(
    `/api/analytics/users/active${query}`
  );
  const genders = useFetch<Distribution[]>(
    `/api/analytics/users/gender${query}`
  );
  const languages = useFetch<Distribution[]>(
    `/api/analytics/users/language${query}`
  );
  const regions = useFetch<RegionDatum[]>(`/api/analytics/users/locations`);
  const ageGroups = useFetch<AgeGroup[]>(
    `/api/analytics/users/age-groups${query}`
  );

  /* -------------------------------------------------------
     LANGUAGE FROM STATS (unchanged)
     ------------------------------------------------------- */
  const languageFromStats = useMemo<Distribution[] | null>(() => {
    if (!stats?.by_language) return null;
    const normalized = Object.entries(stats.by_language)
      .filter(([, value]) => typeof value === 'number' && !Number.isNaN(value))
      .map(([label, value]) => ({ label, value }));
    return normalized.length > 1 ? normalized : null;
  }, [stats]);

  /* -------------------------------------------------------
     REGION NORMALIZATION + MERGING
     ------------------------------------------------------- */
  const regionFromStats = useMemo<RegionDatum[] | null>(() => {
    if (!stats?.by_location) return null;

    const merged: Record<string, number> = {};

    for (const [rawLabel, value] of Object.entries(stats.by_location)) {
      const label = normalizeRegionName(rawLabel);
      if (!merged[label]) merged[label] = 0;
      merged[label] += value;
    }

    return Object.entries(merged).map(([label, value]) => ({ label, value }));
  }, [stats]);

  const normalizedRegions = useMemo(() => {
    if (!regions.data) return [];

    const merged: Record<string, number> = {};

    for (const item of regions.data) {
      const label = normalizeRegionName(item.label);
      if (!merged[label]) merged[label] = 0;
      merged[label] += item.value;
    }

    return Object.entries(merged).map(([label, value]) => ({ label, value }));
  }, [regions.data]);

  /* -------------------------------------------------------
     OPTIONAL BAR REMOVAL (example: hide "Unknown")
     ------------------------------------------------------- */
  const HIDDEN_REGIONS = ["Unknown"]; // ⬅ add any region you want to hide

  const filteredRegions = useMemo(
    () => normalizedRegions.filter((r) => !HIDDEN_REGIONS.includes(r.label)),
    [normalizedRegions]
  );

  /* -------------------------------------------------------
     Apply fallback logic (unchanged)
     ------------------------------------------------------- */
  const languageData = languageFromStats ?? languages.data ?? [];
  const languageLoading = !languageFromStats && languages.loading;
  const languageError = languageFromStats ? null : languages.error;

  const regionData = regionFromStats ?? filteredRegions ?? [];
  const regionLoading = !regionFromStats && regions.loading;
  const regionError = regionFromStats ? null : regions.error;

  // const regionChartHeight = Math.max(260, regionData.length * 28);

  /* -------------------------------------------------------
     FINAL JSX (unchanged)
     ------------------------------------------------------- */
  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-5 lg:grid-cols-3">
        <SectionCard
          title="Active Users"
          subtitle="Time-series"
          loading={activeUsers.loading}
          error={activeUsers.error}
        >
          <LineChart
            data={activeUsers.data ?? []}
            xKey="date"
            yKey="value"
            yFormatter={(value) => formatNumber(value)}
            xFormatter={(value) =>
              new Date(value as string).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })
            }
          />
        </SectionCard>

        <SectionCard
          title="Gender"
          loading={genders.loading}
          error={genders.error}
        >
          <DonutChart
            data={genders.data ?? []}
            dataKey="value"
            nameKey="label"
          />
        </SectionCard>

        <SectionCard
          title="Language"
          loading={languageLoading}
          error={languageError}
        >
          <DonutChart
            data={languageData}
            dataKey="value"
            nameKey="label"
          />
        </SectionCard>
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        <SectionCard
          title="Regions"
          subtitle="Top performing"
          loading={regionLoading}
          error={regionError}
          className="lg:col-span-3"
        >
          <BarChart
            data={regionData}
            xKey="label"
            bars={[{ key: 'value', name: 'Users' }]}
            height={500}
            barSize={24}
            yLabel="Users"
            xTickAngle={-45}
          />
        </SectionCard>

        <SectionCard
          title="Age Groups"
          subtitle="Engagement split"
          loading={ageGroups.loading}
          error={ageGroups.error}
          className="lg:col-span-2"
        >
          <div className="space-y-4">
            <BarChart
              data={ageGroups.data ?? []}
              xKey="group"
              bars={[{ key: 'value', name: 'Users' }]}
              xLabel="Age group"
              yLabel="Users"
            />

            <div className="flex flex-wrap justify-between gap-3 text-xs uppercase tracking-wide text-white/60">
              {AGE_LABEL_ORDER.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};