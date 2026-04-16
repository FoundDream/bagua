import { Solar } from 'lunar-typescript';

export type Gender = 'male' | 'female';

export interface Pillar {
  gan: string;
  zhi: string;
  hidden: string[]; // 藏干
  shiShen: { gan: string; zhi: string[] }; // 十神（天干 / 地支主气十神）
  naYin: string;    // 纳音
}

export interface DaYun {
  startAge: number;
  startYear: number;
  ganZhi: string;
}

export interface BaziResult {
  input: {
    solar: string;        // ISO 公历
    lunar: string;        // 农历表示
    gender: Gender;
  };
  pillars: {
    year: Pillar;
    month: Pillar;
    day: Pillar;          // 日柱天干即"日主"
    hour: Pillar;
  };
  dayMaster: string;       // 日主 (天干)
  fiveElements: Record<'木' | '火' | '土' | '金' | '水', number>;
  shenSha: string[];       // 主要神煞
  daYun: DaYun[];          // 大运（前 8 步）
  qiYun: string;           // 起运信息
  jieQi: { name: string; solar: string }[]; // 当年节气（节）
}

const FIVE: Record<string, '木' | '火' | '土' | '金' | '水'> = {
  甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土', 己: '土',
  庚: '金', 辛: '金', 壬: '水', 癸: '水',
  寅: '木', 卯: '木', 巳: '火', 午: '火',
  辰: '土', 戌: '土', 丑: '土', 未: '土',
  申: '金', 酉: '金', 亥: '水', 子: '水',
};

export function computeBazi(
  year: number, month: number, day: number,
  hour: number, minute: number,
  gender: Gender,
): BaziResult {
  const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();

  const mkPillar = (
    gan: string, zhi: string,
    hidden: string[],
    ganShiShen: string, zhiShiShenList: string[],
    naYin: string,
  ): Pillar => ({
    gan, zhi, hidden,
    shiShen: { gan: ganShiShen, zhi: zhiShiShenList },
    naYin,
  });

  const yearP = mkPillar(
    eightChar.getYearGan(), eightChar.getYearZhi(),
    eightChar.getYearHideGan(),
    eightChar.getYearShiShenGan(), eightChar.getYearShiShenZhi(),
    eightChar.getYearNaYin(),
  );
  const monthP = mkPillar(
    eightChar.getMonthGan(), eightChar.getMonthZhi(),
    eightChar.getMonthHideGan(),
    eightChar.getMonthShiShenGan(), eightChar.getMonthShiShenZhi(),
    eightChar.getMonthNaYin(),
  );
  const dayP = mkPillar(
    eightChar.getDayGan(), eightChar.getDayZhi(),
    eightChar.getDayHideGan(),
    '日主', eightChar.getDayShiShenZhi(),
    eightChar.getDayNaYin(),
  );
  const hourP = mkPillar(
    eightChar.getTimeGan(), eightChar.getTimeZhi(),
    eightChar.getTimeHideGan(),
    eightChar.getTimeShiShenGan(), eightChar.getTimeShiShenZhi(),
    eightChar.getTimeNaYin(),
  );

  // 五行统计：天干 + 地支主气（更详细可用藏干，这里取主气）
  const fiveCount: BaziResult['fiveElements'] = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  for (const c of [
    yearP.gan, yearP.zhi, monthP.gan, monthP.zhi,
    dayP.gan, dayP.zhi, hourP.gan, hourP.zhi,
  ]) {
    const e = FIVE[c];
    if (e) fiveCount[e]++;
  }

  // 大运（gender: 1 男 / 0 女; 取流派 2: 区分阴阳干顺逆）
  const yun = eightChar.getYun(gender === 'male' ? 1 : 0);
  const daYunList = yun.getDaYun().slice(0, 9).map((d) => ({
    startAge: d.getStartAge(),
    startYear: d.getStartYear(),
    ganZhi: d.getGanZhi(),
  }));
  const qiYun = yun.getStartSolar().toYmdHms();

  // 当年节气（24 个）
  const jq = lunar.getJieQiTable();
  const jieQi = Object.entries(jq).map(([name, s]) => ({
    name,
    solar: (s as Solar).toYmd(),
  }));

  // 主要神煞（lunar-typescript 在 day 层面提供）
  const shenSha = [
    lunar.getDayPositionTai() ? `胎神：${lunar.getDayPositionTai()}` : '',
    lunar.getDayChongDesc() ? `日冲：${lunar.getDayChongDesc()}` : '',
    lunar.getDaySha() ? `煞：${lunar.getDaySha()}` : '',
  ].filter(Boolean);

  return {
    input: {
      solar: solar.toYmdHms(),
      lunar: `${lunar.getYearInChinese()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()} ${lunar.getTimeZhi()}时`,
      gender,
    },
    pillars: { year: yearP, month: monthP, day: dayP, hour: hourP },
    dayMaster: dayP.gan,
    fiveElements: fiveCount,
    shenSha,
    daYun: daYunList,
    qiYun,
    jieQi,
  };
}

/** 把命盘格式化成给 LLM 看的紧凑表 */
export function formatBaziForPrompt(b: BaziResult): string {
  const p = b.pillars;
  const fiveLine = (Object.entries(b.fiveElements) as ['木'|'火'|'土'|'金'|'水', number][])
    .map(([k, v]) => `${k}${v}`).join(' ');
  const dayunLine = b.daYun.map((d) => `${d.startAge}岁(${d.startYear}) ${d.ganZhi}`).join(' / ');
  return [
    `性别：${b.input.gender === 'male' ? '乾造（男）' : '坤造（女）'}`,
    `公历：${b.input.solar}`,
    `农历：${b.input.lunar}`,
    `四柱：${p.year.gan}${p.year.zhi}（年） ${p.month.gan}${p.month.zhi}（月） ${p.day.gan}${p.day.zhi}（日，日主） ${p.hour.gan}${p.hour.zhi}（时）`,
    `藏干：年[${p.year.hidden.join('·')}] 月[${p.month.hidden.join('·')}] 日[${p.day.hidden.join('·')}] 时[${p.hour.hidden.join('·')}]`,
    `十神：年干${p.year.shiShen.gan}/支[${p.year.shiShen.zhi.join('·')}] 月干${p.month.shiShen.gan}/支[${p.month.shiShen.zhi.join('·')}] 日支[${p.day.shiShen.zhi.join('·')}] 时干${p.hour.shiShen.gan}/支[${p.hour.shiShen.zhi.join('·')}]`,
    `纳音：${p.year.naYin} / ${p.month.naYin} / ${p.day.naYin} / ${p.hour.naYin}`,
    `五行计数：${fiveLine}`,
    `起运：${b.qiYun}`,
    `大运：${dayunLine}`,
    b.shenSha.length ? `日参考：${b.shenSha.join('；')}` : '',
  ].filter(Boolean).join('\n');
}
