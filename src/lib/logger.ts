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
    await supabase.from('app_event_logs').insert({
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
    const err = error as any;
    await supabase.from('app_error_logs').insert({
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
