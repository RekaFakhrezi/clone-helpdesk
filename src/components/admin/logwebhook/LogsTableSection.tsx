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

  return (
    <div className="flex flex-col items-start rounded-xl border border-[#E5E7EB] w-full overflow-x-auto">
      {/* min-w disesuaikan agar proporsional dengan kolom Payload yang diperlebar */}
      <div className="flex flex-col items-start w-full min-w-[1100px]">
        <div className="flex flex-col items-start -space-y-px w-full">
          {/* Table Header */}
          <div className="flex justify-between items-start border-b border-b-[#E5E7EB] bg-[#F9FAFB] w-full">
            <div className="flex py-4 px-6 flex-col items-start w-[180px]">
              <p className="text-[#000] font-nimbusSans text-base font-bold leading-6 w-fit">
                WAKTU &#40;WIB&#41;
              </p>
            </div>
            <div className="flex py-4 px-6 flex-col items-start w-[110px]">
              <p className="text-[#000] font-nimbusSans text-base font-bold leading-6 w-fit">
                TIPE
              </p>
            </div>
            <div className="flex py-4 px-6 flex-col items-start w-[170px]">
              <p className="text-[#000] font-nimbusSans text-base font-bold leading-6 w-fit">
                NOMOR TELEPON
              </p>
            </div>
            <div className="flex py-4 px-6 flex-col items-start w-[120px]">
              <p className="text-[#000] font-nimbusSans text-base font-bold leading-6 w-fit">
                STATUS
              </p>
            </div>
            {/* Kolom Payload / Pesan dibuat lebih lebar */}
            <div className="flex py-4 px-6 flex-col items-start w-[360px]">
              <p className="text-[#000] font-nimbusSans text-base font-bold leading-6 w-fit">
                PAYLOAD &#x2F; PESAN
              </p>
            </div>
            <div className="flex py-4 px-6 flex-col items-start w-[160px]">
              <p className="text-[#000] font-nimbusSans text-base font-bold leading-6 w-fit">
                ERROR MESSAGE
              </p>
            </div>
          </div>

          {/* Table Body */}
          <div className="flex flex-col items-start w-full">
            {displayedLogs.map((log, index) => {
              const isFirst = index === 0;
              const borderClass = !isFirst ? "border-t border-t-[#E5E7EB]" : "";

              return (
                <div
                  key={log.id}
                  className={`flex justify-between items-start w-full py-5 px-0 ${borderClass}`}
                >
                  {/* Waktu */}
                  <div className="flex px-6 flex-col items-start w-[180px]">
                    <p className="text-[#000] font-nimbusSans text-base leading-6 w-fit">
                      {log.time}
                    </p>
                  </div>

                  {/* Tipe */}
                  <div className="flex px-6 flex-col items-start w-[110px]">
                    <p className="text-[#000] font-nimbusSans text-[10px] font-bold leading-[15px] w-fit tracking-[0.025em]">
                      {log.type}
                    </p>
                  </div>

                  {/* Nomor Telepon */}
                  <div className="flex px-6 flex-col items-start w-[170px]">
                    <p className="text-[#000] font-nimbusSans text-base leading-6 w-fit">
                      {log.phone}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="flex px-6 flex-col items-start w-[120px]">
                    <div className="flex py-1 px-2 items-center gap-1.5 rounded bg-[#E2F5EA] w-fit">
                      <div className="shrink-0 rounded-full bg-[#00A35C] w-1.5 h-1.5"></div>
                      <p className="text-[#006B3E] font-nimbusSans text-[10px] font-bold leading-[15px] w-fit tracking-[0.025em]">
                        {log.status}
                      </p>
                    </div>
                  </div>

                  {/* Payload / Pesan (Lebih Lebar) */}
                  <div className="flex px-6 flex-col items-start w-[360px]">
                    {log.template === "simple" && (
                      <div className="flex p-2 flex-col items-start rounded border border-[#E5E7EB] w-full">
                        <p className="text-[#000] font-nimbusSans text-base leading-6 w-fit">
                          {log.payload}
                        </p>
                      </div>
                    )}

                    {log.template === "ticket" && (
                      <div className="flex p-3 flex-col items-start rounded-lg border border-[#E5E7EB] bg-[rgba(255,255,255,0.00)] shadow-[01px2px0rgba(0,0,0,0.05)] w-full relative">
                        <div className="flex flex-col items-start gap-1 w-full">
                          <div className="flex pb-1 flex-col items-start w-full">
                            <div className="flex pb-1 flex-col items-start border-b border-b-[#E5E7EB] w-full">
                              <p className="text-[#000] font-nimbusSans text-base font-bold leading-[26px] w-fit">
                                RINGKASAN TIKET
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-start w-full">
                            <p className="text-[#000] font-nimbusSans text-base font-medium leading-[26px] w-full">
                              Nama: Jeje
                            </p>
                          </div>
                          <div className="flex flex-col items-start w-full">
                            <p className="text-[#000] font-nimbusSans text-base font-medium leading-[26px] w-full">
                              Unit: FISIP
                            </p>
                          </div>
                          <div className="flex flex-col items-start w-full">
                            <p className="text-[#000] font-nimbusSans text-base font-medium leading-[26px] w-full">
                              Kategori: Aplikasi &#x2F; SSO &#x2F; Pembuatan Akun
                            </p>
                          </div>
                          <div className="flex flex-col items-start w-full">
                            <p className="text-[#000] font-nimbusSans text-base font-medium leading-[26px] w-full">
                              Subjek: Testing alur chat
                            </p>
                          </div>
                          <div className="flex flex-col items-start w-full">
                            <p className="text-[#000] font-nimbusSans text-base font-medium leading-[26px] w-full">
                              Keluhan: test test
                            </p>
                          </div>
                        </div>
                        <svg
                          width="10"
                          height="12"
                          viewBox="0 0 10 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="flex flex-col items-start absolute right-[9px] bottom-[9px] opacity-20 w-fit "
                        >
                          <g opacity="0.2">
                            <path
                              d="M3.5 9.33333C3.17917 9.33333 2.90451 9.2191 2.67604 8.99063C2.44757 8.76215 2.33333 8.4875 2.33333 8.16667V1.16667C2.33333 0.845833 2.44757 0.571181 2.67604 0.342708C2.90451 0.114236 3.17917 0 3.5 0H8.75C9.07083 0 9.34549 0.114236 9.57396 0.342708C9.80243 0.571181 9.91667 0.845833 9.91667 1.16667V8.16667C9.91667 8.4875 9.80243 8.76215 9.57396 8.99063C9.34549 9.2191 9.07083 9.33333 8.75 9.33333H3.5ZM3.5 8.16667H8.75V1.16667H3.5V8.16667ZM1.16667 11.6667C0.845833 11.6667 0.571181 11.5524 0.342708 11.324C0.114236 11.0955 0 10.8208 0 10.5V2.33333H1.16667V10.5H7.58333V11.6667H1.16667ZM3.5 8.16667V1.16667V8.16667Z"
                              fill="black"
                            />
                          </g>
                        </svg>
                      </div>
                    )}

                    {log.template === "attachment" && (
                      <div className="flex p-3 flex-col items-start gap-2 rounded-lg border border-[#E5E7EB] w-full">
                        <div className="flex items-center gap-2 w-full">
                          <svg
                            width="12"
                            height="8"
                            viewBox="0 0 12 8"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="flex flex-col items-start w-fit "
                          >
                            <path
                              d="M3.64583 7.29167C2.63472 7.29167 1.77431 6.93681 1.06458 6.22708C0.354861 5.51736 0 4.65694 0 3.64583C0 2.63472 0.354861 1.77431 1.06458 1.06458C1.77431 0.354861 2.63472 0 3.64583 0H9.04167C9.77083 0 10.3906 0.255208 10.901 0.765625C11.4115 1.27604 11.6667 1.89583 11.6667 2.625C11.6667 3.35417 11.4115 3.97396 10.901 4.48438C10.3906 4.99479 9.77083 5.25 9.04167 5.25H3.9375C3.49028 5.25 3.11111 5.09444 2.8 4.78333C2.48889 4.47222 2.33333 4.09306 2.33333 3.64583C2.33333 3.19861 2.48889 2.81944 2.8 2.50833C3.11111 2.19722 3.49028 2.04167 3.9375 2.04167H9.33333V3.20833H3.9375C3.81111 3.20833 3.7066 3.24965 3.62396 3.33229C3.54132 3.41493 3.5 3.51944 3.5 3.64583C3.5 3.77222 3.54132 3.87674 3.62396 3.95937C3.7066 4.04201 3.81111 4.08333 3.9375 4.08333H9.04167C9.45 4.07361 9.79514 3.93021 10.0771 3.65313C10.359 3.37604 10.5 3.03333 10.5 2.625C10.5 2.21667 10.359 1.87153 10.0771 1.58958C9.79514 1.30764 9.45 1.16667 9.04167 1.16667H3.64583C2.95556 1.15694 2.36979 1.39514 1.88854 1.88125C1.40729 2.36736 1.16667 2.95556 1.16667 3.64583C1.16667 4.32639 1.40729 4.90486 1.88854 5.38125C2.36979 5.85764 2.95556 6.10556 3.64583 6.125H9.33333V7.29167H3.64583Z"
                              fill="black"
                            />
                          </svg>
                          <p className="text-[#000] font-nimbusSans text-base font-medium leading-[26px] w-fit">
                            1 lampiran berhasil diterima.
                          </p>
                        </div>
                        <p className="text-[#000] font-nimbusSans text-base font-bold leading-[26px] w-fit">
                          Kirim lampiran lagi, atau balas *1* untuk Kirim Tiket.
                          Balas *0* untuk Batal.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Error Message */}
                  <div className="flex px-6 flex-col items-start w-[160px]">
                    <p className="text-[#000] font-nimbusSans text-base leading-6 w-fit">
                      {log.error}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="flex py-4 px-6 justify-between items-center border-t border-t-[#E5E7EB] bg-[#F9FAFB] w-full min-w-[1100px]">
        <div className="flex flex-col items-start w-fit">
          <p className="text-[#000] font-nimbusSans text-base leading-6 w-fit">
            Showing {startIndex}-{endIndex} of {totalLogs} logs
          </p>
        </div>
        <div className="flex items-center gap-2 w-fit">
          <div
            className={`flex pt-2 pr-2 pb-4 pl-2 flex-col justify-center items-center rounded-lg w-fit ${
              currentPage === 1 ? "opacity-30 cursor-default" : "cursor-pointer"
            }`}
            onClick={handlePrev}
          >
            <svg
              width="8"
              height="12"
              viewBox="0 0 8 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="flex justify-center items-start w-fit "
            >
              <path
                d="M6 12L0 6L6 0L7.4 1.4L2.8 6L7.4 10.6L6 12Z"
                fill="black"
              />
            </svg>
          </div>
          <button
            className="cursor-pointer text-nowrap flex flex-col justify-center items-center rounded-lg w-8 h-8"
            onClick={() => setCurrentPage(1)}
          >
            <p
              className={`text-[#000] font-nimbusSans text-xs ${
                currentPage === 1 ? "font-bold" : ""
              } leading-4 w-fit`}
            >
              1
            </p>
          </button>
          <button
            className="cursor-pointer text-nowrap flex flex-col justify-center items-center rounded-lg w-8 h-8"
            onClick={() => setCurrentPage(2)}
          >
            <p
              className={`text-[#000] font-nimbusSans text-xs ${
                currentPage === 2 ? "font-bold" : ""
              } leading-4 w-fit`}
            >
              2
            </p>
          </button>
          <button
            className="cursor-pointer text-nowrap flex flex-col justify-center items-center rounded-lg w-8 h-8"
            onClick={() => setCurrentPage(3)}
          >
            <p
              className={`text-[#000] font-nimbusSans text-xs ${
                currentPage === 3 ? "font-bold" : ""
              } leading-4 w-fit`}
            >
              3
            </p>
          </button>
          <div className="flex py-0 px-1 flex-col items-start w-fit">
            <p className="text-[#000] font-nimbusSans text-base leading-6 w-fit">
              ...
            </p>
          </div>
          <button
            className="cursor-pointer text-nowrap flex flex-col justify-center items-center rounded-lg w-8 h-8"
            onClick={() => setCurrentPage(totalPages)}
          >
            <p
              className={`text-[#000] font-nimbusSans text-xs ${
                currentPage === totalPages ? "font-bold" : ""
              } leading-4 w-fit`}
            >
              {totalPages}
            </p>
          </button>
          <div
            className={`flex pt-2 pr-2 pb-4 pl-2 flex-col justify-center items-center rounded-lg w-fit ${
              currentPage === totalPages
                ? "opacity-30 cursor-default"
                : "cursor-pointer"
            }`}
            onClick={handleNext}
          >
            <svg
              width="8"
              height="12"
              viewBox="0 0 8 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="flex justify-center items-start w-fit "
            >
              <path
                d="M4.6 6L0 1.4L1.4 0L7.4 6L1.4 12L0 10.6L4.6 6Z"
                fill="black"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}