import { NextRequest } from 'next/server';
import { castHexagram, formatGuaForPrompt, lookupHexagram } from '@/lib/gua';
import { loadGuaRefs } from '@/lib/skill';
import { streamGenerate } from '@/lib/vertex';

export const runtime = 'nodejs';

interface Body {
  question: string;
  /** 可选：客户端提供已起好的卦（前端动画后回传），格式 yaos[6] {value:6|7|8|9} */
  yaos?: { value: 6 | 7 | 8 | 9 }[];
}

export async function POST(req: NextRequest) {
  let body: Body;
  try { body = await req.json(); } catch { return new Response('invalid json', { status: 400 }); }
  const question = (body.question ?? '').trim();
  if (!question) return new Response('missing question', { status: 400 });

  // 若客户端没传，则服务端起卦
  let cast;
  if (body.yaos && body.yaos.length === 6) {
    const ys = body.yaos.map((y) => {
      const v = y.value;
      if (v === 6) return { value: 6 as const, line: 0 as const, moving: true };
      if (v === 7) return { value: 7 as const, line: 1 as const, moving: false };
      if (v === 8) return { value: 8 as const, line: 0 as const, moving: false };
      return { value: 9 as const, line: 1 as const, moving: true };
    });
    const ben = ys.map((y) => y.line);
    const movingIdx = ys.map((y, i) => (y.moving ? i + 1 : 0)).filter((x) => x > 0);
    const benGua = lookupHexagram(ben);
    const bianGua = movingIdx.length
      ? lookupHexagram(ben.map((l, i) => (ys[i].moving ? l ^ 1 : l)))
      : null;
    cast = { yaos: ys, benGua, bianGua, movingLines: movingIdx };
  } else {
    cast = castHexagram();
  }

  const refs = await loadGuaRefs();

  const system = `你是精通《周易》卦爻辞与象数体例的卦师。下列为相关命理经典节录（旁参）：

<理论依据（旁参）>
${refs}
</理论依据（旁参）>

主依据：《周易》本经、《十翼》、京房纳甲、邵康节《梅花易数》体用之法。

输出规范（Markdown）：
## 卦象总断
解释本卦卦名、卦象、卦德、所主之事
## 体用与五行生克
按梅花易数法，确定体卦、用卦，判断五行生克吉凶
## 爻辞解读
若有动爻：逐条引爻辞并解释；若无动爻：以本卦卦辞为主
## 变卦走向
若有变卦：说明事情发展趋势；无则说明结果稳定
## 针对所问之事的判断
明确给出"宜进/宜守/宜变/宜止"的方向
## 应期推断
结合卦象五行、动爻位次，给出大致应期（日/月/季）

要求：
- 引用《周易》原文卦爻辞
- 体用法须明示推导过程
- 800-1200 字`;

  const user = formatGuaForPrompt(question, cast);

  const stream = streamGenerate({ system, user, temperature: 0.85, maxTokens: 5000 });
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Gua-Result': encodeURIComponent(JSON.stringify({
        ben: cast.benGua, bian: cast.bianGua, moving: cast.movingLines,
        yaos: cast.yaos.map((y) => ({ value: y.value, line: y.line, moving: y.moving })),
      })),
    },
  });
}
