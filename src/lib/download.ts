/**
 * Unduh tabel data sebagai file CSV lewat blob + anchor sementara.
 * Setiap sel sudah diformat pemanggil; baris digabung dengan koma.
 */
export function downloadCsv(rows: (string | number)[][], filename: string): void {
  const csvContent = rows.map((row) => row.join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
