'use client';

import { useState } from 'react';
import StreamReader from '@/components/StreamReader';
import HexagramView from '@/components/HexagramView';
import { useStream } from '@/components/useStream';

interface YaoCast { value: 6 | 7 | 8 | 9; line: 0 | 1; moving: boolean; }

function castOne(): YaoCast {
  const coin = () => (Math.random() < 0.5 ? 2 : 3);
  const sum = (coin() + coin() + coin()) as 6 | 7 | 8 | 9;
  if (sum === 6) return { value: 6, line: 0, moving: true };
  if (sum === 7) return { value: 7, line: 1, moving: false };
  if (sum === 8) return { value: 8, line: 0, moving: false };
  return { value: 9, line: 1, moving: true };
}

export default function GuaPage() {
  const stream = useStream();
  const [question, setQuestion] = useState('');
  const [yaos, setYaos] = useState<YaoCast[] | null>(null);
  const [casting, setCasting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const headerResult = (() => {
    const raw = stream.headers['x-gua-result'];
    if (!raw) return null;
    try { return JSON.parse(decodeURIComponent(raw)); } catch { return null; }
  })();
  if (headerResult && !result) queueMicrotask(() => setResult(headerResult));

  const showResult = result ?? (yaos ? null : null);

  const handleCast = async () => {
    if (!question.trim()) {
      alert('请先写下所问之事');
      return;
    }
    setCasting(true);
    setResult(null);
    // 一次掷一爻动画
    const collected: YaoCast[] = [];
    for (let i = 0; i < 6; i++) {
      collected.push(castOne());
      setYaos([...collected]);
      await new Promise((r) => setTimeout(r, 320));
    }
    setCasting(false);
    await stream.run('/api/gua', {
      question,
      yaos: collected.map((y) => ({ value: y.value })),
    });
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="gold-text text-3xl font-bold mb-2">六十四卦占卜</h1>
        <p className="text-paper/60 text-sm">
          静心默念所问之事，按"起卦"以三钱法掷出本卦与变卦，AI 依《周易》卦爻辞与梅花体用法解读。
        </p>
      </header>

      <div className="ink-card rounded-lg p-6 space-y-4">
        <label className="block">
          <div className="text-paper/60 text-xs mb-1.5">所问之事</div>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={3}
            placeholder="一事一占；越具体越好。如：当前在 A、B 公司之间抉择，应选何方？"
            className="w-full bg-ink/60 border border-gold/25 rounded px-3 py-2 text-paper focus:outline-none focus:border-gold"
          />
        </label>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleCast}
            disabled={casting || stream.loading}
            className="px-8 py-2.5 bg-gold/20 hover:bg-gold/30 border border-gold text-gold font-bold rounded transition-colors disabled:opacity-40 tracking-widest"
          >
            {casting ? '掷钱中…' : stream.loading ? '解卦中…' : '起卦'}
          </button>
        </div>
      </div>

      {/* 起卦动画过程显示 */}
      {yaos && !result && (
        <div className="ink-card rounded-lg p-6">
          <div className="text-gold font-bold mb-4 tracking-widest">{casting ? '正在起卦…' : '起卦完成，等待解读'}</div>
          <div className="space-y-2 max-w-[14rem] mx-auto">
            {[...yaos].reverse().map((y, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-paper/40 text-xs w-8">{['上','五','四','三','二','初'][i]}爻</span>
                <div className={y.line ? 'yao-yang' : 'yao-yin'} />
                {y.moving && <span className="text-cinnabar text-xs">●</span>}
              </div>
            ))}
            {Array.from({ length: 6 - yaos.length }).map((_, i) => (
              <div key={'p' + i} className="flex items-center gap-3 opacity-30">
                <span className="text-paper/40 text-xs w-8">—</span>
                <div className="h-1.5 w-full bg-paper/10" />
              </div>
            ))}
          </div>
        </div>
      )}

      {showResult && (
        <HexagramView
          yaos={showResult.yaos}
          ben={showResult.ben}
          bian={showResult.bian}
          moving={showResult.moving}
        />
      )}

      {stream.error && (
        <div className="ink-card rounded-lg p-4 border-cinnabar/40 text-cinnabar text-sm">
          {stream.error}
        </div>
      )}

      <StreamReader text={stream.text} loading={stream.loading} />
    </div>
  );
}
