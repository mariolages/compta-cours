import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  );

  try {
    console.log('🔍 Starting subscription check...');
    
    // Get the session or user object
    const authHeader = req.headers.get('Authorization')!;
    console.log('📝 Auth header present:', !!authHeader);
    
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    const email = user?.email;

    console.log('👤 User ID:', user?.id);
    console.log('📧 User email:', email);

    if (!email) {
      console.error('❌ No email found for user');
      throw new Error('No email found');
    }

    console.log('🔎 Checking subscription for email:', email);

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Get customer by email
    console.log('🔍 Searching for Stripe customer with email:', email);
    const customers = await stripe.customers.list({
      email: email,
      limit: 1
    });

    console.log('👥 Found customers:', customers.data.length);

    if (customers.data.length === 0) {
      console.log('❌ No customer found for email:', email);
      return new Response(
        JSON.stringify({ subscribed: false }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    const customerId = customers.data[0].id;
    console.log('🆔 Customer ID:', customerId);

    // Check for active subscriptions
    console.log('🔍 Checking active subscriptions for customer:', customerId);
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 100
    });

    console.log('📊 Found subscriptions:', subscriptions.data.length);
    console.log('📝 Subscription details:', JSON.stringify(subscriptions.data.map(sub => ({
      id: sub.id,
      status: sub.status,
      items: sub.items.data.map(item => ({
        price_id: item.price.id,
        product_id: item.price.product
      }))
    })), null, 2));

    const hasActiveSubscription = subscriptions.data.some(subscription => 
      subscription.status === 'active' && 
      subscription.items.data.some(item => 
        item.price.id === 'price_1QdcI0II3n6IJC5voYqaw2hs' || // Monthly price ID
        item.price.id === 'price_1QdcIaII3n6IJC5vECDkmJXr'    // Annual price ID
      )
    );

    console.log('✅ Has active subscription:', hasActiveSubscription);

    // Update subscriptions table in Supabase
    if (hasActiveSubscription) {
      console.log('📝 Updating subscription in Supabase for user:', user.id);
      const { error: upsertError } = await supabaseClient
        .from('subscriptions')
        .upsert({
          user_id: user.id,
          status: 'active',
          stripe_customer_id: customerId,
        });

      if (upsertError) {
        console.error('❌ Error updating subscription in database:', upsertError);
      } else {
        console.log('✅ Successfully updated subscription in database');
      }
    }

    return new Response(
      JSON.stringify({ 
        subscribed: hasActiveSubscription,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Error checking subscription:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});