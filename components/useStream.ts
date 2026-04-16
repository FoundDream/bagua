'use client';

import { useCallback, useState } from 'react';

interface StreamState {
  text: string;
  loading: boolean;
  error: string | null;
  headers: Record<string, string>;
}

export function useStream() {
  const [state, setState] = useState<StreamState>({
    text: '', loading: false, error: null, headers: {},
  });

  const run = useCallback(async (url: string, body: unknown) => {
    setState({ text: '', loading: true, error: null, headers: {} });
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok || !res.body) {
        const t = await res.text().catch(() => '');
        throw new Error(`${res.status} ${t || res.statusText}`);
      }
      const headers: Record<string, string> = {};
      res.headers.forEach((v, k) => { headers[k] = v; });
      setState((s) => ({ ...s, headers }));

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = '';
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setState((s) => ({ ...s, text: acc }));
      }
      setState((s) => ({ ...s, loading: false }));
    } catch (err) {
      setState((s) => ({
        ...s, loading: false,
        error: err instanceof Error ? err.message : String(err),
      }));
    }
  }, []);

  const reset = useCallback(() => {
    setState({ text: '', loading: false, error: null, headers: {} });
  }, []);

  return { ...state, run, reset };
}
