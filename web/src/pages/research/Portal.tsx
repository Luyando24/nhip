import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { FileText, Sparkles, Target, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Portal: React.FC = () => {
  const navigate = useNavigate();

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
    <div className="space-y-6">
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
              <button 
                onClick={() => navigate(`/research/questions/${proposal.id}`)}
                className="btn-primary py-2 px-4 flex items-center gap-2 text-sm"
              >
                <Sparkles size={16} /> Refine & Generate AI Questions
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Portal;
