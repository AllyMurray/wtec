import { DateTime } from 'luxon';

export function formatDate(date: Date) {
  return DateTime.fromJSDate(date)
    .setZone('Europe/London')
    .toFormat('d MMM yyyy');
}

export function formatTime(date: Date) {
  return DateTime.fromJSDate(date)
    .setZone('Europe/London')
    .toFormat('HH:mm');
}

export function formatDateString(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}