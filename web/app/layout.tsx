import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: '八卦 · 命理推演',
  description: '基于九部命理经典与 Vertex Gemini 的八字 / 卦象 / 择日 AI 推演',
};

const NAV = [
  { href: '/bazi', label: '八字排盘' },
  { href: '/daily', label: '每日运势' },
  { href: '/zeri', label: '择日选时' },
  { href: '/gua', label: '六十四卦' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <header className="border-b border-gold/20 backdrop-blur-md sticky top-0 z-40 bg-ink/60">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <span className="seal text-sm">八卦</span>
              <span className="gold-text text-xl font-bold tracking-widest">命理推演</span>
            </Link>
            <nav className="flex gap-6 text-sm">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className="text-paper/80 hover:text-gold transition-colors">
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>
        <footer className="text-center text-paper/40 text-xs py-8 border-t border-gold/10 mt-12">
          以九部命理经典为本 · Powered by Vertex AI Gemini · 仅供文化研究与娱乐参考
        </footer>
      </body>
    </html>
  );
}
