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
    const { price_id, success_url, cancel_url } = await req.json();
    console.log('Price ID received:', price_id);
    console.log('Success URL:', success_url);
    console.log('Cancel URL:', cancel_url);

    if (!price_id) {
      throw new Error('Price ID is required');
    }

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader) {
      throw new Error('Authorization header missing');
    }

    // Initialize Supabase client with service role key for admin access
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get user data using the service role client
    const token = authHeader.replace('Bearer ', '');
    console.log('Token received:', token);
    
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError) {
      console.error('Error fetching user:', userError);
      throw userError;
    }

    if (!user) {
      throw new Error('User not found');
    }

    const email = user?.email;

    if (!email) {
      throw new Error('Email not found');
    }

    console.log('User email:', email);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    });

    // Check for existing customer
    console.log('Checking for existing Stripe customer...');
    const customers = await stripe.customers.list({
      email: email,
      limit: 1
    });

    let customerId = undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log('Existing customer found:', customerId);
    }

    // Get the price to determine if it's recurring
    const price = await stripe.prices.retrieve(price_id);
    const isRecurring = price.type === 'recurring';
    console.log('Price type:', price.type);

    // Create checkout session with appropriate mode
    console.log('Creating checkout session...');
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : email,
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      mode: isRecurring ? 'subscription' : 'payment',
      success_url: success_url || `${req.headers.get('origin')}/dashboard`,
      cancel_url: cancel_url || `${req.headers.get('origin')}/subscription`,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      payment_method_types: ['card'],
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