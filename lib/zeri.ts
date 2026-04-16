import { Solar } from 'lunar-typescript';

export interface DayAlmanac {
  solar: string;
  lunar: string;
  ganZhi: { year: string; month: string; day: string };
  jianChu: string;          // 建除十二神
  xiu: string;              // 二十八宿
  zhiXing: string;          // 值日星
  yi: string[];             // 宜
  ji: string[];             // 忌
  jiShen: string[];         // 吉神宜趋
  xiongSha: string[];       // 凶煞宜忌
  pengZuGan: string;        // 彭祖百忌·天干
  pengZuZhi: string;        // 彭祖百忌·地支
  chong: string;            // 日冲
  sha: string;              // 煞
  taiShen: string;          // 胎神占方
  fanZhi: string;           // 反支
  jieQi?: string;           // 当日节气（如果是）
}

export function getAlmanac(year: number, month: number, day: number): DayAlmanac {
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();
  return {
    solar: solar.toYmd(),
    lunar: `${lunar.getYearInChinese()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
    ganZhi: {
      year: lunar.getYearInGanZhi(),
      month: lunar.getMonthInGanZhi(),
      day: lunar.getDayInGanZhi(),
    },
    jianChu: lunar.getZhiXing(),
    xiu: `${lunar.getXiu()}（${lunar.getXiuLuck()}）`,
    zhiXing: lunar.getDayNineStar()?.toString() ?? '',
    yi: lunar.getDayYi(),
    ji: lunar.getDayJi(),
    jiShen: lunar.getDayJiShen(),
    xiongSha: lunar.getDayXiongSha(),
    pengZuGan: lunar.getPengZuGan(),
    pengZuZhi: lunar.getPengZuZhi(),
    chong: lunar.getDayChongDesc(),
    sha: lunar.getDaySha(),
    taiShen: lunar.getDayPositionTai(),
    fanZhi: '',
    jieQi: lunar.getJieQi() || undefined,
  };
}

export function formatAlmanacForPrompt(a: DayAlmanac): string {
  return [
    `公历：${a.solar}`,
    `农历：${a.lunar}`,
    `年柱：${a.ganZhi.year}　月柱：${a.ganZhi.month}　日柱：${a.ganZhi.day}`,
    a.jieQi ? `节气：${a.jieQi}` : '',
    `建除十二神：${a.jianChu}　二十八宿：${a.xiu}`,
    `宜：${a.yi.join('、') || '—'}`,
    `忌：${a.ji.join('、') || '—'}`,
    `吉神宜趋：${a.jiShen.join('、') || '—'}`,
    `凶煞宜忌：${a.xiongSha.join('、') || '—'}`,
    `彭祖百忌：${a.pengZuGan}；${a.pengZuZhi}`,
    `日冲：${a.chong}　日煞：${a.sha}`,
    `胎神占方：${a.taiShen}`,
  ].filter(Boolean).join('\n');
}
