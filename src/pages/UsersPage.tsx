import { useMemo } from 'react';
import { SectionCard } from '../components/Cards/SectionCard';
import { LineChart } from '../components/Charts/LineChart';
import { DonutChart } from '../components/Charts/DonutChart';
import { BarChart } from '../components/Charts/BarChart';
import { useFetch } from '../hooks/useFetch';
import type { UsersStatsPayload } from '../types/analytics';
import type { DateRange } from '../config';
import {
  normalizeRegionName,
  shouldExcludeRegionLabel,
} from '../utils/region';

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

const AGE_GROUP_LABELS = ['<20', '20-40', '40-60', '60+'];

const formatNumber = (value?: number) =>
  value !== undefined ? value.toLocaleString() : '--';

/* -------------------------------------------------------
   HELPER: Check if value is unknown
   ------------------------------------------------------- */
const isUnknown = (label: string | undefined | null) => {
  if (!label) return false; // Handle undefined/null
  const lower = label.trim().toLowerCase();
  return lower === 'unknown' || lower === 'n/a' || lower === 'none';
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
  const dauUsers = useFetch<ActiveUserPoint[]>(
    `/api/analytics/users/dau${query}`
  );
  const mauUsers = useFetch<ActiveUserPoint[]>(
    `/api/analytics/users/mau${query}`
  );
  const genders = useFetch<Distribution[]>(
    `/api/analytics/users/gender${query}`
  );
  const languages = useFetch<Distribution[]>(
    `/api/analytics/users/language${query}`
  );
  const regions = useFetch<RegionDatum[]>(`/api/analytics/users/regions`);
  const ageGroups = useFetch<AgeGroup[]>(
    `/api/analytics/users/age-groups${query}`
  );

  /* -------------------------------------------------------
     LANGUAGE FROM STATS
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
     Apply fallback logic
     ------------------------------------------------------- */
  const languageData = languageFromStats ?? languages.data ?? [];
  const languageLoading = !languageFromStats && languages.loading;
  const languageError = languageFromStats ? null : languages.error;

  const hasRegionApiData = normalizedRegions.length > 0;
  const regionData =
    (hasRegionApiData ? normalizedRegions : regionFromStats) ?? [];
  const regionLoading = !hasRegionApiData && regions.loading;
  const regionError =
    !hasRegionApiData && !regionFromStats ? regions.error : null;

  /* -------------------------------------------------------
     FILTER OUT UNKNOWN VALUES (after all data is defined)
     ------------------------------------------------------- */
  const filteredRegions = useMemo(
    () => regionData.filter((r) => !shouldExcludeRegionLabel(r.label)),
    [regionData]
  );

  const filteredGenders = useMemo(
    () => (genders.data ?? []).filter((g) => !isUnknown(g.label)),
    [genders.data]
  );

  const filteredLanguages = useMemo(
    () => languageData.filter((l) => !isUnknown(l.label)),
    [languageData]
  );

  const orderedAgeGroups = useMemo(() => {
    const orderIndex = AGE_GROUP_LABELS.reduce<Record<string, number>>(
      (acc, label, index) => {
        acc[label] = index;
        return acc;
      },
      {}
    );

    const normalized = (ageGroups.data ?? []).map((item) => {
      const group = item.group ?? item.label ?? '';
      return {
        group,
        value:
          typeof item.value === 'number' && !Number.isNaN(item.value)
            ? item.value
            : 0,
      };
    });

    return normalized
      .filter((ageGroup) => ageGroup.group && !isUnknown(ageGroup.group))
      .sort((a, b) => {
        const aIndex = orderIndex[a.group] ?? Number.MAX_SAFE_INTEGER;
        const bIndex = orderIndex[b.group] ?? Number.MAX_SAFE_INTEGER;
        return aIndex - bIndex;
      });
  }, [ageGroups.data]);

  /* -------------------------------------------------------
     FINAL JSX
     ------------------------------------------------------- */
  return (
    <div className="flex flex-col gap-5">
      {/* DAU and MAU Row */}
      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard
          title="DAU"
          subtitle="Daily Active Users"
          loading={dauUsers.loading}
          error={dauUsers.error}
        >
          <LineChart
            data={dauUsers.data ?? []}
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
          title="MAU"
          subtitle="Monthly Active Users (30-day rolling)"
          loading={mauUsers.loading}
          error={mauUsers.error}
        >
          <LineChart
            data={mauUsers.data ?? []}
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
      </div>

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
            data={filteredGenders}
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
            data={filteredLanguages}
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
            data={filteredRegions}
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
              data={orderedAgeGroups}
              xKey="group"
              bars={[{ key: 'value', name: 'Users' }]}
              xLabel="Age group"
              yLabel="Users"
            />

            <div className="flex flex-wrap justify-between gap-3 text-xs uppercase tracking-wide text-white/60">
              {AGE_GROUP_LABELS.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};
