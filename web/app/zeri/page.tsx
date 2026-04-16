'use client';

import { useState } from 'react';
import StreamReader from '@/components/StreamReader';
import { useStream } from '@/components/useStream';

const PRESETS = ['嫁娶', '搬家入宅', '开市开业', '出行远游', '动土修造', '安葬', '签约', '祈福'];

export default function ZeriPage() {
  const stream = useStream();
  const [purpose, setPurpose] = useState('嫁娶');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [days, setDays] = useState(14);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="gold-text text-3xl font-bold mb-2">择日选时</h1>
        <p className="text-paper/60 text-sm">
          按《协纪辨方书》《三命通会》取建除十二神、二十八宿与神煞，AI 在窗口内挑选三星推荐日并定吉时。
        </p>
      </header>

      <form
        className="ink-card rounded-lg p-6 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          await stream.run('/api/zeri', { purpose, startDate, days });
        }}
      >
        <div>
          <div className="text-paper/60 text-xs mb-1.5">所求之事</div>
          <div className="flex flex-wrap gap-2 mb-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPurpose(p)}
                className={`px-3 py-1.5 rounded text-sm border transition-colors ${
                  purpose === p
                    ? 'bg-gold/20 border-gold text-gold'
                    : 'border-gold/25 text-paper/70 hover:border-gold/50'
                }`}
              >{p}</button>
            ))}
          </div>
          <input
            type="text"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="或自定义事由"
            className="w-full bg-ink/60 border border-gold/25 rounded px-3 py-2 text-paper focus:outline-none focus:border-gold"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <div className="text-paper/60 text-xs mb-1.5">起始日</div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-ink/60 border border-gold/25 rounded px-3 py-2 text-paper focus:outline-none focus:border-gold"
            />
          </label>
          <label className="block">
            <div className="text-paper/60 text-xs mb-1.5">候选天数（最多 30）</div>
            <input
              type="number" min={3} max={30} value={days}
              onChange={(e) => setDays(Number(e.target.value) || 14)}
              className="w-full bg-ink/60 border border-gold/25 rounded px-3 py-2 text-paper focus:outline-none focus:border-gold"
            />
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={stream.loading}
            className="px-8 py-2.5 bg-gold/20 hover:bg-gold/30 border border-gold text-gold font-bold rounded transition-colors disabled:opacity-40 tracking-widest"
          >
            {stream.loading ? '查算中…' : '查算吉日'}
          </button>
        </div>
      </form>

      {stream.error && (
        <div className="ink-card rounded-lg p-4 border-cinnabar/40 text-cinnabar text-sm">
          {stream.error}
        </div>
      )}

      <StreamReader text={stream.text} loading={stream.loading} />
    </div>
  );
}
