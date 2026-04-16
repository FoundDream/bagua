'use client';

import { useState } from 'react';
import BirthForm, { type BirthData } from '@/components/BirthForm';
import StreamReader from '@/components/StreamReader';
import { useStream } from '@/components/useStream';

export default function DailyPage() {
  const stream = useStream();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="gold-text text-3xl font-bold mb-2">每日运势</h1>
        <p className="text-paper/60 text-sm">
          以命主八字为本，参当日干支与黄历神煞，AI 推断当日吉凶趋势与时辰宜忌。
        </p>
      </header>

      <div className="ink-card rounded-lg p-5 flex items-end gap-4">
        <label className="block">
          <div className="text-paper/60 text-xs mb-1.5">推算日期</div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-ink/60 border border-gold/25 rounded px-3 py-2 text-paper focus:outline-none focus:border-gold"
          />
        </label>
        <span className="text-paper/40 text-xs pb-3">默认今日</span>
      </div>

      <BirthForm
        loading={stream.loading}
        submitText="推算当日运势"
        onSubmit={async (d: BirthData & { question?: string }) => {
          const { question, ...rest } = d;
          await stream.run('/api/daily', { ...rest, date });
        }}
      />

      {stream.error && (
        <div className="ink-card rounded-lg p-4 border-cinnabar/40 text-cinnabar text-sm">
          {stream.error}
        </div>
      )}

      <StreamReader text={stream.text} loading={stream.loading} />
    </div>
  );
}
