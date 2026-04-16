import Link from 'next/link';

const ITEMS = [
  {
    href: '/bazi',
    title: '八字排盘',
    sub: '推演命主格局、用神、行运',
    desc: '据《渊海子平》《子平真诠》《滴天髓》《穷通宝典》《千里命稿》逐层立法，AI 输出格局、十神、五行喜忌、大运流年。',
    glyph: '命',
  },
  {
    href: '/daily',
    title: '每日运势',
    sub: '当日干支神煞 × 命主八字',
    desc: '将当日黄历（建除、宿值、宜忌）与命主四柱比对，给出当日五行气场、人事吉凶与时辰提点。',
    glyph: '日',
  },
  {
    href: '/zeri',
    title: '择日选时',
    sub: '婚嫁 / 搬迁 / 开市 / 出行',
    desc: '据《协纪辨方书》取建除十二神、二十八宿、彭祖百忌，AI 在窗口内挑出三星推荐日并定时辰。',
    glyph: '择',
  },
  {
    href: '/gua',
    title: '六十四卦',
    sub: '三钱起卦 · 体用判断',
    desc: '依《周易》卦爻辞与梅花易数体用法，得本卦、动爻、变卦，AI 解读卦象、爻辞、应期。',
    glyph: '卦',
  },
];

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="text-center pt-6">
        <div className="inline-block seal mb-4 text-xs">天人合一</div>
        <h1 className="gold-text text-5xl md:text-6xl font-bold tracking-widest mb-3">八卦</h1>
        <p className="text-paper/70 text-lg">古法立式 · AI 演算 · 经典为据</p>
        <p className="text-paper/40 text-sm mt-4 max-w-xl mx-auto">
          以渊海子平、子平真诠、滴天髓、穷通宝典、三命通会、千里命稿、神峰通考、协纪辨方书、果老星宗
          九部经典为知识基底，由 Vertex AI Gemini 进行结构化推演。
        </p>
      </section>

      <section className="grid md:grid-cols-2 gap-5">
        {ITEMS.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className="ink-card rounded-lg p-6 hover:border-gold/60 transition-all group"
          >
            <div className="flex items-start gap-5">
              <div className="text-5xl gold-text font-black w-16 text-center group-hover:scale-110 transition-transform">
                {it.glyph}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-3 mb-1">
                  <h2 className="text-xl font-bold text-paper">{it.title}</h2>
                  <span className="text-gold/70 text-xs">{it.sub}</span>
                </div>
                <p className="text-paper/60 text-sm leading-relaxed">{it.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </section>

      <section className="ink-card rounded-lg p-6">
        <h3 className="text-gold font-bold mb-3">使用说明</h3>
        <ul className="text-paper/70 text-sm space-y-2 list-disc pl-5">
          <li>所有推演均基于公开经典文本与算法生成，<strong className="text-paper">仅供文化研究与娱乐参考</strong>，不构成任何决策建议。</li>
          <li>八字推演需准确的出生时辰；不确定时辰请勿勉强填写。</li>
          <li>占卦应一事一占，心诚则灵。频繁起卦同一事，《周易》谓之"渎"，反不准。</li>
          <li>本服务由 Google Vertex AI Gemini 提供推理算力，需在服务端配置 GCP 凭证。</li>
        </ul>
      </section>
    </div>
  );
}
