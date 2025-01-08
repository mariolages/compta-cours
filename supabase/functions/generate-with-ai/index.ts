import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, mode } = await req.json();

    let systemPrompt = '';
    
    switch (mode) {
      case 'summary':
        systemPrompt = "Tu es un assistant spécialisé dans la création de résumés clairs et concis. Résume le texte suivant en gardant les points essentiels :";
        break;
      case 'quiz':
        systemPrompt = "Tu es un expert en création de quiz pédagogiques. Génère 5 questions de quiz pertinentes basées sur le texte suivant, avec 4 options de réponse pour chaque question. Indique la bonne réponse. Format : Q1. [Question] A) [Option] B) [Option] C) [Option] D) [Option] Réponse: [Lettre]";
        break;
      default:
        systemPrompt = "Tu es un assistant pédagogique expert qui aide les étudiants à comprendre leurs cours et à répondre à leurs questions. Sois précis et donne des exemples concrets quand c'est pertinent.";
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: mode === 'quiz' ? 0.8 : 0.7,
      }),
    });

    const data = await response.json();
    const generatedText = data.choices[0].message.content;

    return new Response(JSON.stringify({ generatedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});