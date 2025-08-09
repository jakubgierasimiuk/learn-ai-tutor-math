import { supabase } from "@/integrations/supabase/client";

function getDeviceType() {
  const ua = navigator?.userAgent || "";
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua) || window.innerWidth < 768;
  return isMobile ? "mobile" : "desktop";
}

function getMeta() {
  return {
    route: typeof window !== 'undefined' ? window.location.pathname : '/',
    device: typeof window !== 'undefined' ? getDeviceType() : 'web',
    platform: typeof navigator !== 'undefined' ? (navigator.platform || 'web') : 'web',
  } as const;
}

export async function logEvent(event_type: string, payload?: any) {
  try {
    const meta = getMeta();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return; // RLS requires user_id
    await (supabase as any).from('app_event_logs').insert({
      user_id: user.id,
      event_type,
      payload: payload ?? null,
      route: meta.route,
      device: meta.device,
      platform: meta.platform,
    });
  } catch (e) {
    // Avoid throwing from logger
    console.warn('logEvent failed', e);
  }
}

export async function logError(error: unknown, location?: string, payload?: any) {
  try {
    const meta = getMeta();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return; // RLS requires user_id
    const err = error as any;
    await (supabase as any).from('app_error_logs').insert({
      user_id: user.id,
      message: err?.message || String(error),
      stack: err?.stack || null,
      location: location || meta.route,
      payload: payload ?? null,
    });
  } catch (e) {
    console.warn('logError failed', e);
  }
}

export async function logAIMessage(sessionId: number, role: 'user' | 'assistant', message: string) {
  try {
    if (!sessionId) return;
    await supabase.from('chat_logs').insert({
      session_id: sessionId,
      role,
      message,
    });
  } catch (e) {
    console.warn('logAIMessage failed', e);
  }
}

export function setupGlobalLogging() {
  const onError = (event: ErrorEvent) => {
    logError(event.error || event.message, 'global.error', { filename: event.filename, lineno: event.lineno, colno: event.colno });
  };
  const onRejection = (event: PromiseRejectionEvent) => {
    logError(event.reason, 'global.unhandledrejection');
  };
  window.addEventListener('error', onError);
  window.addEventListener('unhandledrejection', onRejection);

  // Initial app open event
  logEvent('app_opened');

  return () => {
    window.removeEventListener('error', onError);
    window.removeEventListener('unhandledrejection', onRejection);
  };
}

// Global interaction logging (clicks and form submissions)
function truncate(text: string | null | undefined, max = 96) {
  const t = (text ?? '').trim().replace(/\s+/g, ' ');
  return t.length > max ? t.slice(0, max - 1) + '…' : t;
}

function serializeElement(el: Element) {
  const tag = el.tagName.toLowerCase();
  const anyEl = el as HTMLElement;
  const inputEl = el as HTMLInputElement;
  const anchorEl = el as HTMLAnchorElement;
  const isTextual = tag === 'button' || tag === 'a' || tag === 'summary' || anyEl.getAttribute('role') === 'button';
  return {
    tag,
    id: anyEl.id || null,
    classes: anyEl.className || null,
    role: anyEl.getAttribute('role') || null,
    name: inputEl.name || anyEl.getAttribute('name') || null,
    type: inputEl.type || null,
    href: anchorEl.getAttribute?.('href') || null,
    ariaLabel: anyEl.getAttribute('aria-label') || null,
    text: isTextual ? truncate(anyEl.innerText || anyEl.textContent || '') : null,
    // Do NOT capture values for privacy
  } as const;
}

export function setupGlobalInteractionLogging() {
  const onClick = (event: MouseEvent) => {
    const target = event.target as Element | null;
    if (!target) return;
    const clickable = target.closest(
      'button, a, [role="button"], [data-track], input, label, summary, textarea, select'
    ) as Element | null;
    const el = clickable ?? target;
    const info = serializeElement(el);
    logEvent('ui_click', {
      ...info,
      x: Math.round(event.clientX ?? 0),
      y: Math.round(event.clientY ?? 0),
    });
  };

  const onSubmit = (event: Event) => {
    const form = event.target as HTMLFormElement | null;
    if (!form || form.tagName !== 'FORM') return;
    const fields: string[] = Array.from(form.elements || [])
      .map((e: any) => e?.name || e?.id || null)
      .filter(Boolean)
      .slice(0, 100);
    const info = serializeElement(form);
    logEvent('ui_submit', {
      ...info,
      fields,
      method: form.getAttribute('method') || 'post',
      action: form.getAttribute('action') || null,
    });
  };

  document.addEventListener('click', onClick, { passive: true, capture: true });
  document.addEventListener('submit', onSubmit, { capture: true });

  return () => {
    // removeEventListener options require same capture flag
    document.removeEventListener('click', onClick, { capture: true } as any);
    document.removeEventListener('submit', onSubmit, { capture: true } as any);
  };
}
