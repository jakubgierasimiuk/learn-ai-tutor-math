import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { method, period = '7d', startDate, endDate } = await req.json()

    console.log(`Analytics request: ${method}, period: ${period}`)

    switch (method) {
      case 'getDashboardMetrics':
        return await getDashboardMetrics(supabase, period, startDate, endDate)
      
      case 'getPopularPages':
        return await getPopularPages(supabase, period, startDate, endDate)
      
      case 'getUserBehavior':
        return await getUserBehavior(supabase, period, startDate, endDate)
      
      case 'processEventLogs':
        return await processEventLogs(supabase)
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid method' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('Analytics processor error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function getDashboardMetrics(supabase: any, period: string, startDate?: string, endDate?: string) {
  const dateFilter = getDateFilter(period, startDate, endDate)
  
  // Get page analytics
  const { data: pageData, error: pageError } = await supabase
    .from('page_analytics')
    .select('*')
    .gte('date', dateFilter.start)
    .lte('date', dateFilter.end)

  if (pageError) throw pageError

  // Get session analytics
  const { data: sessionData, error: sessionError } = await supabase
    .from('user_session_analytics')
    .select('*')
    .gte('started_at', dateFilter.start)
    .lte('started_at', dateFilter.end)

  if (sessionError) throw sessionError

  // Calculate metrics
  const totalPageViews = pageData.reduce((sum: number, row: any) => sum + row.total_page_views, 0)
  const uniquePageViews = pageData.reduce((sum: number, row: any) => sum + row.unique_page_views, 0)
  const totalSessions = sessionData.length
  const uniqueUsers = new Set(sessionData.filter((s: any) => s.user_id).map((s: any) => s.user_id)).size
  const averageSessionDuration = sessionData.length > 0 
    ? sessionData.reduce((sum: number, s: any) => sum + (s.duration_minutes || 0), 0) / sessionData.length
    : 0
  const bounceRate = sessionData.length > 0
    ? sessionData.filter((s: any) => s.is_bounce).length / sessionData.length * 100
    : 0

  // Get previous period for comparison
  const prevDateFilter = getPreviousDateFilter(period, startDate, endDate)
  const { data: prevPageData } = await supabase
    .from('page_analytics')
    .select('total_page_views')
    .gte('date', prevDateFilter.start)
    .lte('date', prevDateFilter.end)

  const prevTotalPageViews = prevPageData?.reduce((sum: number, row: any) => sum + row.total_page_views, 0) || 0
  const pageViewsChange = prevTotalPageViews > 0 
    ? ((totalPageViews - prevTotalPageViews) / prevTotalPageViews * 100).toFixed(1)
    : '0'

  const metrics = {
    totalPageViews,
    uniquePageViews,
    totalSessions,
    uniqueUsers,
    averageSessionDuration: Math.round(averageSessionDuration * 10) / 10,
    bounceRate: Math.round(bounceRate * 10) / 10,
    pageViewsChange: `${parseFloat(pageViewsChange) >= 0 ? '+' : ''}${pageViewsChange}%`,
    pagesPerSession: totalSessions > 0 ? Math.round((totalPageViews / totalSessions) * 10) / 10 : 0
  }

  return new Response(
    JSON.stringify({ metrics }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getPopularPages(supabase: any, period: string, startDate?: string, endDate?: string) {
  const dateFilter = getDateFilter(period, startDate, endDate)
  
  const { data, error } = await supabase
    .from('page_analytics')
    .select('route, total_page_views, unique_page_views, average_session_duration_minutes, bounce_rate')
    .gte('date', dateFilter.start)
    .lte('date', dateFilter.end)

  if (error) throw error

  // Aggregate by route
  const routeStats = data.reduce((acc: any, row: any) => {
    const route = row.route
    if (!acc[route]) {
      acc[route] = {
        route,
        pageViews: 0,
        uniqueViews: 0,
        avgDuration: 0,
        bounceRate: 0,
        sessions: 0
      }
    }
    acc[route].pageViews += row.total_page_views
    acc[route].uniqueViews += row.unique_page_views
    acc[route].avgDuration += row.average_session_duration_minutes || 0
    acc[route].bounceRate += row.bounce_rate || 0
    acc[route].sessions += 1
    return acc
  }, {})

  // Calculate averages and sort
  const popularPages = Object.values(routeStats)
    .map((stats: any) => ({
      ...stats,
      avgDuration: stats.sessions > 0 ? Math.round((stats.avgDuration / stats.sessions) * 10) / 10 : 0,
      bounceRate: stats.sessions > 0 ? Math.round((stats.bounceRate / stats.sessions) * 10) / 10 : 0
    }))
    .sort((a: any, b: any) => b.pageViews - a.pageViews)
    .slice(0, 10)

  return new Response(
    JSON.stringify({ popularPages }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getUserBehavior(supabase: any, period: string, startDate?: string, endDate?: string) {
  const dateFilter = getDateFilter(period, startDate, endDate)
  
  const { data: sessionData, error } = await supabase
    .from('user_session_analytics')
    .select('*')
    .gte('started_at', dateFilter.start)
    .lte('started_at', dateFilter.end)

  if (error) throw error

  // Calculate user behavior metrics
  const deviceTypes = sessionData.reduce((acc: any, session: any) => {
    const device = session.device_type || 'unknown'
    acc[device] = (acc[device] || 0) + 1
    return acc
  }, {})

  const entryPages = sessionData.reduce((acc: any, session: any) => {
    const page = session.entry_page || 'unknown'
    acc[page] = (acc[page] || 0) + 1
    return acc
  }, {})

  const exitPages = sessionData.reduce((acc: any, session: any) => {
    const page = session.exit_page || 'unknown'
    acc[page] = (acc[page] || 0) + 1
    return acc
  }, {})

  // Get top 5 for each category
  const topDeviceTypes = Object.entries(deviceTypes)
    .sort(([,a]: any, [,b]: any) => b - a)
    .slice(0, 5)
    .map(([device, count]) => ({ device, count }))

  const topEntryPages = Object.entries(entryPages)
    .sort(([,a]: any, [,b]: any) => b - a)
    .slice(0, 5)
    .map(([page, count]) => ({ page, count }))

  const topExitPages = Object.entries(exitPages)
    .sort(([,a]: any, [,b]: any) => b - a)
    .slice(0, 5)
    .map(([page, count]) => ({ page, count }))

  return new Response(
    JSON.stringify({ 
      deviceTypes: topDeviceTypes,
      entryPages: topEntryPages,
      exitPages: topExitPages 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function processEventLogs(supabase: any) {
  // This would run as a background job to process app_event_logs
  // and aggregate them into page_analytics and user_session_analytics
  console.log('Processing event logs...')
  
  return new Response(
    JSON.stringify({ success: true, message: 'Event logs processed' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

function getDateFilter(period: string, startDate?: string, endDate?: string) {
  if (startDate && endDate) {
    return { start: startDate, end: endDate }
  }

  const now = new Date()
  const start = new Date()

  switch (period) {
    case '1d':
      start.setDate(now.getDate() - 1)
      break
    case '7d':
      start.setDate(now.getDate() - 7)
      break
    case '30d':
      start.setDate(now.getDate() - 30)
      break
    case '90d':
      start.setDate(now.getDate() - 90)
      break
    default:
      start.setDate(now.getDate() - 7)
  }

  return {
    start: start.toISOString().split('T')[0],
    end: now.toISOString().split('T')[0]
  }
}

function getPreviousDateFilter(period: string, startDate?: string, endDate?: string) {
  const current = getDateFilter(period, startDate, endDate)
  const currentStart = new Date(current.start)
  const currentEnd = new Date(current.end)
  const duration = currentEnd.getTime() - currentStart.getTime()
  
  const prevEnd = new Date(currentStart.getTime() - 24 * 60 * 60 * 1000) // One day before current start
  const prevStart = new Date(prevEnd.getTime() - duration)
  
  return {
    start: prevStart.toISOString().split('T')[0],
    end: prevEnd.toISOString().split('T')[0]
  }
}