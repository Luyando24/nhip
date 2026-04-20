import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { Brain, ArrowLeft, Loader2, Sparkles, AlertCircle, Target, CheckCircle } from 'lucide-react';

const Questions = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [studyDesign, setStudyDesign] = useState('cross_sectional');
  const [context, setContext] = useState('');
  const { accessToken } = useAuthStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<any>(null);

  const { data: proposal } = useQuery({
    queryKey: ['proposal', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('research_proposals').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    }
  });

  const generateQuestions = async () => {
    setIsGenerating(true);
    try {
      if (!accessToken) {
        alert("Authentication Error: No access token found. Please log out and log back in.");
        return;
      }

      // Get aggregated view data constraint
      const { data: viewData } = await supabase.from('research_mortality_view').select('*').limit(50);
      
      // Get current session explicitly for the latest token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || accessToken;

      if (!token) {
        alert("Authentication Error: Your session has expired. Please log out and back in.");
        setIsGenerating(false);
        return;
      }

      // 1. We use standard fetch to have 100% control over headers
      // 2. We use the public URL + /v1/functions/ + name
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-research-questions`;

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          proposalId: id,
          studyDesign,
          additionalContext: context,
          contextData: viewData || { note: 'Fallback mortality context' }
        })
      });

      let result: any;
      const contentType = response.headers.get('content-type');
      
      try {
        if (contentType && contentType.includes('application/json')) {
          result = await response.json();
        } else {
          const text = await response.text();
          result = { success: false, error: 'INFRASTRUCTURE_ERROR', details: text || `Status ${response.status}: ${response.statusText}` };
        }
      } catch (e: any) {
        result = { success: false, error: 'PARSE_ERROR', details: 'Failed to parse service response.' };
      }

      if (!response.ok || result.success === false) {
          // This is our high-transparency error from the Edge Function
          console.error('AI Service Detailed Error:', result);
          let rec = "";
          if (result.error === 'Forbidden') rec = "Tip: Your user role must be 'research_partner'.";
          if (result.error === 'AI_SERVICE_ERROR') rec = "Tip: Verify your Anthropic API Key and credits.";
          if (result.error === 'INFRASTRUCTURE_ERROR') rec = "Tip: This usually means the Supabase function failed to start or was not found.";
          
          alert(`Intelligence Protocol Error (${result.error || response.status})\n\n${result.details || 'No details available'}\n\n${rec}`);
          return;
      }
      
      setGeneratedResult(result.data);
    } catch (error: any) {
      console.error('[TRACE] Global Catch Error:', error);
      alert("System Interface Error\n\n" + (error.message || 'An unexpected error occurred.'));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/research/portal')} className="text-sm font-bold text-slate-500 hover:text-primary flex gap-2 items-center">
        <ArrowLeft size={16} /> Back to Portal
      </button>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold tracking-tight mb-2">Claim & Refine Hypothesis</h2>
        <p className="text-slate-500 mb-6 font-medium bg-slate-50 p-4 border rounded-xl">{proposal?.title || 'Loading...'}</p>

        <div className="space-y-6 max-w-3xl">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Study Design</label>
            <select value={studyDesign} onChange={(e) => setStudyDesign(e.target.value)} className="input w-full">
              <option value="cross_sectional">Cross-Sectional Study</option>
              <option value="cohort">Cohort Study</option>
              <option value="rct">Randomized Controlled Trial (RCT)</option>
              <option value="qualitative">Qualitative / Ethnographic</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Additional Research Context / Literature Focus</label>
            <textarea 
              rows={4} 
              value={context} 
              onChange={e => setContext(e.target.value)}
              className="input w-full resize-none" 
              placeholder="e.g. Focus on community clinic drug availability..."
            ></textarea>
          </div>

          <button 
            onClick={generateQuestions} 
            disabled={isGenerating}
            className="btn-primary w-full py-4 text-lg items-center justify-center gap-3 disabled:opacity-75 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform blur-sm"></div>
            {isGenerating ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={24} />}
            {isGenerating ? 'Synthesizing Data with Claude AI...' : 'Generate PICO Questions'}
          </button>
        </div>
      </div>

      {generatedResult && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl mt-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary text-white p-2 rounded-lg"><Brain size={24} /></div>
            <h3 className="text-2xl font-black text-slate-900">Generated Implementation Protocol</h3>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border shadow-sm">
              <h4 className="text-xs uppercase font-bold tracking-widest text-primary mb-2">Primary Question</h4>
              <p className="text-lg font-semibold text-slate-800 leading-relaxed">
                {generatedResult.primary_question}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {['population', 'intervention', 'comparison', 'outcome'].map(pico => (
                generatedResult[`pico_${pico}`] ? (
                  <div key={pico} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <h5 className="font-bold text-slate-800 capitalize flex gap-2 items-center">
                      <span className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">{pico.charAt(0).toUpperCase()}</span>
                      {pico}
                    </h5>
                    <p className="text-sm text-slate-600 mt-2">{generatedResult[`pico_${pico}`]}</p>
                  </div>
                ) : null
              ))}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
               <h4 className="text-xs uppercase font-bold tracking-widest text-slate-500 mb-3">Secondary Objectives</h4>
               <ul className="space-y-3">
                 {generatedResult.secondary_questions?.map((q: string, i: number) => (
                   <li key={i} className="flex gap-3 text-sm font-medium text-slate-700">
                     <span className="text-primary mt-0.5"><Target size={16}/></span>
                     {q}
                   </li>
                 ))}
               </ul>
            </div>
            
            <button className="w-full btn-primary bg-slate-900 border-none shadow-xl hover:bg-slate-800 py-4 flex gap-2 justify-center mt-4">
              <CheckCircle size={20} /> Convert to REDCap Workflow
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Questions;
