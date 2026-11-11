import { ReactNode } from "react";

type CountBadgeProps = {
  /**
   * "pill"  -> dipakai pada baris kategori level-1
   *           (Aplikasi, Website dan Email, Jaringan dan Internet, Cyber Security)
   * "text"  -> dipakai pada baris sub-kategori level-2
   *           (mis. SSO, SIAP, Gentayu)
   */
  variant: "pill" | "text";
  children: ReactNode;
};

export default function CountBadge({ variant, children }: CountBadgeProps) {
  if (variant === "pill") {
    return (
      <div className="flex py-0.5 px-1.5 justify-center items-start rounded-[3px] border border-[var(--rule)] w-fit">
        <p className="text-[11px] tabular-nums text-[var(--fg-dim)] leading-4 w-fit">
          {children}
        </p>
      </div>
    );
  }

  return (
    <p className="text-[11px] tabular-nums text-[var(--fg-faint)] leading-4 w-fit">
      {children}
    </p>
  );
}
