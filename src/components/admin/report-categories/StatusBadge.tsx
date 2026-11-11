import { ReactNode } from "react";

type StatusBadgeProps = {
  /**
   * "dot"     -> baris kategori level-1
   *              (Aplikasi, Website dan Email, Jaringan dan Internet, Cyber Security)
   * "button"  -> baris sub-kategori level-2
   *              (mis. SSO, SIAP, Gentayu)
   * "text-18" -> item level terakhir di dalam cabang "Aplikasi"
   *              (mis. Pembuatan Akun, Reset Akun, Reset OTP)
   * "text-5"  -> item level terakhir di dalam cabang kategori lainnya
   *              (mis. Keamanan Sistem)
   */
  variant: "dot" | "button" | "text-18" | "text-5";
  children: ReactNode;
};

export default function StatusBadge({ variant, children }: StatusBadgeProps) {
  if (variant === "dot") {
    return (
      <div className="flex py-0.5 px-1.5 items-center gap-1.5 rounded-[3px] bg-[rgba(15,123,79,.08)] border border-[rgba(15,123,79,.18)] w-fit">
        <div className="rounded-full bg-[var(--ok)] w-1.5 h-1.5"></div>
        <p className="text-[var(--ok)] text-[10.5px] font-medium leading-4 w-fit">
          {children}
        </p>
      </div>
    );
  }

  if (variant === "button") {
    return (
      <button className="cursor-pointer text-nowrap flex py-0.5 px-1.5 justify-center items-center rounded-[3px] bg-[rgba(15,123,79,.08)] border border-[rgba(15,123,79,.18)] w-fit">
        <p className="text-[var(--ok)] text-[10.5px] font-medium leading-4 w-fit">
          {children}
        </p>
      </button>
    );
  }

  if (variant === "text-18") {
    return (
      <p className="text-[var(--ok)] text-[10.5px] font-medium leading-[18px] w-fit">
        {children}
      </p>
    );
  }

  return (
    <p className="text-[var(--ok)] text-[10.5px] font-medium leading-5 w-fit">
      {children}
    </p>
  );
}
