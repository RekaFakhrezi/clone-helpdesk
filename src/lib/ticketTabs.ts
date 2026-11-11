export type TicketTab =
  | 'all'
  | 'my_tickets'
  | 'waiting_verification'
  | 'open'
  | 'in_progress'
  | 'resolved'
  | 'rejected'
  | 'deleted';

/** Status database untuk tiap tab filter sederhana. */
export const TICKET_TAB_STATUS: Record<string, string> = {
  open: 'OPEN',
  in_progress: 'IN PROGRESS',
  waiting_verification: 'WAITING VERIFICATION',
  rejected: 'DITOLAK',
  deleted: 'DELETED',
};

/** Status yang dianggap selesai untuk tab "resolved". */
export const RESOLVED_STATUSES = ['RESOLVED', 'RESOLVED_BY_SYSTEM'];

/** Status yang tidak lagi dihitung sebagai tiket aktif milik teknisi. */
export const CLOSED_STATUSES = ['RESOLVED', 'CLOSED', 'RESOLVED_BY_SYSTEM'];

export interface TabTicket {
  status?: string | null;
  tech_id?: string | null;
}

/** Satu-satunya aturan filter tab tiket (dipakai tabel, hitungan tab, dan ekspor CSV). */
export function matchesTab(ticket: TabTicket, tab: string, currentUserId?: string): boolean {
  if (tab === 'all') return true;

  const status = (ticket.status || '').toUpperCase();

  if (tab === 'my_tickets') {
    return ticket.tech_id === currentUserId && !CLOSED_STATUSES.includes(status);
  }

  if (tab === 'resolved') {
    return RESOLVED_STATUSES.includes(status);
  }

  return status === TICKET_TAB_STATUS[tab];
}
