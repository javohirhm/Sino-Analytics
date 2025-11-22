export const API_BASE =
  import.meta.env.VITE_API_BASE?.replace(/\/$/, '') || 'https://chatapi.sinoai.io';

export type DateRange = {
  from: string;
  to: string;
};

const formatDate = (date: Date) => date.toISOString().split('T')[0];

const RANGE_TO_DAYS: Record<string, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

export const RANGE_OPTIONS = [
  { label: 'Last 7d', value: '7d' },
  { label: 'Last 30d', value: '30d' },
  { label: 'Last 90d', value: '90d' },
];

export const getRangeDates = (range: string): DateRange => {
  const to = new Date();
  const from = new Date();
  const days = RANGE_TO_DAYS[range] ?? RANGE_TO_DAYS['7d'];
  from.setDate(to.getDate() - (days - 1));
  return {
    from: formatDate(from),
    to: formatDate(to),
  };
};
