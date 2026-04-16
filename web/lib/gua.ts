// 周易六十四卦数据 + 起卦工具
// 爻位约定：lines[0] 为初爻（最下），lines[5] 为上爻（最上）
// 1 = 阳爻 ——，0 = 阴爻 — —

export interface Trigram {
  name: string; symbol: string; nature: string; bin: [number, number, number]; // bottom-up
}
export const TRIGRAMS: Record<string, Trigram> = {
  '111': { name: '乾', symbol: '☰', nature: '天', bin: [1, 1, 1] },
  '011': { name: '兑', symbol: '☱', nature: '泽', bin: [0, 1, 1] },
  '101': { name: '离', symbol: '☲', nature: '火', bin: [1, 0, 1] },
  '001': { name: '震', symbol: '☳', nature: '雷', bin: [0, 0, 1] },
  '110': { name: '巽', symbol: '☴', nature: '风', bin: [1, 1, 0] },
  '010': { name: '坎', symbol: '☵', nature: '水', bin: [0, 1, 0] },
  '100': { name: '艮', symbol: '☶', nature: '山', bin: [1, 0, 0] },
  '000': { name: '坤', symbol: '☷', nature: '地', bin: [0, 0, 0] },
};

export interface Hexagram {
  no: number;        // 1-64 King Wen
  name: string;      // 卦名
  symbol: string;    // 上下卦象征 e.g. 乾上乾下
  judgement: string; // 卦辞精要
  image: string;     // 大象传精要
}

// King Wen 顺序：第 N 卦由 (上卦 binary)(下卦 binary) 6 位决定
// key = "lower3upper3" (bottom→top): index by binary string of 6 chars
// 由"上卦+下卦名"快速查找 KingWen 序数
const KW_BY_TRIGRAMS: Record<string, number> = {
  // 上_下
  '乾_乾': 1,  '坤_坤': 2,  '坎_震': 3,  '艮_坎': 4,  '坎_乾': 5,  '乾_坎': 6,
  '坤_坎': 7,  '坎_坤': 8,  '巽_乾': 9,  '乾_兑': 10, '坤_乾': 11, '乾_坤': 12,
  '乾_离': 13, '离_乾': 14, '坤_艮': 15, '震_坤': 16, '兑_震': 17, '艮_巽': 18,
  '坤_兑': 19, '巽_坤': 20, '离_震': 21, '艮_离': 22, '艮_坤': 23, '坤_震': 24,
  '乾_震': 25, '艮_乾': 26, '艮_震': 27, '兑_巽': 28, '坎_坎': 29, '离_离': 30,
  '兑_艮': 31, '震_巽': 32, '乾_艮': 33, '震_乾': 34, '离_坤': 35, '坤_离': 36,
  '巽_离': 37, '离_兑': 38, '坎_艮': 39, '震_坎': 40, '艮_兑': 41, '巽_震': 42,
  '兑_乾': 43, '乾_巽': 44, '兑_坤': 45, '坤_巽': 46, '兑_坎': 47, '坎_巽': 48,
  '兑_离': 49, '离_巽': 50, '震_震': 51, '艮_艮': 52, '巽_艮': 53, '震_兑': 54,
  '震_离': 55, '离_艮': 56, '巽_巽': 57, '兑_兑': 58, '巽_坎': 59, '坎_兑': 60,
  '巽_兑': 61, '震_艮': 62, '坎_离': 63, '离_坎': 64,
};

