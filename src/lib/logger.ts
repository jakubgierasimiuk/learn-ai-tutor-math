import { supabase } from "@/integrations/supabase/client";

// Context buffer for user journey tracking
const CONTEXT_BUFFER_KEY = 'mentavo_context_buffer';
const MAX_BUFFER_SIZE = 25;

interface ContextAction {
  timestamp: number;
  type: string;
  route: string;
  data?: any;
}

function getContextBuffer(): ContextAction[] {
  try {
    const stored = localStorage.getItem(CONTEXT_BUFFER_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function addToContextBuffer(action: ContextAction) {
  try {
    const buffer = getContextBuffer();
    buffer.push(action);
    
    // Keep only last MAX_BUFFER_SIZE actions (FIFO)
    if (buffer.length > MAX_BUFFER_SIZE) {
      buffer.splice(0, buffer.length - MAX_BUFFER_SIZE);
    }
    
    localStorage.setItem(CONTEXT_BUFFER_KEY, JSON.stringify(buffer));
  } catch (e) {
    console.warn('Failed to add to context buffer:', e);
  }
}

export function getRecentUserJourney(): ContextAction[] {
  return getContextBuffer();
}

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
    
    // Add to context buffer for journey tracking
    addToContextBuffer({
      timestamp: Date.now(),
      type: event_type,
      route: meta.route,
      data: payload
    });
    
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
    
    // Add error to context buffer
    addToContextBuffer({
      timestamp: Date.now(),
      type: 'error',
      route: meta.route,
      data: { message: (error as any)?.message || String(error) }
    });
    
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

export async function logBugReport(
  description: string,
  whatHappened: string,
  reproductionSteps: string,
  severity: 'blocking' | 'hindering' | 'cosmetic'
) {
  try {
    const meta = getMeta();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const userJourney = getRecentUserJourney();
    const sessionContext = {
      currentRoute: meta.route,
      device: meta.device,
      platform: meta.platform,
      timestamp: Date.now(),
      userAgent: navigator?.userAgent || 'unknown'
    };
    
    const { data, error } = await (supabase as any).from('app_error_logs').insert({
      user_id: user.id,
      message: `Bug Report: ${description}`,
      user_description: description,
      reproduction_steps: reproductionSteps,
      severity,
      location: meta.route,
      source: 'user_report',
      user_journey: userJourney,
      session_context: sessionContext,
      payload: { whatHappened }
    }).select().single();
    
    if (error) throw error;
    return data;
  } catch (e) {
    console.warn('logBugReport failed', e);
    return null;
  }
}

export async function logAIMessage(sessionId: number, role: 'user' | 'assistant', message: string) {
  try {
    if (!sessionId) return;
    // For now, just log to console since lesson_steps was removed
    console.log(`AI Message [${role}]:`, message);
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
    // Ensure we have an Element (Text nodes can be targets)
    const rawTarget = (event.target || (event as any).srcElement) as EventTarget | null;
    const primary = rawTarget instanceof Element ? rawTarget : null;
    const fromPath = typeof (event as any).composedPath === 'function' ? (event as any).composedPath()[0] : null;
    const fallback = fromPath instanceof Element ? fromPath : null;
    const baseEl = primary || fallback;
    if (!baseEl) return;

    const clickable = baseEl.closest(
      'button, a, [role="button"], [data-track], input, label, summary, textarea, select'
    ) as Element | null;
    const el = clickable ?? baseEl;
    const info = serializeElement(el);
    logEvent('ui_click', {
      ...info,
      x: Math.round((event as MouseEvent).clientX ?? 0),
      y: Math.round((event as MouseEvent).clientY ?? 0),
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
