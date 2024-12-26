// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, serviceRoleKey)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId } = await req.json()
    console.log('Attempting to delete user:', userId)

    // Vérifier que l'utilisateur qui fait la requête est admin
    const authHeader = req.headers.get('Authorization')!
    const adminClient = createClient(
      supabaseUrl,
      authHeader.replace('Bearer ', ''),
    )

    const { data: profile } = await adminClient
      .from('profiles')
      .select('is_admin')
      .eq('id', (await adminClient.auth.getUser()).data.user?.id)
      .single()

    if (!profile?.is_admin) {
      console.log('Unauthorized: User is not admin')
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('Admin verified, proceeding with user deletion')

    // Supprimer l'utilisateur
    const { error } = await supabase.auth.admin.deleteUser(userId)

    if (error) {
      console.error('Error deleting user:', error)
      throw error
    }

    console.log('User successfully deleted')

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error in delete-user function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})