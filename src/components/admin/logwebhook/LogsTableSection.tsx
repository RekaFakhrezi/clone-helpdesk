"use client";

import React, { useState, useMemo } from "react";

interface LogsTableSectionProps {
  searchQuery?: string;
  isFilterActive?: boolean;
}

const DUMMY_LOGS = [
  {
    id: 1,
    time: "21/7/2026, 08.21.05",
    type: "INCOMING",
    phone: "62812345678",
    status: "SUCCESS",
    payload: "1",
    error: "-",
    template: "simple" as const,
  },
  {
    id: 2,
    time: "21/7/2026, 08.21.01",
    type: "OUTGOING",
    phone: "62812345678",
    status: "SUCCESS",
    payload: "ticket",
    error: "-",
    template: "ticket" as const,
  },
  {
    id: 3,
    time: "21/7/2026, 08.21.00",
    type: "INCOMING",
    phone: "62812345678",
    status: "SUCCESS",
    payload: "1",
    error: "-",
    template: "simple" as const,
  },
  {
    id: 4,
    time: "21/7/2026, 08.20.52",
    type: "OUTGOING",
    phone: "62812345678",
    status: "SUCCESS",
    payload: "attachment",
    error: "-",
    template: "attachment" as const,
  },
];

const MICRO_LABEL =
  "text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]";

