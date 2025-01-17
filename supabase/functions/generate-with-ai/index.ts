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

    let systemPrompt = `Tu es un assistant pédagogique expert qui aide à créer des quiz éducatifs. 
    Pour chaque question, génère une question pertinente avec une réponse correcte et trois réponses incorrectes mais plausibles.
    Réponds UNIQUEMENT avec un tableau JSON valide contenant exactement 5 questions.`;

    let userPrompt = `Basé sur ce contenu: "${fileContent}", génère 5 questions de quiz au format suivant:
    [
      {
        "question": "La question",
        "correct_answer": "La bonne réponse",
        "options": ["La bonne réponse", "Mauvaise réponse 1", "Mauvaise réponse 2", "Mauvaise réponse 3"]
      }
    ]`;

    console.log("Sending request to OpenAI with content length:", fileContent.length);
    
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
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error("OpenAI API error:", await response.text());
      throw new Error(`OpenAI API responded with status ${response.status}`);
    }

    const data = await response.json();
    console.log("OpenAI response:", JSON.stringify(data));

    if (!data.choices?.[0]?.message?.content) {
      throw new Error("Unexpected response format from OpenAI");
    }

    const generatedText = data.choices[0].message.content;
    console.log("Generated text:", generatedText);

    let questions;
    try {
      // Try to extract JSON if the response contains additional text
      const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
      const jsonString = jsonMatch ? jsonMatch[0] : generatedText;
      questions = JSON.parse(jsonString);

      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error("Generated content is not a valid array");
      }

      // Validate each question's format
      questions = questions.map(q => {
        if (!q.question || !q.correct_answer || !Array.isArray(q.options)) {
          throw new Error("Invalid question format");
        }
        return {
          question: q.question,
          correct_answer: q.correct_answer,
          options: q.options
        };
      });

    } catch (error) {
      console.error("Failed to parse OpenAI response:", error);
      console.error("Raw response:", generatedText);
      throw new Error("Failed to parse generated questions");
    }

    return new Response(JSON.stringify(questions), {
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