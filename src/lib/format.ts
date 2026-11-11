export type FormatLanguage = 'id' | 'en';

/**
 * Jarak waktu relatif terhadap sekarang ("2 jam lalu", "3 days ago").
 * Memakai Intl.RelativeTimeFormat dengan ambang detik/menit/jam/hari.
 */
export function formatTimeAgo(value: string | Date, language: FormatLanguage = 'id'): string {
  if (!value) return language === 'en' ? 'Unknown' : 'Tidak diketahui';

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return language === 'en' ? 'Unknown' : 'Tidak diketahui';

  const diffInSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(language, { numeric: 'always', style: 'long' });

  if (Math.abs(diffInSeconds) < 60) return rtf.format(-diffInSeconds, 'second');

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (Math.abs(diffInMinutes) < 60) return rtf.format(-diffInMinutes, 'minute');

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (Math.abs(diffInHours) < 24) return rtf.format(-diffInHours, 'hour');

  return rtf.format(-Math.floor(diffInHours / 24), 'day');
}
