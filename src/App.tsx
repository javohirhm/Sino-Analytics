import { useMemo, useState } from 'react';
import type { ComponentType } from 'react';
import type { UsersStatsPayload } from './types/analytics';
import { UsersPage } from './pages/UsersPage';
import { RatingPage } from './pages/RatingPage';
import { AISumPage } from './pages/AISumPage';
import { MonitoringPage } from './pages/MonitoringPage';
import { StatCard } from './components/Cards/StatCard';
import { RANGE_OPTIONS, getRangeDates, type DateRange } from './config';
import { useFetch } from './hooks/useFetch';
import './index.css';

type TabId = 'users' | 'rating' | 'aisum' | 'monitoring';
type DashboardPageProps = {
  range: string;
  refreshKey: number;
  stats?: UsersStatsPayload;
  dateRange: DateRange;
};
type DashboardPage = ComponentType<DashboardPageProps>;

const tabs: { id: TabId; label: string; component: DashboardPage }[] = [
  { id: 'users', label: 'Users', component: UsersPage },
  { id: 'rating', label: 'Rating', component: RatingPage },
  { id: 'aisum', label: 'AISum', component: AISumPage },
  { id: 'monitoring', label: 'Monitoring', component: MonitoringPage },
];

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('users');
  const [range, setRange] = useState(RANGE_OPTIONS[2].value);
  const [rangeOpen, setRangeOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const dateRange = useMemo(() => getRangeDates(range), [range]);

  const stats = useFetch<UsersStatsPayload>(
    `/api/analytics/users/stats?date_from=${dateRange.from}&date_to=${dateRange.to}&_=${refreshKey}`
  );

  const statCards = useMemo(() => {
    if (!stats.data) {
      return [
        { id: 'total', title: 'Total Users', value: '--', subtitle: 'users' },
        { id: 'active', title: 'Active Users', value: '--', subtitle: 'last range' },
        { id: 'location', title: 'Top Region', value: '--', subtitle: '' },
        { id: 'language', title: 'Top Language', value: '--', subtitle: '' },
      ];
    }

    const { total_users, by_location = {}, by_language = {} } = stats.data;
    const rangeToActiveField: Record<string, keyof UsersStatsPayload> = {
      '7d': 'active_last_7_days',
      '30d': 'active_last_30_days',
      '90d': 'active_last_90_days',
    };
    const activeKey = rangeToActiveField[range];
    const activeValue = activeKey ? stats.data[activeKey] : undefined;
    const topLocation = Object.entries(by_location)
      .sort((a, b) => b[1] - a[1])[0];
    const topLanguage = Object.entries(by_language)
      .sort((a, b) => b[1] - a[1])[0];

    return [
      {
        id: 'total',
        title: 'Total Users',
        value: total_users.toLocaleString(),
        subtitle: 'users',
      },
      {
        id: 'active',
        title: 'Active Users',
        value: activeValue ? activeValue.toLocaleString() : '--',
        subtitle: `last ${range}`,
      },
      {
        id: 'location',
        title: 'Top Region',
        value: topLocation ? topLocation[1].toLocaleString() : '--',
        subtitle: topLocation ? topLocation[0] : 'n/a',
      },
      {
        id: 'language',
        title: 'Top Language',
        value: topLanguage ? topLanguage[1].toLocaleString() : '--',
        subtitle: topLanguage ? topLanguage[0].toUpperCase() : 'n/a',
      },
    ];
  }, [stats.data, range]);

  const ActivePage =
    tabs.find((tab) => tab.id === activeTab)?.component ?? UsersPage;

  return (
    <div className="min-h-screen bg-[#0e1220] text-white">
      <header className="sticky top-0 z-20 border-b border-white/5 bg-[#0b0f1b]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-r from-indigo-500 via-sky-500 to-teal-400 px-3 py-1 text-sm font-semibold text-white">
              SupaDash
            </div>
            <nav className="flex items-center gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    activeTab === tab.id
                      ? 'bg-white/10 text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
              <button
                className="rounded-full px-4 py-2 text-sm font-medium text-white/60 transition hover:text-white"
                onClick={() => setRangeOpen((prev) => !prev)}
              >
                Range Selector
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="relative"
              tabIndex={0}
              onBlur={(event) => {
                const nextTarget = event.relatedTarget as Node | null;
                if (!nextTarget || !event.currentTarget.contains(nextTarget)) {
                  setRangeOpen(false);
                }
              }}
            >
              <button
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80"
                onClick={() => setRangeOpen((prev) => !prev)}
              >
                <span className="text-white/60">Range</span>
                <span className="font-semibold text-white">
                  {RANGE_OPTIONS.find((opt) => opt.value === range)?.label}
                </span>
              </button>
              {rangeOpen && (
                <div className="absolute right-0 mt-2 w-40 rounded-2xl border border-white/10 bg-[#14192b] p-1 shadow-card">
                  {RANGE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setRange(option.value);
                        setRangeOpen(false);
                      }}
                      className={`w-full rounded-xl px-3 py-2 text-left text-sm ${
                        range === option.value
                          ? 'bg-white/10 text-white'
                          : 'text-white/70 hover:bg-white/5'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              className="rounded-full bg-[#1b62f2] px-5 py-2 text-sm font-semibold text-white shadow-[0_15px_30px_rgba(59,130,246,0.35)]"
              onClick={() => setRefreshKey((key) => key + 1)}
            >
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <StatCard
              key={card.id}
              title={card.title}
              value={card.value}
              subtitle={card.subtitle}
              loading={stats.loading}
            />
          ))}
        </div>

        <div className="mt-2">
          <ActivePage
            range={range}
            refreshKey={refreshKey}
            stats={stats.data}
            dateRange={dateRange}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
