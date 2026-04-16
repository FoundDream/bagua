import { NextRequest } from 'next/server';
import { computeBazi, formatBaziForPrompt, type Gender } from '@/lib/bazi';
import { loadBaziRefs } from '@/lib/skill';
import { streamGenerate } from '@/lib/vertex';

export const runtime = 'nodejs';

interface Body {
  year: number; month: number; day: number;
  hour: number; minute: number;
  gender: Gender;
  question?: string;
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return new Response('invalid json', { status: 400 });
  }
  const { year, month, day, hour, minute, gender, question } = body;
  if ([year, month, day, hour, minute].some((v) => typeof v !== 'number') || !gender) {
    return new Response('missing fields', { status: 400 });
  }

  const bazi = computeBazi(year, month, day, hour, minute, gender);
  const baziStr = formatBaziForPrompt(bazi);
  const refs = await loadBaziRefs();

  const system = `你是精研子平命理的命师，下列资料为你必须遵循的理论依据（节录自九部经典），请严格基于其中的法度、口诀、用神取舍原则推命，不可自创理论：

<理论依据>
${refs}
</理论依据>

输出规范：
- 使用 Markdown，章节用 ## 二级标题
- 必须包含：日主与格局、五行旺衰与喜忌、用神取法（说明依据哪部经典）、性格才华、事业财运、婚姻情感、健康注意、当前及未来三步大运分析
- 标注引用来源：句末用「（依《滴天髓》/《子平真诠》…）」
- 语言典雅但通俗，避免堆砌术语；关键术语首次出现时简要解释
- 不要免责声明，但不得给出绝对吉凶断言；以"宜""易""倾向"等措辞为主
- 不少于 1200 字`;

  const user = `请为以下命主推演八字：

${baziStr}

${question ? `命主关心的问题：${question}` : '命主未提具体问题，请进行通盘推演。'}`;

  const stream = streamGenerate({ system, user, temperature: 0.8, maxTokens: 6000 });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Bazi-Pillars': encodeURIComponent(JSON.stringify(bazi.pillars)),
    },
  });
}
