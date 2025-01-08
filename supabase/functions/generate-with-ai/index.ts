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

    let systemPrompt = "Tu es un assistant pédagogique expert qui aide à créer des quiz éducatifs. Pour chaque question, génère une question pertinente avec une réponse correcte et trois réponses incorrectes mais plausibles.";
    let userPrompt = `Basé sur ce contenu: "${fileContent}", génère 5 questions de quiz au format suivant:
    [
      {
        "question": "La question",
        "correct_answer": "La bonne réponse",
        "options": ["La bonne réponse", "Mauvaise réponse 1", "Mauvaise réponse 2", "Mauvaise réponse 3"]
      }
    ]`;

    console.log("Sending request to OpenAI with content length:", fileContent.length);
    
    // Add exponential backoff for retries
    let retries = 3;
    let delay = 1000;
    let response;
    let error;

    while (retries > 0) {
      try {
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
          }),
        });

        if (response.status === 429) {
          console.log(`Rate limited, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
          retries--;
          continue;
        }

        break;
      } catch (e) {
        error = e;
        console.error("Error calling OpenAI:", e);
        retries--;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
        }
      }
    }

    if (!response?.ok) {
      throw new Error(`OpenAI API responded with status ${response?.status}`);
    }

    const data = await response.json();
    console.log("OpenAI response:", data);

    if (!data.choices?.[0]?.message?.content) {
      throw new Error("Unexpected response format from OpenAI");
    }

    const generatedText = data.choices[0].message.content;
    let questions;
    
    try {
      questions = JSON.parse(generatedText);
      if (!Array.isArray(questions)) {
        throw new Error("Generated content is not an array");
      }
    } catch (error) {
      console.error("Failed to parse OpenAI response as JSON:", error);
      throw new Error("Failed to parse generated questions");
    }

    return new Response(JSON.stringify(questions), {
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