import { NextRequest } from 'next/server';
import { computeBazi, formatBaziForPrompt, type Gender } from '@/lib/bazi';
import { getAlmanac, formatAlmanacForPrompt } from '@/lib/zeri';
import { loadDailyRefs } from '@/lib/skill';
import { streamGenerate } from '@/lib/vertex';

export const runtime = 'nodejs';

interface Body {
  year: number; month: number; day: number;
  hour: number; minute: number;
  gender: Gender;
  date?: string; // YYYY-MM-DD; 默认今天
}

export async function POST(req: NextRequest) {
  let body: Body;
  try { body = await req.json(); } catch { return new Response('invalid json', { status: 400 }); }
  const { year, month, day, hour, minute, gender, date } = body;
  if (!gender) return new Response('missing gender', { status: 400 });

  const bazi = computeBazi(year, month, day, hour, minute, gender);
  const target = date ? new Date(date + 'T00:00:00') : new Date();
  const almanac = getAlmanac(target.getFullYear(), target.getMonth() + 1, target.getDate());

  const refs = await loadDailyRefs();

  const system = `你是命理师，依据下列经典节录，结合命主八字与当日干支神煞，推演当日运势：

<理论依据>
${refs}
</理论依据>

输出规范（Markdown）：
## 当日五行气场
## 与命主八字的生克
## 吉凶趋势（财、事、人、健康）
## 时辰建议（早/午/晚）
## 宜忌行为

要求：
- 每段引用本经典依据
- 控制在 600-900 字`;

  const user = `命主八字：
${formatBaziForPrompt(bazi)}

当日黄历：
${formatAlmanacForPrompt(almanac)}`;

  const stream = streamGenerate({ system, user, temperature: 0.7, maxTokens: 3000 });
  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
