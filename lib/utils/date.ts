import { format, formatDistance, parseISO } from 'date-fns';

export function formatDate(date: Date | string | undefined): string {
  if (!date) return 'N/A';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM dd, yyyy');
}

export function formatDateTime(date: Date | string | undefined): string {
  if (!date) return 'N/A';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM dd, yyyy HH:mm');
}

export function formatTime(date: Date | string | undefined): string {
  if (!date) return 'N/A';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'HH:mm');
}

export function formatRelativeTime(date: Date | string | undefined): string {
  if (!date) return 'N/A';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistance(dateObj, new Date(), { addSuffix: true });
}

export function toISODateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function parseDate(dateString: string): Date {
  return parseISO(dateString);
}

/**
 * Stay dates (check-in/check-out) are hotel wall-clock values. The API sends them with a "Z",
 * but they aren't UTC, so read the digits as-is: new Date() or parseISO() would shift them into
 * the browser's time zone (an hour late in Central Europe in winter, or onto the previous day
 * west of UTC). Real timestamps (createdAt, payments) still go through the helpers above.
 */
export function parseStayDate(value: string | Date): Date {
  if (value instanceof Date) return value;
  const [datePart, timePart = '00:00'] = value.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);
  return new Date(year, month - 1, day, hours || 0, minutes || 0);
}

/** A stay date/time in any date-fns pattern, without time-zone shifting */
export function formatStay(value: string | Date | undefined, pattern = 'MMM dd, yyyy'): string {
  if (!value) return 'N/A';
  return format(parseStayDate(value), pattern);
}
