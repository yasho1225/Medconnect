export function approximateAgeFromDob(dob: string): number {
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return 35;
  const diff = Date.now() - d.getTime();
  return Math.max(18, Math.min(90, Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000))));
}