const HEX_INFO: Record<number, { name: string; judgement: string; image: string }> = {
  1: { name: '乾为天', judgement: '元亨利贞。自强不息之卦', image: '天行健，君子以自强不息' },
  2: { name: '坤为地', judgement: '元亨，利牝马之贞。厚德载物', image: '地势坤，君子以厚德载物' },
  3: { name: '水雷屯', judgement: '初创艰难，宜建侯不宜远行', image: '云雷屯，君子以经纶' },
  4: { name: '山水蒙', judgement: '蒙昧待启，初筮告，再三渎则不告', image: '山下出泉，蒙；君子以果行育德' },
  5: { name: '水天需', judgement: '有孚光亨，需待时机', image: '云上于天，需；君子以饮食宴乐' },
  6: { name: '天水讼', judgement: '争讼不利，作事谋始', image: '天与水违行，讼；君子以作事谋始' },
  7: { name: '地水师', judgement: '师出以律，丈人吉无咎', image: '地中有水，师；君子以容民畜众' },
  8: { name: '水地比', judgement: '亲比辅助，吉，原筮元永贞', image: '地上有水，比；先王以建万国，亲诸侯' },
  9: { name: '风天小畜', judgement: '小有蓄积，密云不雨', image: '风行天上，小畜；君子以懿文德' },
  10:{ name: '天泽履', judgement: '履虎尾不咥人，谨慎而行', image: '上天下泽，履；君子以辨上下，定民志' },
  11:{ name: '地天泰', judgement: '小往大来，吉亨。天地交泰', image: '天地交，泰；后以财成天地之道' },
  12:{ name: '天地否', judgement: '否之匪人，大往小来。闭塞不通', image: '天地不交，否；君子以俭德辟难' },
  13:{ name: '天火同人', judgement: '同人于野，亨，利涉大川', image: '天与火，同人；君子以类族辨物' },
  14:{ name: '火天大有', judgement: '元亨，柔得尊位，大中而上下应之', image: '火在天上，大有；君子以遏恶扬善' },
  15:{ name: '地山谦', judgement: '亨。君子有终。谦尊而光', image: '地中有山，谦；君子以裒多益寡' },
  16:{ name: '雷地豫', judgement: '利建侯行师，顺以动', image: '雷出地奋，豫；先王以作乐崇德' },
  17:{ name: '泽雷随', judgement: '元亨利贞，无咎。随时而动', image: '泽中有雷，随；君子以向晦入宴息' },
  18:{ name: '山风蛊', judgement: '元亨，利涉大川。先甲三日，后甲三日', image: '山下有风，蛊；君子以振民育德' },
  19:{ name: '地泽临', judgement: '元亨利贞，至于八月有凶', image: '泽上有地，临；君子以教思无穷' },
  20:{ name: '风地观', judgement: '盥而不荐，有孚顒若', image: '风行地上，观；先王以省方观民设教' },
  21:{ name: '火雷噬嗑', judgement: '亨，利用狱。颐中有物', image: '雷电，噬嗑；先王以明罚敕法' },
  22:{ name: '山火贲', judgement: '亨。小利有攸往。文饰之卦', image: '山下有火，贲；君子以明庶政，无敢折狱' },
  23:{ name: '山地剥', judgement: '不利有攸往。柔变刚也', image: '山附于地，剥；上以厚下安宅' },
  24:{ name: '地雷复', judgement: '亨。出入无疾，朋来无咎。一阳来复', image: '雷在地中，复；先王以至日闭关' },
  25:{ name: '天雷无妄', judgement: '元亨利贞，其匪正有眚', image: '天下雷行，物与无妄；先王以茂对时育万物' },
  26:{ name: '山天大畜', judgement: '利贞，不家食吉，利涉大川', image: '天在山中，大畜；君子以多识前言往行' },
  27:{ name: '山雷颐', judgement: '贞吉。观颐，自求口实', image: '山下有雷，颐；君子以慎言语，节饮食' },
  28:{ name: '泽风大过', judgement: '栋桡，利有攸往，亨', image: '泽灭木，大过；君子以独立不惧，遁世无闷' },
  29:{ name: '坎为水', judgement: '习坎，有孚，维心亨。重险', image: '水洊至，习坎；君子以常德行，习教事' },
  30:{ name: '离为火', judgement: '利贞，亨；畜牝牛吉。附丽之卦', image: '明两作，离；大人以继明照于四方' },
  31:{ name: '泽山咸', judgement: '亨，利贞，取女吉。感应之始', image: '山上有泽，咸；君子以虚受人' },
  32:{ name: '雷风恒', judgement: '亨，无咎，利贞，利有攸往。恒久之道', image: '雷风，恒；君子以立不易方' },
  33:{ name: '天山遁', judgement: '亨，小利贞。退避之卦', image: '天下有山，遁；君子以远小人，不恶而严' },
  34:{ name: '雷天大壮', judgement: '利贞。大者壮也', image: '雷在天上，大壮；君子以非礼弗履' },
  35:{ name: '火地晋', judgement: '康侯用锡马蕃庶，昼日三接', image: '明出地上，晋；君子以自昭明德' },
  36:{ name: '地火明夷', judgement: '利艰贞。明入地中，蒙难晦守', image: '明入地中，明夷；君子以莅众，用晦而明' },
  37:{ name: '风火家人', judgement: '利女贞。正家而天下定', image: '风自火出，家人；君子以言有物而行有恒' },
  38:{ name: '火泽睽', judgement: '小事吉。乖违之卦', image: '上火下泽，睽；君子以同而异' },
  39:{ name: '水山蹇', judgement: '利西南，不利东北。险阻在前', image: '山上有水，蹇；君子以反身修德' },
  40:{ name: '雷水解', judgement: '利西南。无所往，其来复吉。险难解散', image: '雷雨作，解；君子以赦过宥罪' },
  41:{ name: '山泽损', judgement: '有孚，元吉，无咎。损下益上', image: '山下有泽，损；君子以惩忿窒欲' },
  42:{ name: '风雷益', judgement: '利有攸往，利涉大川。损上益下', image: '风雷，益；君子以见善则迁，有过则改' },
  43:{ name: '泽天夬', judgement: '扬于王庭，孚号有厉。决断之卦', image: '泽上于天，夬；君子以施禄及下' },
  44:{ name: '天风姤', judgement: '女壮，勿用取女。不期而遇', image: '天下有风，姤；后以施命诰四方' },
  45:{ name: '泽地萃', judgement: '亨。王假有庙，利见大人。聚集之卦', image: '泽上于地，萃；君子以除戎器，戒不虞' },
  46:{ name: '地风升', judgement: '元亨，用见大人，勿恤，南征吉', image: '地中生木，升；君子以顺德，积小以高大' },
  47:{ name: '泽水困', judgement: '亨，贞，大人吉，无咎。困穷之卦', image: '泽无水，困；君子以致命遂志' },
  48:{ name: '水风井', judgement: '改邑不改井，无丧无得。养而不穷', image: '木上有水，井；君子以劳民劝相' },
  49:{ name: '泽火革', judgement: '已日乃孚，元亨利贞。变革之卦', image: '泽中有火，革；君子以治历明时' },
  50:{ name: '火风鼎', judgement: '元吉，亨。鼎新之象', image: '木上有火，鼎；君子以正位凝命' },
  51:{ name: '震为雷', judgement: '亨。震来虩虩，笑言哑哑', image: '洊雷，震；君子以恐惧修省' },
  52:{ name: '艮为山', judgement: '艮其背，不获其身。止之卦', image: '兼山，艮；君子以思不出其位' },
  53:{ name: '风山渐', judgement: '女归吉，利贞。渐进之卦', image: '山上有木，渐；君子以居贤德善俗' },
  54:{ name: '雷泽归妹', judgement: '征凶，无攸利。归妹失序', image: '泽上有雷，归妹；君子以永终知敝' },
  55:{ name: '雷火丰', judgement: '亨，王假之，勿忧，宜日中。盛大之卦', image: '雷电皆至，丰；君子以折狱致刑' },
  56:{ name: '火山旅', judgement: '小亨，旅贞吉。羁旅之卦', image: '山上有火，旅；君子以明慎用刑而不留狱' },
  57:{ name: '巽为风', judgement: '小亨，利有攸往。顺入之卦', image: '随风，巽；君子以申命行事' },
  58:{ name: '兑为泽', judgement: '亨，利贞。喜悦之卦', image: '丽泽，兑；君子以朋友讲习' },
  59:{ name: '风水涣', judgement: '亨。王假有庙，利涉大川。涣散之卦', image: '风行水上，涣；先王以享于帝立庙' },
  60:{ name: '水泽节', judgement: '亨。苦节不可贞。节制之卦', image: '泽上有水，节；君子以制数度，议德行' },
  61:{ name: '风泽中孚', judgement: '豚鱼吉，利涉大川，利贞。诚信之卦', image: '泽上有风，中孚；君子以议狱缓死' },
  62:{ name: '雷山小过', judgement: '亨，利贞，可小事，不可大事', image: '山上有雷，小过；君子以行过乎恭' },
  63:{ name: '水火既济', judgement: '亨小，利贞。初吉终乱', image: '水在火上，既济；君子以思患而预防之' },
  64:{ name: '火水未济', judgement: '亨。小狐汔济，濡其尾。事未成', image: '火在水上，未济；君子以慎辨物居方' },
};

