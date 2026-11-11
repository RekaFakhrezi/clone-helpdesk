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
  // Teks UI yang sudah ada memakai "N hari lalu", bukan "N hari yang lalu".
  const phrase = (value: number, unit: Intl.RelativeTimeFormatUnit) =>
    rtf.format(-value, unit).replace(' yang lalu', ' lalu').replace(' yang akan datang', ' lagi');

  if (Math.abs(diffInSeconds) < 60) return phrase(diffInSeconds, 'second');

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (Math.abs(diffInMinutes) < 60) return phrase(diffInMinutes, 'minute');

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (Math.abs(diffInHours) < 24) return phrase(diffInHours, 'hour');

  return phrase(Math.floor(diffInHours / 24), 'day');
}
