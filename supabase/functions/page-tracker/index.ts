import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PageTrackingData {
  route: string;
  referrer?: string;
  userAgent: string;
  device: string;
  platform: string;
  sessionId: string;
  timestamp: number;
  userId?: string;
  loadTime?: number;
  screenResolution?: string;
  language?: string;
  timezone?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const trackingData: PageTrackingData = await req.json();
    
    console.log('Page tracking data received:', {
      route: trackingData.route,
      device: trackingData.device,
      sessionId: trackingData.sessionId,
      userId: trackingData.userId || 'anonymous'
    });

    // Get user if available
    let user = null;
    if (trackingData.userId) {
      const { data: userData } = await supabase.auth.admin.getUserById(trackingData.userId);
      user = userData.user;
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Real-time tracking - log to app_event_logs
    await supabase.from('app_event_logs').insert({
      user_id: trackingData.userId || null,
      event_type: 'page_view',
      route: trackingData.route,
      device: trackingData.device,
      platform: trackingData.platform,
      payload: {
        referrer: trackingData.referrer,
        userAgent: trackingData.userAgent,
        sessionId: trackingData.sessionId,
        loadTime: trackingData.loadTime,
        screenResolution: trackingData.screenResolution,
        language: trackingData.language,
        timezone: trackingData.timezone,
        timestamp: trackingData.timestamp
      }
    });

    // Update or create daily page analytics
    const { data: existingAnalytics, error: selectError } = await supabase
      .from('page_analytics')
      .select('*')
      .eq('date', today)
      .eq('route', trackingData.route)
      .maybeSingle();

    if (selectError && selectError.code !== 'PGRST116') {
      throw selectError;
    }

    if (existingAnalytics) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('page_analytics')
        .update({
          total_page_views: existingAnalytics.total_page_views + 1,
          unique_page_views: trackingData.userId ? existingAnalytics.unique_page_views + 1 : existingAnalytics.unique_page_views,
          updated_at: now.toISOString()
        })
        .eq('id', existingAnalytics.id);

      if (updateError) throw updateError;
    } else {
      // Create new record
      const { error: insertError } = await supabase
        .from('page_analytics')
        .insert({
          date: today,
          route: trackingData.route,
          total_page_views: 1,
          unique_page_views: trackingData.userId ? 1 : 0,
          bounce_rate: 0,
          average_session_duration_minutes: 0
        });

      if (insertError) throw insertError;
    }

    // Update session analytics if user session exists
    if (trackingData.sessionId) {
      await updateSessionAnalytics(supabase, trackingData);
    }

    // Real-time metrics for dashboard
    await updateRealTimeMetrics(supabase, trackingData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Page view tracked successfully',
        route: trackingData.route,
        timestamp: now.toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Page tracking error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to track page view', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

async function updateSessionAnalytics(supabase: any, trackingData: PageTrackingData) {
  try {
    const { data: existingSession } = await supabase
      .from('user_session_analytics')
      .select('*')
      .eq('session_id', trackingData.sessionId)
      .maybeSingle();

    const now = new Date();
    
    if (existingSession) {
      // Update existing session
      const { error } = await supabase
        .from('user_session_analytics')
        .update({
          pages_visited: existingSession.pages_visited + 1,
          exit_page: trackingData.route,
          updated_at: now.toISOString()
        })
        .eq('id', existingSession.id);

      if (error) console.error('Session update error:', error);
    } else {
      // Create new session
      const { error } = await supabase
        .from('user_session_analytics')
        .insert({
          session_id: trackingData.sessionId,
          user_id: trackingData.userId || null,
          started_at: new Date(trackingData.timestamp).toISOString(),
          entry_page: trackingData.route,
          exit_page: trackingData.route,
          pages_visited: 1,
          device_type: trackingData.device,
          user_agent: trackingData.userAgent,
          referrer: trackingData.referrer,
          is_bounce: false,
          duration_minutes: 0
        });

      if (error) console.error('Session insert error:', error);
    }
  } catch (error) {
    console.error('Session analytics update failed:', error);
  }
}

async function updateRealTimeMetrics(supabase: any, trackingData: PageTrackingData) {
  try {
    const now = new Date();
    const cacheKey = `realtime_metrics_${now.toISOString().split('T')[0]}`;
    
    // Update real-time cache for dashboard
    const { data: existingCache } = await supabase
      .from('analytics_cache')
      .select('*')
      .eq('cache_key', cacheKey)
      .maybeSingle();

    const currentData = existingCache?.cache_data || {
      totalPageViews: 0,
      uniqueUsers: new Set(),
      deviceTypes: {},
      popularPages: {},
      hourlyViews: Array(24).fill(0)
    };

    // Update metrics
    currentData.totalPageViews += 1;
    if (trackingData.userId) {
      currentData.uniqueUsers.add(trackingData.userId);
    }
    currentData.deviceTypes[trackingData.device] = (currentData.deviceTypes[trackingData.device] || 0) + 1;
    currentData.popularPages[trackingData.route] = (currentData.popularPages[trackingData.route] || 0) + 1;
    
    const currentHour = now.getHours();
    currentData.hourlyViews[currentHour] += 1;

    // Convert Set to array for storage
    const cacheDataForStorage = {
      ...currentData,
      uniqueUsers: Array.from(currentData.uniqueUsers),
      uniqueUserCount: currentData.uniqueUsers.size
    };

    if (existingCache) {
      await supabase
        .from('analytics_cache')
        .update({
          cache_data: cacheDataForStorage,
          expires_at: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        })
        .eq('id', existingCache.id);
    } else {
      await supabase
        .from('analytics_cache')
        .insert({
          cache_key: cacheKey,
          cache_data: cacheDataForStorage,
          expires_at: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
        });
    }
  } catch (error) {
    console.error('Real-time metrics update failed:', error);
  }
}