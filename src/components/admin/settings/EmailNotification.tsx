import React, { useState } from "react";

interface EmailNotificationProps {
  initialEmail?: string;
  onSaveEmail: (email: string) => void;
}

export default function EmailNotification({ initialEmail = "helpdesk@undip.ac.id", onSaveEmail }: EmailNotificationProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [email, setEmail] = useState(initialEmail);

  const handleToggleEdit = () => {
    if (isEditing && onSaveEmail) {
      onSaveEmail(email);
    }
    setIsEditing(!isEditing);
  };

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-[4px] border border-[var(--rule)] bg-[var(--surface)]">
      <div className="flex items-center gap-2 border-b border-[var(--rule)] px-5 py-3.5">
        <svg
          width="16"
          height="13"
          viewBox="0 0 20 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 text-[var(--accent)]"
          aria-hidden="true"
        >
          <path
            d="M2 16C1.45 16 0.979167 15.8042 0.5875 15.4125C0.195833 15.0208 0 14.55 0 14V2C0 1.45 0.195833 0.979167 0.5875 0.5875C0.979167 0.195833 1.45 0 2 0H18C18.55 0 19.0208 0.195833 19.4125 0.5875C19.8042 0.979167 20 1.45 20 2V14C20 14.55 19.8042 15.0208 19.4125 15.4125C19.0208 15.8042 18.55 16 18 16H2ZM10 9L2 4V14H18V4L10 9ZM10 7L18 2H2L10 7ZM2 4V2V4V14V4Z"
            fill="currentColor"
          />
        </svg>
        <h2 className="text-[13px] font-medium text-[var(--fg)]">Email Notifikasi</h2>
      </div>

      <div className="flex flex-col gap-4 p-5">
        <div className="flex items-center gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!isEditing}
            className={`h-9 w-full rounded-[4px] border bg-transparent px-3 text-[12.5px] text-[var(--fg)] outline-none transition-colors disabled:text-[var(--fg-dim)] focus:border-[var(--accent)] ${
              isEditing ? "border-[var(--accent)]" : "border-[var(--rule-strong)]"
            }`}
          />
          <button
            type="button"
            onClick={handleToggleEdit}
            className={`h-9 shrink-0 cursor-pointer rounded-[4px] border px-3.5 text-[12px] font-medium transition-colors ${
              isEditing
                ? "border-[var(--accent)] bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]"
                : "border-[var(--rule-strong)] text-[var(--fg-dim)] hover:bg-[var(--canvas)]"
            }`}
          >
            {isEditing ? "Simpan" : "Ubah"}
          </button>
        </div>

        <p className="text-[11.5px] leading-[1.5] text-[var(--fg-faint)]">
          Alamat email utama untuk pengiriman notifikasi tiket sistem.
        </p>
      </div>
    </div>
  );
}
