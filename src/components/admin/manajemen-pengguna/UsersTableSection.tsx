'use client';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export interface UserItem {
  id: string;
  phone: string;
  name: string;
  nimNip: string;
  fakultasUnit: string;
  status: 'Aktif' | 'Terblokir';
  createdDate: string;
  rawDate: string;
}

interface UsersTableSectionProps {
  users?: UserItem[];
  totalUsers?: number;
  currentPage?: number;
  totalPages?: number;
  itemsPerPage?: number;
  setItemsPerPage?: (val: number) => void;
  selectedUserIds?: string[];
  isLoading?: boolean;
  onSelectUser?: (id: string) => void;
  onSelectAll?: () => void;
  onPageChange?: (page: number) => void;
  onEditUser?: (user: UserItem) => void;
  onDeleteUser?: (id: string) => void;
}

export default function UsersTableSection({
  users = [],
  totalUsers = 0,
  currentPage = 1,
  totalPages = 1,
  itemsPerPage = 10,
  setItemsPerPage,
  selectedUserIds = [],
  isLoading = false,
  onSelectUser,
  onSelectAll,
  onPageChange,
  onEditUser,
  onDeleteUser,
}: UsersTableSectionProps) {
  const { t } = useLanguage();
  const isAllSelected = users.length > 0 && users.every((u) => selectedUserIds.includes(u.id));
  const startDisplay = totalUsers === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endDisplay = Math.min(currentPage * itemsPerPage, totalUsers);

  const pageButtonClass = (isActive: boolean) =>
    `cursor-pointer rounded-[4px] w-7 h-7 flex items-center justify-center font-medium tabular-nums text-[12px] ${
      isActive ? 'bg-[var(--accent)] text-white' : 'hover:bg-[var(--canvas)] text-[var(--fg)]'
    }`;

  return (
    <div className="flex flex-col rounded-[4px] border border-[var(--rule)] bg-[var(--surface)] w-full overflow-hidden">
      <div className="w-full overflow-x-auto min-h-[400px]">
        <table className="w-full text-left table-auto">
          <thead className="border-b border-[var(--rule)]">
            <tr>
              <th className="px-4 py-2.5 w-12 text-center">
                <input
                  type="checkbox"
                  className="h-[14px] w-[14px] cursor-pointer accent-[var(--accent)]"
                  checked={isAllSelected}
                  onChange={onSelectAll}
                />
              </th>
              <th className="px-4 py-2.5 select-none">
                <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]">{t('users.col_name', 'NAMA')}</span>
              </th>
              <th className="px-4 py-2.5 select-none">
                <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]">{t('users.col_nim_nip', 'NIM / NIP')}</span>
              </th>
              <th className="px-4 py-2.5 select-none">
                <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]">{t('users.col_unit', 'FAKULTAS / UNIT KERJA')}</span>
              </th>
              <th className="px-4 py-2.5 select-none">
                <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]">{t('users.col_created', 'CREATED')}</span>
              </th>
              <th className="px-4 py-2.5 select-none text-center w-24">
                <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]">{t('users.col_action', 'AKSI')}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-[12.5px] text-[var(--fg-dim)]">
                  {t('users.loading', 'Memuat data pelapor...')}
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-[12.5px] text-[var(--fg-dim)]">
                  {t('users.empty', 'Tidak ada data pelapor yang ditemukan.')}
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const isSelected = selectedUserIds.includes(user.id);
                return (
                  <tr key={user.id} className="border-b border-[var(--rule)] transition-colors hover:bg-[var(--canvas)]">
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        className="h-[14px] w-[14px] cursor-pointer accent-[var(--accent)]"
                        checked={isSelected}
                        onChange={() => onSelectUser?.(user.id)}
                      />
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <Link href={`/dashboard/administrasi/users/${user.id}`} className="block">
                        <p className="text-[12.5px] font-medium text-[var(--fg)] truncate mb-0.5 hover:text-[var(--accent)]">
                          {user.name}
                        </p>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="tabular-nums text-[12px] text-[var(--fg-dim)] truncate max-w-[120px]">
                        {user.nimNip}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-[3px] border border-[var(--rule)] bg-[var(--canvas)] px-2 py-0.5 text-[11.5px] text-[var(--fg-dim)] truncate max-w-[200px]">
                        {user.fakultasUnit}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="tabular-nums text-[12px] text-[var(--fg-dim)]">
                        {user.createdDate}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => onEditUser?.(user)}
                        className="p-1.5 inline-flex items-center justify-center rounded-[4px] text-[var(--accent)] transition-colors hover:bg-[var(--canvas)]"
                        title="Edit Data"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row py-3 px-4 justify-between items-center border-t border-[var(--rule)] bg-[var(--surface)] w-full mt-auto gap-4">
        <div className="flex items-center gap-2">
            {setItemsPerPage && (
              <select
                  value={itemsPerPage}
                  onChange={(e) => { setItemsPerPage(Number(e.target.value)); onPageChange?.(1); }}
                  className="text-[12px] border border-[var(--rule-strong)] rounded-[4px] bg-transparent px-2 py-1 outline-none focus:border-[var(--accent)] text-[var(--fg)]"
              >
                  <option value={8}>8 / {t('tickets.per_page', 'page')}</option>
                  <option value={10}>10 / {t('tickets.per_page', 'page')}</option>
                  <option value={15}>15 / {t('tickets.per_page', 'page')}</option>
                  <option value={25}>25 / {t('tickets.per_page', 'page')}</option>
                  <option value={50}>50 / {t('tickets.per_page', 'page')}</option>
              </select>
            )}
            <p className="text-[var(--fg-dim)] text-[12px] tabular-nums">
                {t('tickets.showing', 'Showing')} {startDisplay} - {endDisplay} {t('tickets.of', 'of')} {totalUsers.toLocaleString('en-US')} {t('users.reporters_count', 'pelapor')}
            </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onPageChange?.(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className={`flex justify-center items-center rounded-[4px] border border-[var(--rule)] text-[var(--fg)] w-7 h-7 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-[var(--canvas)]'}`}>
            <svg width="7" height="10" viewBox="0 0 7 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 10L0 5L5 0L6.16667 1.16667L2.33333 5L6.16667 8.83333L5 10Z" fill="currentColor" /></svg>
          </button>

          <button onClick={() => onPageChange?.(1)} className={pageButtonClass(currentPage === 1)}>1</button>

          {totalPages > 1 && (
              <button onClick={() => onPageChange?.(2)} className={pageButtonClass(currentPage === 2)}>2</button>
          )}

          {totalPages > 2 && (
              <button onClick={() => onPageChange?.(3)} className={pageButtonClass(currentPage === 3)}>3</button>
          )}

          {totalPages > 4 && <span className="px-1 text-[12px] text-[var(--fg-faint)]">...</span>}

          {totalPages > 3 && (
            <button onClick={() => onPageChange?.(totalPages)} className={pageButtonClass(currentPage === totalPages)}>{totalPages}</button>
          )}

          <button onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages || totalPages === 0} className={`flex justify-center items-center rounded-[4px] border border-[var(--rule)] text-[var(--fg)] w-7 h-7 ${currentPage === totalPages || totalPages === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-[var(--canvas)]'}`}>
            <svg width="7" height="10" viewBox="0 0 7 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.83333 5L0 1.16667L1.16667 0L6.16667 5L1.16667 10L0 8.83333L3.83333 5Z" fill="currentColor" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
