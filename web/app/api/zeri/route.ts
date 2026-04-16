import { NextRequest } from 'next/server';
import { getAlmanac, formatAlmanacForPrompt } from '@/lib/zeri';
import { loadZeriRefs } from '@/lib/skill';
import { streamGenerate } from '@/lib/vertex';

export const runtime = 'nodejs';

interface Body {
  startDate: string;     // YYYY-MM-DD
  days?: number;         // 候选天数 默认 14
  purpose: string;       // 目的：嫁娶 / 搬家 / 开市 / 安葬 / 出行 ...
  /** 可选：当事人八字（年月日时性别），用于避开冲日 */
  bazi?: { year: number; month: number; day: number; hour: number; minute: number; gender: 'male'|'female' };
}

export async function POST(req: NextRequest) {
  let body: Body;
  try { body = await req.json(); } catch { return new Response('invalid json', { status: 400 }); }
  const { startDate, purpose } = body;
  const days = Math.min(body.days ?? 14, 30);
  if (!startDate || !purpose) return new Response('missing fields', { status: 400 });

  const start = new Date(startDate + 'T00:00:00');
  const candidates = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(start.getTime() + i * 86400_000);
    candidates.push(getAlmanac(d.getFullYear(), d.getMonth() + 1, d.getDate()));
  }

  const refs = await loadZeriRefs();
  const system = `你是择日师，严格依据《协纪辨方书》《三命通会》的法度。下列为节录原文：

<理论依据>
${refs}
</理论依据>

输出规范（Markdown）：
## 择日要点（针对所求之事）
## 候选日筛选表
| 日期 | 干支 | 建除 | 二十八宿 | 适配评分 | 短评 |
（评分 1-5 星，必须给出理由）
## 推荐三日（首选 / 备选 / 备选）
对每个推荐日：吉时建议（用十二时辰）、宜做之事、需避之事
## 综合判断

要求：
- 必须避开"日忌""彭祖百忌"中与所求事直接冲突的项
- 必须考量"建除十二神"对所求事的吉凶
- 引用经典依据`;

  const candidateText = candidates.map(formatAlmanacForPrompt).join('\n---\n');
  const baziText = body.bazi
    ? `当事人日柱干支须避冲：${body.bazi.year}-${body.bazi.month}-${body.bazi.day} ${body.bazi.hour}:${body.bazi.minute} ${body.bazi.gender}`
    : '';

  const user = `所求之事：${purpose}
${baziText}

候选日范围（共 ${days} 天）：
${candidateText}`;

  const stream = streamGenerate({ system, user, temperature: 0.6, maxTokens: 5000 });
  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
