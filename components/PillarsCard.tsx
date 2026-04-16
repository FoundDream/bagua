'use client';

interface PillarLite {
  gan: string; zhi: string;
  hidden: string[];
  shiShen: { gan: string; zhi: string[] };
  naYin: string;
}

export default function PillarsCard({
  pillars,
}: {
  pillars: { year: PillarLite; month: PillarLite; day: PillarLite; hour: PillarLite } | null;
}) {
  if (!pillars) return null;
  const cols: { key: keyof typeof pillars; label: string }[] = [
    { key: 'year', label: '年柱' },
    { key: 'month', label: '月柱' },
    { key: 'day', label: '日柱' },
    { key: 'hour', label: '时柱' },
  ];
  return (
    <div className="ink-card rounded-lg p-5">
      <div className="text-gold font-bold mb-4 tracking-widest">四柱命盘</div>
      <div className="grid grid-cols-4 gap-3 text-center">
        {cols.map(({ key, label }) => {
          const p = pillars[key];
          return (
            <div key={key} className="bg-ink/40 rounded p-3 border border-gold/15">
              <div className="text-xs text-paper/50 mb-2">{label}</div>
              <div className="text-3xl gold-text font-bold leading-none">{p.gan}</div>
              <div className="text-3xl gold-text font-bold leading-none mt-1">{p.zhi}</div>
              <div className="text-[11px] text-paper/55 mt-3 space-y-0.5">
                <div>藏：{p.hidden.join('·') || '—'}</div>
                <div>纳音：{p.naYin}</div>
                {key === 'day' ? (
                  <div className="text-cinnabar">日主</div>
                ) : (
                  <div>{p.shiShen.gan || '—'}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