function trigramOf(lines: [number, number, number]): Trigram {
  const key = lines.map(String).join('') as keyof typeof TRIGRAMS;
  return TRIGRAMS[key];
}

export function lookupHexagram(lines: number[]): Hexagram {
  if (lines.length !== 6) throw new Error('需要 6 爻');
  const lower = trigramOf([lines[0], lines[1], lines[2]] as [number, number, number]);
  const upper = trigramOf([lines[3], lines[4], lines[5]] as [number, number, number]);
  const no = KW_BY_TRIGRAMS[`${upper.name}_${lower.name}`];
  const info = HEX_INFO[no];
  return {
    no,
    name: info.name,
    symbol: `${upper.symbol} ${upper.nature}（上）／ ${lower.symbol} ${lower.nature}（下）`,
    judgement: info.judgement,
    image: info.image,
  };
}

/** 单爻结果：value 6=老阴 7=少阳 8=少阴 9=老阳；line 当前爻 (0/1)，moving 是否动爻 */
export interface YaoCast { value: 6 | 7 | 8 | 9; line: 0 | 1; moving: boolean; }

/** 三钱起卦：单爻一次（每枚硬币正反面：背=3，字=2，求和） */
export function castOneYao(rng: () => number = Math.random): YaoCast {
  const coin = () => (rng() < 0.5 ? 2 : 3);
  const sum = (coin() + coin() + coin()) as 6 | 7 | 8 | 9;
  if (sum === 6) return { value: 6, line: 0, moving: true };  // 老阴 → 变阳
  if (sum === 7) return { value: 7, line: 1, moving: false }; // 少阳
  if (sum === 8) return { value: 8, line: 0, moving: false }; // 少阴
  return { value: 9, line: 1, moving: true };                 // 老阳 → 变阴
}

