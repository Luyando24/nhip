import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Optional: Extract user role from users table
    const { data: userData } = await supabaseClient.from('users').select('role').eq('id', user.id).single();
    if (!userData || !['research_partner', 'ministry_admin'].includes(userData.role)) {
       return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { proposalId, studyDesign, additionalContext, contextData } = await req.json();

    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set');
    }

    const systemPrompt = `You are an epidemiology research assistant supporting health researchers
in Zambia. You generate precise, fundable research questions based on
mortality surveillance data. You always structure questions in PICO format
for quantitative studies or PEO format for epidemiological studies.
You never invent data. You only use the statistics provided to you.
You produce questions that are specific enough to guide a study protocol,
measurable with the data sources available, and answerable within a
12-month study period with reasonable resources. Always consider the
Zambian health system context: limited resources, high disease burden,
community health worker infrastructure, and the National Health Research
Authority ethics approval process. Do not request or reference individual patient data.

Please output your response as strict JSON in the following format:
{
  "primaryQuestion": "The main question",
  "secondaryQuestions": ["Q1", "Q2", "Q3"],
  "framework": "pico or peo",
  "pico_population": "...",
  "pico_intervention": "...",
  "pico_comparison": "...",
  "pico_outcome": "..."
}`;

    const promptContext = `
Create research questions for a study with the following context:

Study Design: ${studyDesign}
Additional Instructions from Researcher: ${additionalContext || 'None'}

Anonymized Mortality Statistics & Context:
${JSON.stringify(contextData, null, 2)}
`;

    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        max_tokens: 1024,
        temperature: 0.7,
        system: systemPrompt,
        messages: [{ role: 'user', content: promptContext }]
      })
    });

    if (!anthropicResponse.ok) {
      const err = await anthropicResponse.text();
      console.error('Anthropic API Error:', err);
      throw new Error('Failed to generate questions from Claude AI');
    }

    const aiData = await anthropicResponse.json();
    const content = aiData.content[0].text;
    
    // Parse JSON
    const parsed = JSON.parse(content);
    
    // Save to database
    const { data: savedQuestions, error: insertError } = await supabaseClient
      .from('research_questions')
      .insert({
        proposal_id: proposalId,
        generated_by: user.id,
        study_design: studyDesign,
        framework: parsed.framework?.toLowerCase().includes('pico') ? 'pico' : 'peo',
        pico_population: parsed.pico_population,
        pico_intervention: parsed.pico_intervention,
        pico_comparison: parsed.pico_comparison,
        pico_outcome: parsed.pico_outcome,
        primary_question: parsed.primaryQuestion,
        secondary_questions: parsed.secondaryQuestions,
        context_data: contextData,
        status: 'draft'
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return new Response(JSON.stringify(savedQuestions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
