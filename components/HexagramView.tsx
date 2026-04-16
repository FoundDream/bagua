'use client';

interface YaoData { value: 6 | 7 | 8 | 9; line: 0 | 1; moving: boolean; }
interface GuaInfo { no: number; name: string; symbol: string; judgement: string; image: string; }

export default function HexagramView({
  yaos, ben, bian, moving,
}: {
  yaos: YaoData[]; ben: GuaInfo; bian: GuaInfo | null; moving: number[];
}) {
  return (
    <div className="ink-card rounded-lg p-6">
      <div className="text-gold font-bold mb-4 tracking-widest">起卦结果</div>
      <div className="grid md:grid-cols-2 gap-6">
        <GuaPanel title="本卦" gua={ben} yaos={yaos} showMoving />
        {bian ? (
          <GuaPanel
            title="变卦"
            gua={bian}
            yaos={yaos.map((y) => ({ ...y, line: y.moving ? ((y.line ^ 1) as 0|1) : y.line, moving: false }))}
          />
        ) : (
          <div className="text-paper/40 text-sm flex items-center justify-center text-center px-6">
            无动爻 · 静卦<br />以本卦卦辞为定
          </div>
        )}
      </div>
      {moving.length > 0 && (
        <div className="mt-4 text-paper/70 text-sm">
          动爻：<span className="text-cinnabar">
            {moving.map((n) => ['初','二','三','四','五','上'][n - 1] + '爻').join('、')}
          </span>
        </div>
      )}
    </div>
  );
}

function GuaPanel({ title, gua, yaos, showMoving }: {
  title: string; gua: GuaInfo; yaos: YaoData[]; showMoving?: boolean;
}) {
  return (
    <div>
      <div className="text-paper/60 text-xs mb-2">{title}</div>
      <div className="text-2xl gold-text font-bold mb-1">第 {gua.no} 卦 · {gua.name}</div>
      <div className="text-paper/50 text-xs mb-3">{gua.symbol}</div>
      <div className="space-y-2 mb-4 max-w-[14rem]">
        {[...yaos].reverse().map((y, i) => {
          const yaoIdx = 5 - i; // 上爻 → 初爻
          const labels = ['初','二','三','四','五','上'];
          return (
            <div key={i} className="flex items-center gap-3">
              <span className="text-paper/40 text-xs w-8">{labels[yaoIdx]}爻</span>
              <div className={y.line ? 'yao-yang' : 'yao-yin'} />
              {showMoving && y.moving && <span className="text-cinnabar text-xs">●</span>}
            </div>
          );
        })}
      </div>
      <div className="text-paper/70 text-sm leading-relaxed">
        <div><span className="text-gold/80">卦辞：</span>{gua.judgement}</div>
        <div className="mt-1"><span className="text-gold/80">大象：</span>{gua.image}</div>
      </div>
    </div>
  );
}
