'use client';

import { useState } from 'react';

export interface BirthData {
  year: number; month: number; day: number;
  hour: number; minute: number;
  gender: 'male' | 'female';
}

interface Props {
  initial?: Partial<BirthData>;
  onSubmit: (data: BirthData & { question?: string }) => void;
  loading?: boolean;
  withQuestion?: boolean;
  submitText?: string;
}

export default function BirthForm({ initial, onSubmit, loading, withQuestion, submitText }: Props) {
  const [year, setYear] = useState(initial?.year ?? 1995);
  const [month, setMonth] = useState(initial?.month ?? 1);
  const [day, setDay] = useState(initial?.day ?? 1);
  const [hour, setHour] = useState(initial?.hour ?? 12);
  const [minute, setMinute] = useState(initial?.minute ?? 0);
  const [gender, setGender] = useState<'male' | 'female'>(initial?.gender ?? 'male');
  const [question, setQuestion] = useState('');

  const num = (v: string) => Number(v) || 0;

  return (
    <form
      className="ink-card rounded-lg p-6 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ year, month, day, hour, minute, gender, question: question || undefined });
      }}
    >
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Field label="出生年">
          <input type="number" min={1900} max={2100} value={year}
            onChange={(e) => setYear(num(e.target.value))} className={inputCls} />
        </Field>
        <Field label="月">
          <input type="number" min={1} max={12} value={month}
            onChange={(e) => setMonth(num(e.target.value))} className={inputCls} />
        </Field>
        <Field label="日">
          <input type="number" min={1} max={31} value={day}
            onChange={(e) => setDay(num(e.target.value))} className={inputCls} />
        </Field>
        <Field label="时（24h）">
          <input type="number" min={0} max={23} value={hour}
            onChange={(e) => setHour(num(e.target.value))} className={inputCls} />
        </Field>
        <Field label="分">
          <input type="number" min={0} max={59} value={minute}
            onChange={(e) => setMinute(num(e.target.value))} className={inputCls} />
        </Field>
        <Field label="性别">
          <div className="flex gap-2">
            {(['male', 'female'] as const).map((g) => (
              <button key={g} type="button"
                onClick={() => setGender(g)}
                className={`flex-1 py-2 rounded border text-sm transition-colors ${
                  gender === g
                    ? 'bg-gold/20 border-gold text-gold'
                    : 'border-gold/30 text-paper/60 hover:border-gold/60'
                }`}
              >{g === 'male' ? '乾造（男）' : '坤造（女）'}</button>
            ))}
          </div>
        </Field>
      </div>

      {withQuestion && (
        <Field label="所关心的问题（可选）">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={2}
            placeholder="如：未来三年事业方向、姻缘何时来…"
            className={inputCls}
          />
        </Field>
      )}

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-2.5 bg-gold/20 hover:bg-gold/30 border border-gold text-gold font-bold rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed tracking-widest"
        >
          {loading ? '推演中…' : (submitText ?? '开始推演')}
        </button>
      </div>
    </form>
  );
}

const inputCls =
  'w-full bg-ink/60 border border-gold/25 rounded px-3 py-2 text-paper focus:outline-none focus:border-gold transition-colors';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-paper/60 text-xs mb-1.5">{label}</div>
      {children}
    </label>
  );
}
