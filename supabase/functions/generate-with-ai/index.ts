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
    const { prompt, fileContent } = await req.json();
    console.log("Received prompt:", prompt);
    console.log("File content length:", fileContent?.length || 0);

    let systemPrompt = `Tu es un assistant pédagogique expert qui aide à comprendre et à expliquer le contenu. 
    Réponds de manière claire et concise, en utilisant un langage simple.`;

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
          { role: 'user', content: fileContent ? `Contexte: ${fileContent}\n\nQuestion: ${prompt}` : prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error("OpenAI API error:", await response.text());
      throw new Error(`OpenAI API responded with status ${response.status}`);
    }

    const data = await response.json();
    console.log("OpenAI response received:", data);

    if (!data.choices?.[0]?.message?.content) {
      throw new Error("Unexpected response format from OpenAI");
    }

    const generatedText = data.choices[0].message.content;
    console.log("Generated text:", generatedText);

    return new Response(JSON.stringify({ generatedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-with-ai function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});