export interface CastResult {
  yaos: YaoCast[];        // 6 爻，自下而上
  benGua: Hexagram;       // 本卦
  bianGua: Hexagram | null; // 变卦（无动爻则 null）
  movingLines: number[];  // 动爻爻位（1=初爻 ... 6=上爻）
}

export function castHexagram(rng: () => number = Math.random): CastResult {
  const yaos: YaoCast[] = Array.from({ length: 6 }, () => castOneYao(rng));
  const ben = yaos.map((y) => y.line);
  const movingIdx = yaos
    .map((y, i) => (y.moving ? i + 1 : 0))
    .filter((x) => x > 0);
  const benGua = lookupHexagram(ben);
  let bianGua: Hexagram | null = null;
  if (movingIdx.length > 0) {
    const bian = ben.map((l, i) => (yaos[i].moving ? (l ^ 1) : l));
    bianGua = lookupHexagram(bian);
  }
  return { yaos, benGua, bianGua, movingLines: movingIdx };
}

export function formatGuaForPrompt(question: string, c: CastResult): string {
  const lineDesc = c.yaos
    .map((y, i) => `${i + 1}爻(${['初','二','三','四','五','上'][i]}爻)：${y.value}（${y.line ? '阳' : '阴'}${y.moving ? '·动' : ''}）`)
    .reverse() // 显示时上爻在前
    .join('\n');
  const moving = c.movingLines.length
    ? `动爻位：${c.movingLines.map((n) => ['初','二','三','四','五','上'][n - 1] + '爻').join('、')}`
    : '无动爻（静卦，以本卦卦辞为主）';
  return [
    `所问之事：${question}`,
    `本卦：第${c.benGua.no}卦 ${c.benGua.name}`,
    `卦象：${c.benGua.symbol}`,
    `卦辞：${c.benGua.judgement}`,
    `大象：${c.benGua.image}`,
    moving,
    c.bianGua ? `变卦：第${c.bianGua.no}卦 ${c.bianGua.name}（${c.bianGua.judgement}）` : '',
    '六爻自上而下：',
    lineDesc,
  ].filter(Boolean).join('\n');
}
