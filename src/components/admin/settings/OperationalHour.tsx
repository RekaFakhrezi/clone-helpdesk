import React, { useState } from "react";

export interface DaySchedule {
  type: "dropdown" | "manual" | "off";
  start: string;
  end: string;
  manualText: string;
}

interface OperationalHourProps {
  weekday: DaySchedule;
  weekend: DaySchedule;
  onChangeWeekday: (updated: DaySchedule) => void;
  onChangeWeekend: (updated: DaySchedule) => void;
}

const MICRO_LABEL =
  "text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]";

const GHOST_BUTTON =
  "h-9 cursor-pointer rounded-[4px] border border-[var(--rule-strong)] px-2.5 text-[12px] font-medium text-[var(--fg-dim)] transition-colors hover:bg-[var(--canvas)]";

const FIELD =
  "h-9 cursor-pointer rounded-[4px] border border-[var(--rule-strong)] bg-transparent px-2 text-[12.5px] tabular-nums text-[var(--fg)] outline-none transition-colors focus:border-[var(--accent)]";

export default function OperationalHour({
  weekday,
  weekend,
  onChangeWeekday,
  onChangeWeekend,
}: OperationalHourProps) {
  // Menghasilkan array jam 24 format "00:00" s/d "23:00"
  const hoursList = Array.from({ length: 24 }, (_, i) => {
    const hour = i < 10 ? `0${i}` : `${i}`;
    return `${hour}:00`;
  });

  const renderScheduleInput = (
    label: string,
    schedule: DaySchedule,
    onChange: (updated: DaySchedule) => void
  ) => {
    return (
      <div className="flex flex-col gap-3 border-b border-[var(--rule)] py-4 first:pt-0 last:border-b-0 last:pb-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className={MICRO_LABEL}>{label}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                onChange({ ...schedule, type: schedule.type === "manual" ? "dropdown" : "manual" })
              }
              className={GHOST_BUTTON}
            >
              {schedule.type === "manual" ? "Mode Dropdown" : "Ketik Manual"}
            </button>
            <button
              type="button"
              onClick={() =>
                onChange({ ...schedule, type: schedule.type === "off" ? "dropdown" : "off" })
              }
              className={`h-9 cursor-pointer rounded-[4px] border px-2.5 text-[12px] font-medium transition-colors ${
                schedule.type === "off"
                  ? "border-[var(--danger)] bg-[var(--danger)] text-white"
                  : "border-[var(--rule-strong)] text-[var(--fg-dim)] hover:bg-[var(--canvas)]"
              }`}
            >
              {schedule.type === "off" ? "Status: Libur" : "Set Libur"}
            </button>
          </div>
        </div>

        {schedule.type === "off" && (
          <div className="rounded-[4px] border border-[var(--rule)] bg-[var(--canvas)] px-3 py-2 text-[11.5px] text-[var(--danger)]">
            Status: Libur (Layanan Nonaktif)
          </div>
        )}

        {schedule.type === "dropdown" && (
          <div className="flex items-center gap-2">
            <select
              value={schedule.start}
              onChange={(e) => onChange({ ...schedule, start: e.target.value })}
              className={FIELD}
            >
              {hoursList.map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
            <span className="text-[12.5px] text-[var(--fg-faint)]">-</span>
            <select
              value={schedule.end}
              onChange={(e) => onChange({ ...schedule, end: e.target.value })}
              className={FIELD}
            >
              {hoursList.map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
        )}

        {schedule.type === "manual" && (
          <input
            type="text"
            value={schedule.manualText}
            onChange={(e) => onChange({ ...schedule, manualText: e.target.value })}
            placeholder="Contoh: 08:00 - 17:00 WIB / 24 Jam"
            className="h-9 w-full rounded-[4px] border border-[var(--rule-strong)] bg-transparent px-3 text-[12.5px] text-[var(--fg)] outline-none transition-colors placeholder:text-[var(--fg-faint)] focus:border-[var(--accent)]"
          />
        )}
      </div>
    );
  };

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-[4px] border border-[var(--rule)] bg-[var(--surface)]">
      <div className="flex items-center gap-2 border-b border-[var(--rule)] px-5 py-3.5">
        <svg
          width="16"
          height="16"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 text-[var(--accent)]"
          aria-hidden="true"
        >
          <path d="M13.3 14.7L14.7 13.3L11 9.6V5H9V10.4L13.3 14.7ZM10 20C8.61667 20 7.31667 19.7375 6.1 19.2125C4.88333 18.6875 3.825 17.975 2.925 17.075C2.025 16.175 1.3125 15.1167 0.7875 13.9C0.2625 12.6833 0 11.3833 0 10C0 8.61667 0.2625 7.31667 0.7875 6.1C1.3125 4.88333 2.025 3.825 2.925 2.925C3.825 2.025 4.88333 1.3125 6.1 0.7875C7.31667 0.2625 8.61667 0 10 0C11.3833 0 12.6833 0.2625 13.9 0.7875C15.1167 1.3125 16.175 2.025 17.075 2.925C17.975 3.825 18.6875 4.88333 19.2125 6.1C19.7375 7.31667 20 8.61667 20 10C20 11.3833 19.7375 12.6833 19.2125 13.9C18.6875 15.1167 17.975 16.175 17.075 17.075C16.175 17.975 15.1167 18.6875 13.9 19.2125C12.6833 19.7375 11.3833 20 10 20ZM10 18C12.2167 18 14.1042 17.2208 15.6625 15.6625C17.2208 14.1042 18 12.2167 18 10C18 7.78333 17.2208 5.89583 15.6625 4.3375C14.1042 2.77917 12.2167 2 10 2C7.78333 2 5.89583 2.77917 4.3375 4.3375C2.77917 5.89583 2 7.78333 2 10C2 12.2167 2.77917 14.1042 4.3375 15.6625C5.89583 17.2208 7.78333 18 10 18Z" fill="currentColor"/>
        </svg>
        <h2 className="text-[13px] font-medium text-[var(--fg)]">Jam Operasional</h2>
      </div>

      <div className="flex flex-col p-5">
        {renderScheduleInput("Senin - Jumat", weekday, onChangeWeekday)}
        {renderScheduleInput("Sabtu - Minggu", weekend, onChangeWeekend)}
      </div>
    </div>
  );
}
