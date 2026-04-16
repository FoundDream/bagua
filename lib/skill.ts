import { promises as fs } from 'fs';
import path from 'path';

const SKILL_ROOT = path.resolve(process.cwd(), 'skill');
const REF_DIR = path.join(SKILL_ROOT, 'references');

const cache = new Map<string, string>();

async function readMd(name: string): Promise<string> {
  if (cache.has(name)) return cache.get(name)!;
  const p = path.join(REF_DIR, name);
  const text = await fs.readFile(p, 'utf-8');
  cache.set(name, text);
  return text;
}

export async function loadSkillIndex(): Promise<string> {
  return readMd('../SKILL.md').catch(() => '');
}

/** 八字分析需要的核心经典 */
export async function loadBaziRefs(): Promise<string> {
  const files = [
    'yuan_hai_ziping.md',
    'zi_ping_zhen_quan.md',
    'di_tian_sui.md',
    'qiong_tong_bao_dian.md',
    'qian_li_ming_gao.md',
  ];
  const parts = await Promise.all(files.map(readMd));
  return parts.join('\n\n---\n\n');
}

/** 每日运势：八字基础 + 神煞 */
export async function loadDailyRefs(): Promise<string> {
  const files = ['yuan_hai_ziping.md', 'di_tian_sui.md', 'san_ming_tong_hui.md'];
  const parts = await Promise.all(files.map(readMd));
  return parts.join('\n\n---\n\n');
}

/** 择日：协纪辨方 + 三命通会神煞 */
export async function loadZeriRefs(): Promise<string> {
  const files = ['xie_ji_bian_fang.md', 'san_ming_tong_hui.md'];
  const parts = await Promise.all(files.map(readMd));
  return parts.join('\n\n---\n\n');
}

/** 卦象解读：暂以神煞 + 体用论 + 综合派为辅 */
export async function loadGuaRefs(): Promise<string> {
  const files = ['di_tian_sui.md', 'san_ming_tong_hui.md'];
  const parts = await Promise.all(files.map(readMd));
  return parts.join('\n\n---\n\n');
}
