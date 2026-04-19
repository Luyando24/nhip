import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { FileText, Brain, Sparkles, Target, CheckCircle, Clock } from 'lucide-react';

const Research: React.FC = () => {
  const { data: proposals, isLoading } = useQuery({
    queryKey: ['research-proposals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('research_proposals')
        .select('*')
        .order('priority_score', { ascending: false });
        
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-12 bg-slate-200 rounded-xl w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-200 rounded-xl"></div>)}
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'reviewed': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle size={16} />;
      case 'reviewed': return <Target size={16} />;
      default: return <Clock size={16} />;
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Brain className="text-primary" size={32} />
            Research & AI Intelligence
          </h1>
          <p className="text-slate-500 font-medium">Algorithmic study proposals derived from real-time mortality telemetry.</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Sparkles size={18} fill="currentColor" /> Generate Hypothesis
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {proposals?.map((proposal: any) => (
          <div key={proposal.id} className="card group hover:shadow-lg transition-all border-t-4 border-t-primary relative overflow-hidden">
            {/* Background design */}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
            
            <div className="flex justify-between items-start mb-4">
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border ${getStatusColor(proposal.status)}`}>
                {getStatusIcon(proposal.status)} {proposal.status}
              </span>
              
              <div className="text-right">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block">Priority Score</span>
                <span className={`text-2xl font-black ${proposal.priority_score > 0.8 ? 'text-red-500' : 'text-slate-700'}`}>
                  {Math.round(proposal.priority_score * 100)}%
                </span>
              </div>
            </div>

            <h3 className="text-xl font-bold text-slate-800 mb-3 pr-8 leading-tight">
              {proposal.title}
            </h3>
            
            <p className="text-slate-600 mb-6 bg-slate-50 p-4 rounded-xl text-sm leading-relaxed border border-slate-100">
              {proposal.summary}
            </p>

            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                <FileText size={14} className="text-primary" /> Evidence Basis
              </h4>
              <p className="text-sm font-medium text-slate-500">
                {proposal.evidence_basis}
              </p>
            </div>
            
            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Generated automatically by telemetry</span>
              <button className="text-sm font-bold text-primary hover:text-primary-dark transition-colors flex items-center gap-1">
                View Dataset &rarr;
              </button>
            </div>
          </div>
        ))}

        {proposals?.length === 0 && (
          <div className="lg:col-span-2 py-20 text-center bg-white border border-dashed border-slate-300 rounded-2xl">
            <Brain className="mx-auto text-slate-300 mb-4" size={48} />
            <h3 className="text-xl font-bold text-slate-700">No Proposals Generated</h3>
            <p className="text-slate-500 font-medium mt-2">The AI module requires more longitudinal data to formulate valid research hypotheses.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Research;
