import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScarcityState {
  id: string;
  virtual_spots_taken: number;
  daily_target_decrease: number;
  daily_consumed_spots: number;
  cycle_start_date: string;
  accumulated_decrease: number;
  last_update: string;
  peak_hours_config: {
    peak_start: number;
    peak_end: number;
    peak_multiplier: number;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🔥 Starting founding scarcity update...');

    // Get current scarcity state
    const { data: scarcityState, error: stateError } = await supabase
      .from('founding_scarcity_state')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (stateError) {
      console.error('❌ Error fetching scarcity state:', stateError);
      throw stateError;
    }

    const state = scarcityState as ScarcityState;
    console.log('📊 Current state:', { 
      virtual_spots_taken: state.virtual_spots_taken,
      daily_consumed: state.daily_consumed_spots,
      cycle_day: Math.floor((Date.now() - new Date(state.cycle_start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1
    });

    // Get real members count
    const { count: realMembersCount, error: membersError } = await supabase
      .from('founding_members')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'registered');

    if (membersError) {
      console.error('❌ Error getting real members:', membersError);
      throw membersError;
    }

    // Get current spots left using database function
    const { data: spotsLeft, error: spotsError } = await supabase
      .rpc('get_virtual_spots_left');

    if (spotsError) {
      console.error('❌ Error getting spots left:', spotsError);
      throw spotsError;
    }

    console.log('🎯 Current spots left:', spotsLeft, '| Real members:', realMembersCount || 0);

    // Only proceed if we have more than 3 spots
    if (spotsLeft <= 3) {
      console.log('⚠️ Already at minimum spots (3), skipping update');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Already at minimum spots',
          spots_left: spotsLeft 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if we need to reset daily counter (new day)
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const cycleStartDate = new Date(state.cycle_start_date).toISOString().split('T')[0];
    const lastUpdateDate = new Date(state.last_update).toISOString().split('T')[0];
    
    let currentDailyConsumed = state.daily_consumed_spots;
    if (lastUpdateDate !== today) {
      currentDailyConsumed = 0; // Reset for new day
      console.log('🌅 New day detected, resetting daily counter');
    }

    // Calculate how many days into the 7-day cycle we are
    const cycleDay = Math.floor((now.getTime() - new Date(state.cycle_start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    console.log('📅 Cycle day:', cycleDay);

    // If cycle is complete (>7 days), reset everything
    if (cycleDay > 7) {
      console.log('🔄 7-day cycle complete, resetting...');
      await supabase
        .from('founding_scarcity_state')
        .update({
          virtual_spots_taken: Math.max(5, realMembersCount || 0), // Reset but account for real members
          daily_consumed_spots: 0,
          cycle_start_date: today,
          accumulated_decrease: 0,
          last_update: now.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('id', state.id);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Cycle reset',
          spots_left: 100 - Math.max(5, realMembersCount || 0),
          cycle_reset: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate target daily decrease adjusted for real sign-ups today
    const { count: todayRealSignups, error: signupsError } = await supabase
      .from('founding_members')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'registered')
      .gte('created_at', today + 'T00:00:00Z');
    const adjustedDailyTarget = Math.max(0, state.daily_target_decrease - (todayRealSignups || 0));
    
    console.log(`📈 Today's real signups: ${todayRealSignups || 0}, Adjusted virtual target: ${adjustedDailyTarget}`);

    // Calculate how much we should have decreased by now (smooth distribution)
    const hourlyTarget = adjustedDailyTarget / 24;
    const minutesSinceLastUpdate = (now.getTime() - new Date(state.last_update).getTime()) / (1000 * 60);
    const newAccumulation = state.accumulated_decrease + (hourlyTarget * minutesSinceLastUpdate / 60);
    
    // Only decrease if we've accumulated at least 1 spot worth and haven't exceeded daily target
    const shouldDecrease = newAccumulation >= 1 && currentDailyConsumed < adjustedDailyTarget;
    
    if (!shouldDecrease) {
      console.log('⏳ Not enough accumulation or daily target reached, skipping decrease');
      
      // Update accumulated decrease even if not decreasing
      await supabase
        .from('founding_scarcity_state')
        .update({
          accumulated_decrease: newAccumulation,
          last_update: now.toISOString(),
          daily_consumed_spots: currentDailyConsumed
        })
        .eq('id', state.id);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No decrease needed',
          spots_left: spotsLeft,
          accumulated: newAccumulation.toFixed(2),
          daily_consumed: currentDailyConsumed,
          daily_target: adjustedDailyTarget
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate actual decrease amount (floor of accumulation)
    const decreaseAmount = Math.floor(newAccumulation);
    const remainingAccumulation = newAccumulation - decreaseAmount;
    
    // Ensure we don't go below 3 spots or exceed daily target
    const maxDecrease = Math.min(decreaseAmount, spotsLeft - 3, adjustedDailyTarget - currentDailyConsumed);
    const finalDecrease = Math.max(0, maxDecrease);

    if (finalDecrease <= 0) {
      console.log('⚠️ Cannot decrease without violating constraints');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Decrease blocked by constraints',
          spots_left: spotsLeft 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📉 Systematic decrease: ${finalDecrease} spots (accumulated: ${newAccumulation.toFixed(2)})`);

    // Update virtual spots taken
    const { error: updateError } = await supabase
      .from('founding_scarcity_state')
      .update({
        virtual_spots_taken: state.virtual_spots_taken + finalDecrease,
        daily_consumed_spots: currentDailyConsumed + finalDecrease,
        accumulated_decrease: remainingAccumulation,
        last_update: now.toISOString(),
        updated_at: now.toISOString()
      })
      .eq('id', state.id);

    if (updateError) {
      console.error('❌ Error updating scarcity state:', updateError);
      throw updateError;
    }

    const newSpotsLeft = spotsLeft - finalDecrease;
    console.log('✅ Scarcity updated successfully');
    console.log(`📊 New spots left: ${newSpotsLeft}`);

    return new Response(
      JSON.stringify({
        success: true,
        decreased_by: finalDecrease,
        spots_left: newSpotsLeft,
        daily_consumed: currentDailyConsumed + finalDecrease,
        daily_target: adjustedDailyTarget,
        cycle_day: cycleDay,
        real_members: realMembersCount || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in founding-scarcity-updater:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});