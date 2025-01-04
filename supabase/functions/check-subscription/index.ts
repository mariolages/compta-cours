import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  );

  try {
    console.log('🔍 Starting subscription check...');
    
    const authHeader = req.headers.get('Authorization')!;
    console.log('📝 Auth header present:', !!authHeader);
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      console.error('❌ User error:', userError);
      throw new Error('User not found');
    }

    console.log('👤 User found:', user.id);
    console.log('📧 User email:', user.email);

    if (!user.email) {
      console.error('❌ No email found for user');
      throw new Error('No email found');
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Recherche directe par customer ID dans la table subscriptions
    console.log('🔍 Checking local subscription record...');
    const { data: localSub } = await supabaseClient
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    let customerId = localSub?.stripe_customer_id;

    if (!customerId) {
      console.log('🔍 No local customer ID, searching by email:', user.email);
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1
      });

      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        console.log('✅ Found customer ID:', customerId);
      } else {
        console.log('❌ No customer found for email:', user.email);
        return new Response(
          JSON.stringify({ subscribed: false }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log('🔍 Checking Stripe subscriptions for customer:', customerId);
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 100
    });

    console.log('📊 Found subscriptions:', subscriptions.data.length);
    const hasActiveSubscription = subscriptions.data.some(subscription => 
      subscription.status === 'active' && 
      subscription.items.data.some(item => 
        item.price.id === 'price_1QdcI0II3n6IJC5voYqaw2hs' || // Monthly price ID
        item.price.id === 'price_1QdcIaII3n6IJC5vECDkmJXr'    // Annual price ID
      )
    );

    console.log('✅ Has active subscription:', hasActiveSubscription);

    if (hasActiveSubscription) {
      console.log('📝 Updating subscription in Supabase');
      const { error: upsertError } = await supabaseClient
        .from('subscriptions')
        .upsert({
          user_id: user.id,
          status: 'active',
          stripe_customer_id: customerId,
        }, {
          onConflict: 'user_id'
        });

      if (upsertError) {
        console.error('❌ Error updating subscription:', upsertError);
      } else {
        console.log('✅ Successfully updated subscription record');
      }
    } else {
      console.log('📝 Marking subscription as inactive');
      const { error: updateError } = await supabaseClient
        .from('subscriptions')
        .update({ status: 'inactive' })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('❌ Error updating subscription:', updateError);
      }
    }

    return new Response(
      JSON.stringify({ 
        subscribed: hasActiveSubscription,
        customerId,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in check-subscription:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});