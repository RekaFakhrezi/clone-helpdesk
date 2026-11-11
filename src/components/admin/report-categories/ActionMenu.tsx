type ActionMenuProps = {
  /**
   * "dots-16" -> baris kategori level-1
   *              (Aplikasi, Website dan Email, Jaringan dan Internet, Cyber Security)
   * "dots-14" -> baris sub-kategori level-2
   *              (mis. SSO, SIAP, Gentayu)
   * "edit"    -> item level terakhir di dalam cabang "Aplikasi"
   *              (mis. Pembuatan Akun, Reset Akun, Reset OTP)
   * "dots-3"  -> item level terakhir di dalam cabang kategori lainnya
   *              (mis. Keamanan Sistem)
   */
  variant: "dots-16" | "dots-14" | "edit" | "dots-3";
};

/** Aksi baris: ikon garis 16px, warna tinta, bukan pil berwarna. */
export default function ActionMenu({ variant }: ActionMenuProps) {
  if (variant === "dots-16") {
    return (
      <div className="flex p-1.5 justify-center items-center rounded-[4px] text-[var(--fg-faint)] w-fit">
        <svg
          width="4"
          height="16"
          viewBox="0 0 4 16"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          className="flex justify-center items-start w-fit"
        >
          <circle cx="2" cy="2" r="1.6" />
          <circle cx="2" cy="8" r="1.6" />
          <circle cx="2" cy="14" r="1.6" />
        </svg>
      </div>
    );
  }

  if (variant === "dots-14") {
    return (
      <div className="flex p-1.5 justify-center items-center rounded-[4px] text-[var(--fg-faint)] w-fit">
        <svg
          width="4"
          height="14"
          viewBox="0 0 4 14"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          className="flex justify-center items-start w-fit"
        >
          <circle cx="2" cy="1.75" r="1.4" />
          <circle cx="2" cy="7" r="1.4" />
          <circle cx="2" cy="12.25" r="1.4" />
        </svg>
      </div>
    );
  }

  if (variant === "edit") {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        xmlns="http://www.w3.org/2000/svg"
        className="flex justify-center items-center text-[var(--fg-faint)] w-fit"
      >
        <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    );
  }

  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      className="flex justify-center items-center text-[var(--fg-faint)] w-fit"
    >
      <circle cx="12" cy="12" r="1"></circle>
      <circle cx="12" cy="5" r="1"></circle>
      <circle cx="12" cy="19" r="1"></circle>
    </svg>
  );
}
