import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { operation = 'daily_aggregation' } = await req.json().catch(() => ({}));
    
    console.log(`Starting analytics aggregation: ${operation}`);

    switch (operation) {
      case 'daily_aggregation':
        await processDailyAggregation(supabase);
        break;
      case 'session_cleanup':
        await processSessionCleanup(supabase);
        break;
      case 'bounce_rate_calculation':
        await calculateBounceRates(supabase);
        break;
      default:
        await processDailyAggregation(supabase);
    }

    return new Response(
      JSON.stringify({ success: true, operation, timestamp: new Date().toISOString() }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Analytics aggregation error:', error);
    return new Response(
      JSON.stringify({ error: 'Aggregation failed', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function processDailyAggregation(supabase: any) {
  console.log('Processing daily aggregation...');
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  const today = new Date().toISOString().split('T')[0];

  // Get all page view events from yesterday and today
  const { data: pageViewEvents, error: eventsError } = await supabase
    .from('app_event_logs')
    .select('*')
    .eq('event_type', 'page_view')
    .gte('created_at', `${yesterdayStr} 00:00:00`)
    .lte('created_at', `${today} 23:59:59`);

  if (eventsError) {
    console.error('Error fetching page view events:', eventsError);
    return;
  }

  console.log(`Processing ${pageViewEvents.length} page view events`);

  // Group events by date and route
  const groupedEvents: Record<string, Record<string, any[]>> = {};
  
  pageViewEvents.forEach(event => {
    const date = event.created_at.split('T')[0];
    const route = event.route || '/';
    
    if (!groupedEvents[date]) {
      groupedEvents[date] = {};
    }
    if (!groupedEvents[date][route]) {
      groupedEvents[date][route] = [];
    }
    groupedEvents[date][route].push(event);
  });

  // Process each date and route
  for (const [date, routes] of Object.entries(groupedEvents)) {
    for (const [route, events] of Object.entries(routes)) {
      await processRouteAnalytics(supabase, date, route, events);
    }
  }

  console.log('Daily aggregation completed');
}

async function processRouteAnalytics(supabase: any, date: string, route: string, events: any[]) {
  const totalPageViews = events.length;
  const uniqueUsers = new Set(events.filter(e => e.user_id).map(e => e.user_id));
  const uniquePageViews = uniqueUsers.size;
  
  // Calculate average load time
  const loadTimes = events
    .map(e => e.payload?.loadTime)
    .filter(time => typeof time === 'number' && time > 0);
  
  const avgLoadTime = loadTimes.length > 0 
    ? loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length 
    : 0;

  // Device and platform stats
  const deviceStats = events.reduce((acc, event) => {
    const device = event.device || 'unknown';
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {});

  const platformStats = events.reduce((acc, event) => {
    const platform = event.platform || 'unknown';
    acc[platform] = (acc[platform] || 0) + 1;
    return acc;
  }, {});

  // Check if record already exists
  const { data: existing } = await supabase
    .from('page_analytics')
    .select('*')
    .eq('date', date)
    .eq('route', route)
    .maybeSingle();

  const analyticsData = {
    date,
    route,
    total_page_views: totalPageViews,
    unique_page_views: uniquePageViews,
    average_load_time_ms: Math.round(avgLoadTime),
    device_stats: deviceStats,
    platform_stats: platformStats,
    bounce_rate: 0, // Will be calculated separately
    average_session_duration_minutes: 0, // Will be calculated from sessions
    updated_at: new Date().toISOString()
  };

  if (existing) {
    const { error } = await supabase
      .from('page_analytics')
      .update(analyticsData)
      .eq('id', existing.id);
    
    if (error) console.error(`Error updating analytics for ${route} on ${date}:`, error);
  } else {
    const { error } = await supabase
      .from('page_analytics')
      .insert(analyticsData);
    
    if (error) console.error(`Error inserting analytics for ${route} on ${date}:`, error);
  }

  console.log(`Processed ${route}: ${totalPageViews} views, ${uniquePageViews} unique`);
}

async function processSessionCleanup(supabase: any) {
  console.log('Processing session cleanup...');
  
  // Get incomplete sessions older than 4 hours
  const fourHoursAgo = new Date();
  fourHoursAgo.setHours(fourHoursAgo.getHours() - 4);
  
  const { data: incompleteSessions, error } = await supabase
    .from('user_session_analytics')
    .select('*')
    .is('ended_at', null)
    .lt('started_at', fourHoursAgo.toISOString());

  if (error) {
    console.error('Error fetching incomplete sessions:', error);
    return;
  }

  console.log(`Found ${incompleteSessions.length} incomplete sessions to clean up`);

  // Update incomplete sessions
  for (const session of incompleteSessions) {
    const estimatedEndTime = new Date(session.updated_at || session.started_at);
    estimatedEndTime.setMinutes(estimatedEndTime.getMinutes() + 30); // Assume 30min session
    
    const durationMinutes = Math.round(
      (estimatedEndTime.getTime() - new Date(session.started_at).getTime()) / 60000
    );

    const { error: updateError } = await supabase
      .from('user_session_analytics')
      .update({
        ended_at: estimatedEndTime.toISOString(),
        duration_minutes: Math.max(1, Math.min(durationMinutes, 180)), // Cap at 3 hours
        is_bounce: session.pages_visited <= 1 && durationMinutes < 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', session.id);

    if (updateError) {
      console.error(`Error updating session ${session.id}:`, updateError);
    }
  }

  console.log('Session cleanup completed');
}

async function calculateBounceRates(supabase: any) {
  console.log('Calculating bounce rates...');
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Get all sessions from yesterday
  const { data: sessions, error } = await supabase
    .from('user_session_analytics')
    .select('entry_page, is_bounce, duration_minutes')
    .gte('started_at', `${yesterdayStr} 00:00:00`)
    .lt('started_at', `${yesterdayStr} 23:59:59`);

  if (error) {
    console.error('Error fetching sessions for bounce rate:', error);
    return;
  }

  // Calculate bounce rates by page
  const pageStats: Record<string, { total: number; bounces: number; totalDuration: number }> = {};
  
  sessions.forEach(session => {
    const page = session.entry_page || '/';
    if (!pageStats[page]) {
      pageStats[page] = { total: 0, bounces: 0, totalDuration: 0 };
    }
    
    pageStats[page].total++;
    if (session.is_bounce) {
      pageStats[page].bounces++;
    }
    pageStats[page].totalDuration += session.duration_minutes || 0;
  });

  // Update page analytics with bounce rates
  for (const [page, stats] of Object.entries(pageStats)) {
    const bounceRate = stats.total > 0 ? (stats.bounces / stats.total) * 100 : 0;
    const avgSessionDuration = stats.total > 0 ? stats.totalDuration / stats.total : 0;

    const { error: updateError } = await supabase
      .from('page_analytics')
      .update({
        bounce_rate: Math.round(bounceRate * 10) / 10,
        average_session_duration_minutes: Math.round(avgSessionDuration * 10) / 10
      })
      .eq('date', yesterdayStr)
      .eq('route', page);

    if (updateError) {
      console.error(`Error updating bounce rate for ${page}:`, updateError);
    } else {
      console.log(`Updated ${page}: ${bounceRate.toFixed(1)}% bounce rate, ${avgSessionDuration.toFixed(1)}min avg duration`);
    }
  }

  console.log('Bounce rate calculation completed');
}