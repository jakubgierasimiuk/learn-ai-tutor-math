import { supabase } from "@/integrations/supabase/client";

// Context buffer for user journey tracking
const CONTEXT_BUFFER_KEY = 'mentavo_context_buffer';
const MAX_BUFFER_SIZE = 25;

// Analytics tracking
const SESSION_STORAGE_KEY = 'mentavo_session_analytics';
const PAGE_VISIT_KEY = 'mentavo_page_visits';

interface ContextAction {
  timestamp: number;
  type: string;
  route: string;
  data?: any;
}

interface PageVisit {
  route: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

interface SessionAnalytics {
  sessionId: string;
  startTime: number;
  pageVisits: PageVisit[];
  entryPage: string;
  currentPage: string;
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

// Analytics Functions
export const initializeSessionAnalytics = () => {
  if (typeof window === 'undefined') return;

  let sessionData = getSessionAnalytics();
  if (!sessionData) {
    sessionData = {
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startTime: Date.now(),
      pageVisits: [],
      entryPage: window.location.pathname,
      currentPage: window.location.pathname
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
  }

  // Track page view
  trackPageView(window.location.pathname);
};

export const trackPageView = (route: string) => {
  if (typeof window === 'undefined') return;

  const sessionData = getSessionAnalytics();
  if (!sessionData) return;

  // End previous page visit
  if (sessionData.pageVisits.length > 0) {
    const lastVisit = sessionData.pageVisits[sessionData.pageVisits.length - 1];
    if (!lastVisit.endTime) {
      lastVisit.endTime = Date.now();
      lastVisit.duration = lastVisit.endTime - lastVisit.startTime;
    }
  }

  // Start new page visit
  const newVisit: PageVisit = {
    route,
    startTime: Date.now()
  };

  sessionData.pageVisits.push(newVisit);
  sessionData.currentPage = route;
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));

  // Log page view event
  logEvent('page_view', { 
    route, 
    sessionId: sessionData.sessionId,
    timestamp: Date.now(),
    referrer: document.referrer || 'direct'
  });
};

export const endSession = () => {
  if (typeof window === 'undefined') return;

  const sessionData = getSessionAnalytics();
  if (!sessionData) return;

  // End current page visit
  if (sessionData.pageVisits.length > 0) {
    const lastVisit = sessionData.pageVisits[sessionData.pageVisits.length - 1];
    if (!lastVisit.endTime) {
      lastVisit.endTime = Date.now();
      lastVisit.duration = lastVisit.endTime - lastVisit.startTime;
    }
  }

  // Calculate session metrics
  const totalDuration = Date.now() - sessionData.startTime;
  const pagesVisited = sessionData.pageVisits.length;
  const isBounce = pagesVisited <= 1 && totalDuration < 30000; // Less than 30 seconds, single page

  // Log session end
  logEvent('session_end', {
    sessionId: sessionData.sessionId,
    duration: totalDuration,
    pagesVisited,
    isBounce,
    entryPage: sessionData.entryPage,
    exitPage: sessionData.currentPage,
    pageVisits: sessionData.pageVisits
  });

  // Clear session data
  localStorage.removeItem(SESSION_STORAGE_KEY);
};

const getSessionAnalytics = (): SessionAnalytics | null => {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem(SESSION_STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
};

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

// Survey Trigger Functions
let surveyTriggerCallback: ((surveyType: string, context?: any) => void) | null = null;

export const setSurveyTriggerCallback = (callback: (surveyType: string, context?: any) => void) => {
  surveyTriggerCallback = callback;
};

const triggerSurvey = (surveyType: string, context: any = {}) => {
  if (surveyTriggerCallback) {
    surveyTriggerCallback(surveyType, context);
  }
};

// Enhanced event logging with survey triggers
export const logLessonComplete = (lessonData: any) => {
  logEvent('lesson_complete', lessonData);
  
  // Trigger lesson feedback survey (with probability)
  if (Math.random() < 0.3) {
    triggerSurvey('lesson_feedback', {
      lesson_id: lessonData.lessonId,
      lesson_name: lessonData.lessonName,
      score: lessonData.score,
      time_spent_minutes: Math.round((lessonData.timeSpent || 0) / 60),
      difficulty_level: lessonData.difficulty || 1,
      completed_at: new Date().toISOString()
    });
  }
};

export const logUserChurn = (sessionData: any) => {
  logEvent('user_churn_risk', sessionData);
  
  // Trigger exit intent survey for longer sessions
  if (sessionData.sessionDuration > 120) { // 2+ minutes
    triggerSurvey('exit_intent', {
      session_duration: sessionData.sessionDuration,
      pages_visited: sessionData.pagesVisited,
      last_activity: new Date().toISOString()
    });
  }
};

export const triggerNPSSurvey = () => {
  triggerSurvey('nps', {
    trigger_time: new Date().toISOString(),
    user_journey: getRecentUserJourney()
  });
};

export function setupGlobalLogging() {
  if (typeof window === 'undefined') return;

  // Initialize session analytics
  initializeSessionAnalytics();

  // Log session end when user leaves
  window.addEventListener('beforeunload', () => {
    const sessionAnalytics = getSessionAnalytics();
    if (sessionAnalytics) {
      const sessionDuration = Date.now() - sessionAnalytics.startTime;
      logUserChurn({
        sessionDuration: Math.round(sessionDuration / 1000),
        pagesVisited: sessionAnalytics.pageVisits.length,
        lastPage: sessionAnalytics.currentPage
      });
    }
    endSession();
  });

  // Track route changes (for SPA)
  let currentRoute = window.location.pathname;
  const observer = new MutationObserver(() => {
    if (window.location.pathname !== currentRoute) {
      currentRoute = window.location.pathname;
      trackPageView(currentRoute);
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

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
    observer.disconnect();
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
