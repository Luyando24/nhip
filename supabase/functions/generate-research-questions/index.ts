import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    console.log('[TRACE] Authorization Header Presence:', !!authHeader);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader! } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('[TRACE] Auth Check Failed:', authError);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Unauthorized', 
        details: authError?.message || 'User session invalid or Authorization header missing' 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('[TRACE] User Identified:', user.id);

    // Optional: Extract user role from users table
    const { data: userData, error: roleError } = await supabaseClient.from('users').select('role').eq('id', user.id).single();
    
    if (roleError) {
      console.error('[TRACE] Role Fetch Error:', roleError);
    } else {
      console.log('[TRACE] User Role found:', userData?.role);
    }

    if (!userData || !['research_partner', 'ministry_admin'].includes(userData.role)) {
       console.warn('[TRACE] Access Denied: Insufficient role', userData?.role);
       return new Response(JSON.stringify({ 
         success: false,
         error: 'Forbidden',
         details: `Your current role (${userData?.role || 'unknown'}) does not have permission to generate research questions.`
       }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const payload = await req.json();
    const { proposalId, studyDesign, additionalContext, contextData } = payload;
    console.log('[TRACE] Request Payload Received for Proposal:', proposalId);

    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      console.error('[TRACE] Missing ANTHROPIC_API_KEY secret');
      throw new Error('ANTHROPIC_API_KEY is not set in Supabase secrets');
    }

    // ... (systemPrompt definition remains same) ...
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

    console.log(`[TRACE] Anthropic call for design: ${studyDesign}, context len: ${promptContext.length}`);

    const startTime = Date.now();
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 1536,
        temperature: 0.5,
        system: systemPrompt,
        messages: [{ role: 'user', content: promptContext }]
      })
    });

    const elapsed = Date.now() - startTime;
    console.log(`[TRACE] Anthropic API returned with status: ${anthropicResponse.status} in ${elapsed}ms`);

    if (!anthropicResponse.ok) {
      const err = await anthropicResponse.text();
      console.error('[TRACE] Anthropic API Error Body:', err);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'AI_SERVICE_ERROR', 
        details: `Claude API Error (${anthropicResponse.status}): ${err}` 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const aiData = await anthropicResponse.json();
    let content = aiData.content[0].text;
    
    if (content.includes('```json')) {
      content = content.split('```json')[1].split('```')[0].trim();
    } else if (content.includes('```')) {
      content = content.split('```')[1].split('```')[0].trim();
    }
    
    const jsonStart = content.indexOf('{');
    const jsonEnd = content.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      content = content.substring(jsonStart, jsonEnd + 1);
    }
    
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (parseErr) {
      console.error('[TRACE] JSON Parse Failure:', parseErr);
      return new Response(JSON.stringify({ success: false, error: 'PARSE_ERROR', details: 'AI returned malformed JSON' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
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
      console.error('[TRACE] Database Insert Error:', insertError);
      return new Response(JSON.stringify({ success: false, error: 'DATABASE_ERROR', details: insertError.message }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true, data: savedQuestions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('[TRACE] Global Catch Error:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: 'SYSTEM_ERROR', 
      details: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }
});
