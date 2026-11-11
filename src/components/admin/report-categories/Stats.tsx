import { useLanguage } from "@/context/LanguageContext";

/**
 * Strip metrik: satu pita ber-pembatas vertikal, bukan tiga kartu.
 */
export default function Stats() {
  const { t } = useLanguage();
  const metrics = [
    {
      title: t('categories.total'),
      value: "24",
      growth: t('categories.main_count'),
    },
    {
      title: t('categories.subcategories'),
      value: "18",
      growth: t('categories.sub_count'),
    },
    {
      title: t('categories.active_status'),
      value: "22",
      growth: t('categories.total_items').replace('{count}', '42'),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 w-full border-y border-[var(--rule)]">
      {metrics.map((metric, idx) => (
        <div
          key={idx}
          className={[
            'py-5 pr-4 md:pr-6',
            idx > 0 ? 'max-md:border-t max-md:border-[var(--rule)] max-md:pt-4' : '',
            idx > 0 ? 'md:border-l md:border-[var(--rule)] md:pl-6' : 'pl-0',
          ].join(' ')}
        >
          <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--fg-faint)]">
            {metric.title}
          </div>
          <div className="mt-2 text-[26px] leading-none font-medium tabular-nums text-[var(--fg)]">
            {metric.value}
          </div>
          <div className="mt-2 text-[11.5px] text-[var(--fg-dim)]">{metric.growth}</div>
        </div>
      ))}
    </div>
  );
}
