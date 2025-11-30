const UNKNOWN_LABELS = new Set(['unknown', 'n/a', 'none']);

export const normalizeRegionName = (name: string | undefined | null): string => {
  if (!name) return 'Unknown';

  const normalized = name.toLowerCase().trim();

  if (normalized.includes("qoraqalpog'iston")) {
    return "Qoraqalpog'iston Respublikasi";
  }

  return name.trim();
};

export const shouldExcludeRegionLabel = (
  label: string | undefined | null
): boolean => {
  if (!label) return false;

  const normalized = label.trim().toLowerCase();
  return UNKNOWN_LABELS.has(normalized) || normalized === 'kokand';
};
