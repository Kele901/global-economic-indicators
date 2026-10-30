// Formats an ISO date (YYYY-MM-DD) as "30 October 2026". UTC so server and
// client renders agree.
export function formatLongDate(iso: string): string {
  return new Date(`${iso.slice(0, 10)}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
