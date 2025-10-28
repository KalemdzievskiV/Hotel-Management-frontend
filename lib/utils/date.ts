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
