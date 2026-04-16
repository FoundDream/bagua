'use client';

import { useEffect, useState } from 'react';
import { marked } from 'marked';

interface Props {
  /** 直接给已收到的 streaming 文本即可，外部驱动 */
  text: string;
  loading?: boolean;
}

marked.setOptions({ gfm: true, breaks: false });

export default function StreamReader({ text, loading }: Props) {
  const [html, setHtml] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const out = await marked.parse(text || '');
      if (!cancelled) setHtml(out);
    })();
    return () => { cancelled = true; };
  }, [text]);

  return (
    <div className="ink-card rounded-lg p-6 min-h-[12rem]">
      {!text && !loading && (
        <div className="text-paper/40 text-sm">推演结果将在此呈现…</div>
      )}
      <div className="prose-bagua" dangerouslySetInnerHTML={{ __html: html }} />
      {loading && (
        <div className="mt-3 inline-flex items-center gap-2 text-gold/80 text-sm">
          <span className="inline-block h-2 w-2 rounded-full bg-gold animate-pulse" />
          正在推演…
        </div>
      )}
    </div>
  );
}
