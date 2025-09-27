import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScarcityState {
  id: string;
  virtual_spots_taken: number;
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
    console.log('📊 Current state:', { virtual_spots_taken: state.virtual_spots_taken });

    // Get current spots left using database function
    const { data: spotsLeft, error: spotsError } = await supabase
      .rpc('get_virtual_spots_left');

    if (spotsError) {
      console.error('❌ Error getting spots left:', spotsError);
      throw spotsError;
    }

    console.log('🎯 Current spots left:', spotsLeft);

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

    // Calculate decrease amount based on time
    const currentHour = new Date().getHours();
    const { peak_start, peak_end, peak_multiplier } = state.peak_hours_config;
    const isPeakHour = currentHour >= peak_start && currentHour <= peak_end;
    
    // Base decrease: 3-8 spots
    let decreaseAmount = Math.floor(Math.random() * 6) + 3; // 3-8 range
    
    // Apply peak hour multiplier
    if (isPeakHour) {
      decreaseAmount = Math.floor(decreaseAmount * peak_multiplier);
    }

    // Ensure we don't go below 3 spots
    const maxDecrease = spotsLeft - 3;
    decreaseAmount = Math.min(decreaseAmount, maxDecrease);

    if (decreaseAmount <= 0) {
      console.log('⚠️ Cannot decrease without going below minimum');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Cannot decrease below minimum spots',
          spots_left: spotsLeft 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📉 Decreasing by ${decreaseAmount} spots (peak: ${isPeakHour})`);

    // Update virtual spots taken
    const { error: updateError } = await supabase
      .from('founding_scarcity_state')
      .update({
        virtual_spots_taken: state.virtual_spots_taken + decreaseAmount,
        last_update: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', state.id);

    if (updateError) {
      console.error('❌ Error updating scarcity state:', updateError);
      throw updateError;
    }

    const newSpotsLeft = spotsLeft - decreaseAmount;
    console.log('✅ Scarcity updated successfully');
    console.log(`📊 New spots left: ${newSpotsLeft}`);

    return new Response(
      JSON.stringify({
        success: true,
        decreased_by: decreaseAmount,
        spots_left: newSpotsLeft,
        was_peak_hour: isPeakHour,
        hour: currentHour
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