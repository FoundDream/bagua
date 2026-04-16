'use client';

import { useState } from 'react';
import BirthForm from '@/components/BirthForm';
import PillarsCard from '@/components/PillarsCard';
import StreamReader from '@/components/StreamReader';
import { useStream } from '@/components/useStream';

export default function BaziPage() {
  const stream = useStream();
  const [pillars, setPillars] = useState<any>(null);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="gold-text text-3xl font-bold mb-2">八字排盘</h1>
        <p className="text-paper/60 text-sm">
          填入公历出生年月日时与性别，系统按子平法立四柱、定大运，由 AI 依五部经典推演格局。
        </p>
      </header>

      <BirthForm
        withQuestion
        loading={stream.loading}
        onSubmit={async (d) => {
          await stream.run('/api/bazi', d);
        }}
      />

      <BaziPillarsFromHeaders headers={stream.headers} onPillars={setPillars} />
      <PillarsCard pillars={pillars} />

      {stream.error && (
        <div className="ink-card rounded-lg p-4 border-cinnabar/40 text-cinnabar text-sm">
          {stream.error}
        </div>
      )}

      <StreamReader text={stream.text} loading={stream.loading} />
    </div>
  );
}

// 从响应头解析四柱（X-Bazi-Pillars）
function BaziPillarsFromHeaders({
  headers, onPillars,
}: {
  headers: Record<string, string>;
  onPillars: (p: any) => void;
}) {
  const raw = headers['x-bazi-pillars'];
  if (raw) {
    try {
      const parsed = JSON.parse(decodeURIComponent(raw));
      // 一次性更新; React 自身 dedup
      queueMicrotask(() => onPillars(parsed));
    } catch { /* ignore */ }
  }
  return null;
}