export default function LogsTableSection({
  searchQuery = "",
  isFilterActive = false,
}: LogsTableSectionProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalLogs = DUMMY_LOGS.length;
  const logsPerPage = 4;

  const displayedLogs = useMemo(() => {
    let logs = [...DUMMY_LOGS];

    if (isFilterActive) {
      logs = logs.filter((log) => log.type === "INCOMING");
    }

    if (searchQuery) {
      logs = logs.filter((log) => log.phone.includes(searchQuery));
    }

    return logs;
  }, [searchQuery, isFilterActive, currentPage]);

  const startIndex = (currentPage - 1) * logsPerPage + 1;
  const endIndex = Math.min(currentPage * logsPerPage, totalLogs);
  const totalPages = Math.ceil(totalLogs / logsPerPage);

  const handlePrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  // Satu kontrak kelas untuk tombol pager (nomor halaman & panah).
  const pagerBtn = (active: boolean, disabled = false) =>
    `h-9 w-9 inline-flex items-center justify-center rounded-[4px] border text-[12px] tabular-nums transition-colors ${
      disabled
        ? "border-[var(--rule)] opacity-30 cursor-default"
        : active
          ? "border-[var(--rule-strong)] bg-[var(--canvas)] font-medium text-[var(--fg)] cursor-pointer"
          : "border-transparent text-[var(--fg-dim)] cursor-pointer hover:bg-[var(--canvas)] hover:text-[var(--fg)]"
    }`;

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-[4px] border border-[var(--rule)] bg-[var(--surface)]">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[1080px] text-left">
          <thead>
            <tr className="border-b border-[var(--rule)]">
              <th className="w-[180px] px-4 py-2.5 whitespace-nowrap">
                <span className={MICRO_LABEL}>WAKTU (WIB)</span>
              </th>
              <th className="w-[110px] px-4 py-2.5 whitespace-nowrap">
                <span className={MICRO_LABEL}>TIPE</span>
              </th>
              <th className="w-[170px] px-4 py-2.5 whitespace-nowrap">
                <span className={MICRO_LABEL}>NOMOR TELEPON</span>
              </th>
              <th className="w-[120px] px-4 py-2.5 whitespace-nowrap">
                <span className={MICRO_LABEL}>STATUS</span>
              </th>
              <th className="px-4 py-2.5">
                <span className={MICRO_LABEL}>PAYLOAD / PESAN</span>
              </th>
              <th className="w-[160px] px-4 py-2.5 whitespace-nowrap">
                <span className={MICRO_LABEL}>ERROR MESSAGE</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {displayedLogs.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-[12.5px] text-[var(--fg-dim)]"
                >
                  Tidak ada log pada filter ini.
                </td>
              </tr>
            ) : (
              displayedLogs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-[var(--rule)] transition-colors hover:bg-[var(--canvas)] last:border-b-0"
                >
                  {/* Waktu */}
                  <td className="px-4 py-3 font-mono text-[11.5px] tabular-nums whitespace-nowrap text-[var(--fg-dim)]">
                    {log.time}
                  </td>

                  {/* Tipe */}
                  <td className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.08em] whitespace-nowrap text-[var(--fg-dim)]">
                    {log.type}
                  </td>

                  {/* Nomor Telepon */}
                  <td className="px-4 py-3 text-[12.5px] tabular-nums whitespace-nowrap text-[var(--fg)]">
                    {log.phone}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 rounded-[3px] border border-[rgba(15,123,79,.18)] bg-[rgba(15,123,79,.08)] px-1.5 py-0.5 text-[10.5px] font-medium tracking-[0.02em] text-[var(--ok)]">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--ok)]" />
                      {log.status}
                    </span>
                  </td>

                  {/* Payload / Pesan */}
                  <td className="px-4 py-3 align-top">
                    {log.template === "simple" && (
                      <span className="inline-flex items-center rounded-[3px] border border-[var(--rule)] bg-[var(--canvas)] px-2 py-0.5 text-[11.5px] tabular-nums text-[var(--fg-dim)]">
                        {log.payload}
                      </span>
                    )}

                    {log.template === "ticket" && (
                      <div className="relative flex w-full max-w-[360px] flex-col gap-1 rounded-[3px] border border-[var(--rule)] bg-[var(--canvas)] p-3">
                        <div className="border-b border-[var(--rule)] pb-1.5">
                          <p className={MICRO_LABEL}>RINGKASAN TIKET</p>
                        </div>
                        <p className="text-[11.5px] leading-[1.6] text-[var(--fg-dim)]">
                          Nama: Jeje
                        </p>
                        <p className="text-[11.5px] leading-[1.6] text-[var(--fg-dim)]">
                          Unit: FISIP
                        </p>
                        <p className="text-[11.5px] leading-[1.6] text-[var(--fg-dim)]">
                          Kategori: Aplikasi / SSO / Pembuatan Akun
                        </p>
                        <p className="text-[11.5px] leading-[1.6] text-[var(--fg-dim)]">
                          Subjek: Testing alur chat
                        </p>
                        <p className="text-[11.5px] leading-[1.6] text-[var(--fg-dim)]">
                          Keluhan: test test
                        </p>
                        <svg
                          width="10"
                          height="12"
                          viewBox="0 0 10 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="pointer-events-none absolute right-2.5 bottom-2.5 h-3 w-2.5 text-[var(--fg-faint)] opacity-40"
                        >
                          <path
                            d="M3.5 9.33333C3.17917 9.33333 2.90451 9.2191 2.67604 8.99063C2.44757 8.76215 2.33333 8.4875 2.33333 8.16667V1.16667C2.33333 0.845833 2.44757 0.571181 2.67604 0.342708C2.90451 0.114236 3.17917 0 3.5 0H8.75C9.07083 0 9.34549 0.114236 9.57396 0.342708C9.80243 0.571181 9.91667 0.845833 9.91667 1.16667V8.16667C9.91667 8.4875 9.80243 8.76215 9.57396 8.99063C9.34549 9.2191 9.07083 9.33333 8.75 9.33333H3.5ZM3.5 8.16667H8.75V1.16667H3.5V8.16667ZM1.16667 11.6667C0.845833 11.6667 0.571181 11.5524 0.342708 11.324C0.114236 11.0955 0 10.8208 0 10.5V2.33333H1.16667V10.5H7.58333V11.6667H1.16667ZM3.5 8.16667V1.16667V8.16667Z"
                            fill="currentColor"
                          />
                        </svg>
                      </div>
                    )}

                    {log.template === "attachment" && (
                      <div className="flex w-full max-w-[360px] flex-col gap-2 rounded-[3px] border border-[var(--rule)] bg-[var(--canvas)] p-3">
                        <div className="flex items-center gap-2">
                          <svg
                            width="12"
                            height="8"
                            viewBox="0 0 12 8"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-2 w-3 shrink-0 text-[var(--fg-faint)]"
                          >
                            <path
                              d="M3.64583 7.29167C2.63472 7.29167 1.77431 6.93681 1.06458 6.22708C0.354861 5.51736 0 4.65694 0 3.64583C0 2.63472 0.354861 1.77431 1.06458 1.06458C1.77431 0.354861 2.63472 0 3.64583 0H9.04167C9.77083 0 10.3906 0.255208 10.901 0.765625C11.4115 1.27604 11.6667 1.89583 11.6667 2.625C11.6667 3.35417 11.4115 3.97396 10.901 4.48438C10.3906 4.99479 9.77083 5.25 9.04167 5.25H3.9375C3.49028 5.25 3.11111 5.09444 2.8 4.78333C2.48889 4.47222 2.33333 4.09306 2.33333 3.64583C2.33333 3.19861 2.48889 2.81944 2.8 2.50833C3.11111 2.19722 3.49028 2.04167 3.9375 2.04167H9.33333V3.20833H3.9375C3.81111 3.20833 3.7066 3.24965 3.62396 3.33229C3.54132 3.41493 3.5 3.51944 3.5 3.64583C3.5 3.77222 3.54132 3.87674 3.62396 3.95937C3.7066 4.04201 3.81111 4.08333 3.9375 4.08333H9.04167C9.45 4.07361 9.79514 3.93021 10.0771 3.65313C10.359 3.37604 10.5 3.03333 10.5 2.625C10.5 2.21667 10.359 1.87153 10.0771 1.58958C9.79514 1.30764 9.45 1.16667 9.04167 1.16667H3.64583C2.95556 1.15694 2.36979 1.39514 1.88854 1.88125C1.40729 2.36736 1.16667 2.95556 1.16667 3.64583C1.16667 4.32639 1.40729 4.90486 1.88854 5.38125C2.36979 5.85764 2.95556 6.10556 3.64583 6.125H9.33333V7.29167H3.64583Z"
                              fill="currentColor"
                            />
                          </svg>
                          <p className="text-[11.5px] text-[var(--fg-dim)]">
                            1 lampiran berhasil diterima.
                          </p>
                        </div>
                        <p className="text-[11.5px] leading-[1.6] font-medium text-[var(--fg)]">
                          Kirim lampiran lagi, atau balas *1* untuk Kirim Tiket.
                          Balas *0* untuk Batal.
                        </p>
                      </div>
                    )}
                  </td>

                  {/* Error Message */}
                  <td className="px-4 py-3 text-[12.5px] text-[var(--fg-dim)]">
                    {log.error}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col items-center justify-between gap-3 border-t border-[var(--rule)] px-4 py-3 sm:flex-row">
        <p className="text-[11.5px] tabular-nums text-[var(--fg-dim)]">
          Showing {startIndex}-{endIndex} of {totalLogs} logs
        </p>
        <div className="flex items-center gap-1">
          <div className={pagerBtn(false, currentPage === 1)} onClick={handlePrev}>
            <svg
              width="8"
              height="12"
              viewBox="0 0 8 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-2"
            >
              <path d="M6 12L0 6L6 0L7.4 1.4L2.8 6L7.4 10.6L6 12Z" fill="currentColor" />
            </svg>
          </div>
          <button className={pagerBtn(currentPage === 1)} onClick={() => setCurrentPage(1)}>
            1
          </button>
          <button className={pagerBtn(currentPage === 2)} onClick={() => setCurrentPage(2)}>
            2
          </button>
          <button className={pagerBtn(currentPage === 3)} onClick={() => setCurrentPage(3)}>
            3
          </button>
          <span className="px-1 text-[12px] text-[var(--fg-faint)]">...</span>
          <button
            className={pagerBtn(currentPage === totalPages)}
            onClick={() => setCurrentPage(totalPages)}
          >
            {totalPages}
          </button>
          <div
            className={pagerBtn(false, currentPage === totalPages)}
            onClick={handleNext}
          >
            <svg
              width="8"
              height="12"
              viewBox="0 0 8 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-2"
            >
              <path d="M2 12L7.4 6L2 0L0.6 1.4L4.6 6L0.6 10.6L2 12Z" fill="currentColor" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
