export const getProgressState = (
  value?: number | null,
  max: number = 100
) => {
  const safeMax = Number.isFinite(max) ? Math.max(max, 0) : 0;
  const safeValue = Number.isFinite(value) ? (value as number) : 0;

  if (safeMax <= 0) {
    return { clampedValue: 0, percentage: 0, max: 0 };
  }

  const clampedValue = Math.min(Math.max(safeValue, 0), safeMax);
  const percentage = (clampedValue / safeMax) * 100;

  return { clampedValue, percentage, max: safeMax };
};
