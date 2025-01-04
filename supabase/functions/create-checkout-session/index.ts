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

  try {
    console.log('Starting checkout session creation...');
    
    // Get the request body
    const { priceId, returnUrl } = await req.json();
    console.log('Price ID received:', priceId);
    console.log('Return URL received:', returnUrl);

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Get user data
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) {
      console.error('Error fetching user:', userError);
      throw userError;
    }

    if (!userData?.user) {
      throw new Error('User not found');
    }

    const user = userData.user;
    console.log('User found:', user.id);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    });

    // Check for existing customer
    console.log('Checking for existing Stripe customer...');
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1
    });

    let customerId = undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log('Existing customer found:', customerId);
      
      // Check for active subscription
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        price: priceId,
        limit: 1
      });

      if (subscriptions.data.length > 0) {
        throw new Error('You already have an active subscription');
      }
    }

    // Create checkout session
    console.log('Creating checkout session...');
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: returnUrl || `${req.headers.get('origin')}/dashboard`,
      cancel_url: `${req.headers.get('origin')}/subscription`,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      payment_method_types: ['card'],
      metadata: {
        user_id: user.id,
      },
    });

    console.log('Checkout session created:', session.id);
    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});