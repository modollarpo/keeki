declare global {
  interface Window {
    __perr?: {kind: string; msg: string; stack?: string; componentStack?: string};
  }
}

export function debugError(kind: string, err: unknown, componentStack?: string) {
  const msg =
    err instanceof Error ? err.message : typeof err === 'string' ? err : JSON.stringify(err);
  const stack = err instanceof Error ? err.stack || '' : '';
  window.__perr = {kind, msg, stack: stack.slice(0, 2000), componentStack};
  try {
    let el = document.getElementById('__debug-error');
    if (!el) {
      el = document.createElement('pre');
      el.id = '__debug-error';
      el.style.cssText =
        'position:fixed;top:0;left:0;right:0;z-index:999999;background:#b30000;color:#fff;' +
        'white-space:pre-wrap;font:11px/1.3 monospace;padding:8px;overflow:auto;max-height:60vh;';
      document.body.appendChild(el);
    }
    el.textContent = JSON.stringify(
      {kind, msg, stack: stack.slice(0, 3000), componentStack},
      null,
      2,
    );
  } catch {
    // ignore
  }
}