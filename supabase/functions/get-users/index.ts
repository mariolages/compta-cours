import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log("Get users function started");

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Processing request:", req.method);
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify that the user making the request is an admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(token)

    if (userError || !user) {
      throw new Error('Invalid token')
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.is_admin) {
      throw new Error('User is not an admin')
    }

    console.log("Admin check passed, fetching users");

    // Get all users with their emails
    const { data: users, error: adminError } = await supabaseClient.auth.admin.listUsers()
    if (adminError) {
      console.error("Admin API error:", adminError);
      throw adminError
    }

    // Get profiles
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (profilesError) {
      console.error("Profiles fetch error:", profilesError);
      throw profilesError
    }

    // Combine the data
    const combinedUsers = profiles.map(profile => {
      const authUser = users.users.find(u => u.id === profile.id)
      return {
        ...profile,
        email: authUser?.email
      }
    })

    console.log("Successfully processed users data");

    return new Response(
      JSON.stringify(combinedUsers),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})