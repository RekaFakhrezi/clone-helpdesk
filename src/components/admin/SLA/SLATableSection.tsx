"use client";

import React, { useState, useEffect } from "react";
import { SLAItem } from "./SLAWorkspace";

interface SLATableSectionProps {
  slaData: SLAItem[];
  onUpdateSLA?: (item: SLAItem) => void;
}

interface RowState {
  responseTime: string;
  resolutionTime: string;
  loading: boolean;
  success: boolean;
  error: string | null;
}

export default function SLATableSection({
  slaData,
  onUpdateSLA,
}: SLATableSectionProps) {
  const [formState, setFormState] = useState<Record<string, RowState>>({});

  useEffect(() => {
    const initialState: Record<string, RowState> = {};
    slaData.forEach((item) => {
      initialState[item.id] = {
        responseTime: String(item.responseTime),
        resolutionTime: String(item.resolutionTime),
        loading: false,
        success: false,
        error: null,
      };
    });
    setFormState(initialState);
  }, [slaData]);

  const handleInputChange = (
    id: string,
    field: "responseTime" | "resolutionTime",
    value: string
  ) => {
    setFormState((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
        error: null,
        success: false,
      },
    }));
  };

  const handleSave = async (item: SLAItem) => {
    const row = formState[item.id];
    if (!row) return;

    const respNum = Number(row.responseTime);
    const resNum = Number(row.resolutionTime);

    // Validasi input sederhana
    if (isNaN(respNum) || respNum <= 0 || isNaN(resNum) || resNum <= 0) {
      setFormState((prev) => ({
        ...prev,
        [item.id]: {
          ...prev[item.id],
          error: "Nilai harus berupa angka lebih dari 0",
        },
      }));
      return;
    }

    // Loading State
    setFormState((prev) => ({
      ...prev,
      [item.id]: { ...prev[item.id], loading: true, error: null },
    }));

    // Simulasi delay request API
    await new Promise((resolve) => setTimeout(resolve, 600));

    const updatedItem: SLAItem = {
      ...item,
      responseTime: respNum,
      resolutionTime: resNum,
    };

    if (onUpdateSLA) {
      onUpdateSLA(updatedItem);
    }

    // Success State
    setFormState((prev) => ({
      ...prev,
      [item.id]: { ...prev[item.id], loading: false, success: true },
    }));

    // Reset indicator success setelah 2 detik
    setTimeout(() => {
      setFormState((prev) => ({
        ...prev,
        [item.id]: { ...prev[item.id], success: false },
      }));
    }, 2000);
  };

  const formatHours = (minutesStr: string) => {
    const min = Number(minutesStr);
    if (isNaN(min) || min <= 0) return "± - jam";
    const h = min / 60;
    const formatted = Number.isInteger(h) ? h : h.toFixed(1);
    return `± ${formatted} jam`;
  };

  return (
    <div className="flex flex-col items-start -space-y-px w-full overflow-x-auto">
      {/* Table column header */}
      <div className="flex flex-col items-start border-b border-b-[#C3C6D1] bg-[#F3F3F6] w-full min-w-[927px]">
        <div className="flex justify-between items-start w-full">
          <div className="flex py-4 px-6 flex-col items-start w-52">
            <p className="text-[#43474F] font-iBMPlexSans text-[11px] font-bold leading-4 w-fit tracking-[0.05em]">
              TINGKAT PRIORITAS
            </p>
          </div>
          <div className="flex py-4 px-6 flex-col items-start w-[258px]">
            <p className="text-[#43474F] font-iBMPlexSans text-[11px] font-bold leading-4 w-fit tracking-[0.05em]">
              TARGET RESPONS &#40;MENIT&#41;
            </p>
          </div>
          <div className="flex py-4 px-6 flex-col items-start w-[294px]">
            <p className="text-[#43474F] font-iBMPlexSans text-[11px] font-bold leading-4 w-fit tracking-[0.05em]">
              TARGET PENYELESAIAN &#40;MENIT&#41;
            </p>
          </div>
          <div className="flex py-4 px-6 flex-col items-end w-[167px]">
            <p className="text-[#43474F] font-iBMPlexSans text-[11px] font-bold leading-4 w-fit tracking-[0.05em]">
              AKSI
            </p>
          </div>
        </div>
      </div>

      {/* Table rows */}
      <div className="flex flex-col items-start -space-y-px w-full min-w-[927px]">
        {slaData.map((item, index) => {
          const row = formState[item.id] || {
            responseTime: String(item.responseTime),
            resolutionTime: String(item.resolutionTime),
            loading: false,
            success: false,
            error: null,
          };

          const isLastRow = index === slaData.length - 1;

          return (
            <div
              key={item.id}
              className={`flex justify-between items-center gap-6 ${
                index > 0 ? "border-t border-t-[#C3C6D1]" : ""
              } w-full`}
            >
              <div className="flex pt-[34px] pr-6 pb-[33px] pl-6 flex-col items-start w-52">
                <div
                  className={`flex py-1 px-3 items-start rounded-sm ${item.badgeBg} w-fit`}
                >
                  <p
                    className={`${item.badgeTextColor} font-nimbusSans text-xs font-bold leading-4 w-fit tracking-[0.1em]`}
                  >
                    {item.priority}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-[210px]">
                <div
                  className={`flex py-2 px-3 flex-col items-start shrink-0 rounded-sm border ${
                    row.error ? "border-red-500" : "border-[#C3C6D1]"
                  } bg-[#FFF] w-24 overflow-hidden`}
                >
                  <div className="flex items-center w-full">
                    <div className="flex flex-col items-start w-full">
                      <div className="flex flex-col items-start w-full overflow-hidden">
                        <input
                          type="number"
                          value={row.responseTime}
                          onChange={(e) =>
                            handleInputChange(
                              item.id,
                              "responseTime",
                              e.target.value
                            )
                          }
                          className="text-[#1A1C1E] font-iBMPlexSans text-base leading-6 w-full bg-transparent border-none outline-none p-0 focus:ring-0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-start opacity-60 w-fit">
                  <p className="text-[#43474F] font-iBMPlexSans text-[13px] leading-[18px] w-fit">
                    &#40;{formatHours(row.responseTime)}&#41;
                  </p>
                </div>
              </div>
              <div className="flex pl-6 items-center gap-3 w-[270px]">
                <div
                  className={`flex py-2 px-3 flex-col items-start shrink-0 rounded-sm border ${
                    row.error ? "border-red-500" : "border-[#C3C6D1]"
                  } bg-[#FFF] w-24 overflow-hidden`}
                >
                  <div className="flex items-center w-full">
                    <div className="flex flex-col items-start w-full">
                      <div className="flex flex-col items-start w-full overflow-hidden">
                        <input
                          type="number"
                          value={row.resolutionTime}
                          onChange={(e) =>
                            handleInputChange(
                              item.id,
                              "resolutionTime",
                              e.target.value
                            )
                          }
                          className="text-[#1A1C1E] font-iBMPlexSans text-base leading-6 w-full bg-transparent border-none outline-none p-0 focus:ring-0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-start opacity-60 w-fit">
                  <p className="text-[#43474F] font-iBMPlexSans text-[13px] leading-[18px] w-fit">
                    &#40;{formatHours(row.resolutionTime)}&#41;
                  </p>
                </div>
              </div>
              <div
                className={
                  isLastRow
                    ? "flex pt-[30px] pr-6 pb-[29px] pl-6 flex-col items-end w-[167px]"
                    : "flex py-[30px] px-6 flex-col items-end w-[167px]"
                }
              >
                <button
                  onClick={() => handleSave(item)}
                  disabled={row.loading}
                  className="cursor-pointer text-nowrap flex py-2 px-6 justify-center items-center rounded-sm bg-[#001E40] w-fit disabled:opacity-50"
                >
                  <p className="text-[#FFF] font-iBMPlexSans text-xs font-semibold leading-4 w-fit tracking-[0.05em]">
                    {row.loading
                      ? "Memproses..."
                      : row.success
                      ? "Tersimpan"
                      : "Simpan"}
                  </p>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}