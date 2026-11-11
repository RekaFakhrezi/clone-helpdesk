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
    <div className="flex flex-col items-start w-full overflow-x-auto">
      {/* Table column header */}
      <div className="flex items-center border-b border-[var(--rule)] w-full min-w-[927px]">
        <div className="flex py-2.5 px-4 items-center w-52">
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)] w-fit">
            TINGKAT PRIORITAS
          </p>
        </div>
        <div className="flex py-2.5 px-4 items-center w-[258px]">
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)] w-fit">
            TARGET RESPONS (MENIT)
          </p>
        </div>
        <div className="flex py-2.5 px-4 items-center w-[294px]">
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)] w-fit">
            TARGET PENYELESAIAN (MENIT)
          </p>
        </div>
        <div className="flex py-2.5 px-4 items-center justify-end flex-1">
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)] w-fit">
            AKSI
          </p>
        </div>
      </div>

      {/* Table rows */}
      <div className="flex flex-col items-start w-full min-w-[927px]">
        {slaData.map((item) => {
          const row = formState[item.id] || {
            responseTime: String(item.responseTime),
            resolutionTime: String(item.resolutionTime),
            loading: false,
            success: false,
            error: null,
          };

          return (
            <div
              key={item.id}
              className="flex justify-between items-center gap-6 border-b border-[var(--rule)] hover:bg-[var(--canvas)] transition-colors duration-150 w-full"
            >
              <div className="flex py-3 pr-6 pl-4 items-center w-52">
                <div
                  className={`flex py-0.5 px-1.5 items-start rounded-[3px] border ${item.badgeBg} ${item.badgeTextColor} w-fit`}
                >
                  <p className="text-[10.5px] font-medium leading-4 w-fit tracking-[0.02em]">
                    {item.priority}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-[210px]">
                <div
                  className={`flex flex-col items-start shrink-0 rounded-[4px] border ${
                    row.error ? "border-[var(--danger)]" : "border-[var(--rule-strong)]"
                  } w-24 overflow-hidden`}
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
                          className="px-2 py-1.5 text-[12px] tabular-nums text-[var(--fg)] w-full bg-transparent border-none outline-none p-0 focus:ring-0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-start w-fit">
                  <p className="text-[11.5px] text-[var(--fg-faint)] w-fit">
                    ({formatHours(row.responseTime)})
                  </p>
                </div>
              </div>
              <div className="flex pl-6 items-center gap-3 w-[270px]">
                <div
                  className={`flex flex-col items-start shrink-0 rounded-[4px] border ${
                    row.error ? "border-[var(--danger)]" : "border-[var(--rule-strong)]"
                  } w-24 overflow-hidden`}
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
                          className="px-2 py-1.5 text-[12px] tabular-nums text-[var(--fg)] w-full bg-transparent border-none outline-none p-0 focus:ring-0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-start w-fit">
                  <p className="text-[11.5px] text-[var(--fg-faint)] w-fit">
                    ({formatHours(row.resolutionTime)})
                  </p>
                </div>
              </div>
              <div className="flex py-3 px-4 flex-col items-end flex-1">
                <button
                  onClick={() => handleSave(item)}
                  disabled={row.loading}
                  className="cursor-pointer text-nowrap flex h-9 px-3 justify-center items-center rounded-[4px] bg-[var(--accent)] text-[12px] font-medium text-white hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
                >
                  {row.loading
                    ? "Memproses..."
                    : row.success
                    ? "Tersimpan"
                    : "Simpan"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
