import { supabase } from '../config/supabase';

/**
 * Fragmen select tiket standar: kategori, departemen, dan teknisi.
 * Detail tiket menambahkan `attachments:ticket_attachments(*)` di belakangnya.
 */
export const TICKET_SELECT =
  '*, category:categories(name), dept:departments(name), tech:staff_profiles!tickets_tech_id_fkey(name)';

/**
 * Nomor tiket berikutnya berdasarkan digit terbesar pada tabel `tickets`.
 * Contoh hasil: `#000001`.
 */
export async function nextTicketNumber(): Promise<string> {
  const { data: tickets } = await supabase.from('tickets').select('ticket_num');

  let maxNum = 0;
  (tickets || []).forEach((t: { ticket_num: string | null }) => {
    const match = t.ticket_num?.match(/\d+/);
    if (match) {
      const num = parseInt(match[0], 10);
      if (num > maxNum) maxNum = num;
    }
  });

  return `#${(maxNum + 1).toString().padStart(6, '0')}`;
}

/**
 * Master-data yang dipakai filter dashboard tiket:
 * kategori (dengan data SLA), departemen, dan daftar teknisi.
 */
export async function loadTicketFilterMeta() {
  const [{ data: categories }, { data: slaConfigs }, { data: departments }, { data: technicians }] =
    await Promise.all([
      supabase.from('categories').select('*'),
      supabase.from('sla_configs').select('*'),
      supabase.from('departments').select('*'),
      supabase.from('staff_profiles').select('id, name, role').in('role', ['teknisi', 'agent']),
    ]);

  const formattedCategories = (categories || []).map(cat => ({
    ...cat,
    slaData: (slaConfigs || []).find(sla => sla.category_id === cat.id),
  }));

  return { categories: formattedCategories, departments, technicians };
}
