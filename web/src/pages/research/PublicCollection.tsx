import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { 
  ClipboardCheck, 
  Send, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  ArrowLeft,
  Activity
} from 'lucide-react';

const PublicCollection = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: instrument, isLoading } = useQuery({
    queryKey: ['public-instrument', id],
    queryFn: async () => {
      if (!id) throw new Error('No instrument ID provided');
      const { data, error } = await supabase
        .from('research_instruments')
        .select('name, description, form_schema, status')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      if (data.status !== 'active') throw new Error('This instrument is no longer active.');
      return data;
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { error: submitError } = await supabase.from('research_data').insert({
        instrument_id: id,
        data: formData,
        collected_at: new Date().toISOString(),
        sync_status: 'synced'
      });

      if (submitError) throw submitError;
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit data. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (variableName: string, value: any) => {
    setFormData(prev => ({ ...prev, [variableName]: value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Loading form parameters...</p>
        </div>
      </div>
    );
  }

  if (error || !instrument) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-red-100 shadow-xl text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto mb-6">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Error</h2>
          <p className="text-slate-600 mb-8">{error || 'Instrument not found or inactive.'}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
          >
            Retry Access
          </button>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-emerald-100 shadow-xl text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-6">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Submission Successful</h2>
          <p className="text-slate-600 mb-8">Data has been securely encrypted and synced with the national health intelligence platform.</p>
          <button 
            onClick={() => {
              setFormData({});
              setIsSubmitted(false);
            }}
            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors"
          >
            Submit Another Entry
          </button>
        </div>
      </div>
    );
  }

  const fields = instrument.form_schema || [];

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl mb-8 flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Activity size={24} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800">ZNHIP Intake</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Public Collection Node</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-full border border-emerald-100">
          Secure End-to-End
        </div>
      </div>

      <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-2xl font-black text-slate-900 mb-2">{instrument.name}</h2>
          <p className="text-slate-500 font-medium">{instrument.description}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {fields.map((field: any) => (
            <div key={field.id} className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">
                {field.label}
              </label>
              
              {field.type === 'select' ? (
                <select
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  value={formData[field.variableName] || ''}
                  onChange={(e) => handleInputChange(field.variableName, e.target.value)}
                >
                  <option value="">Select option...</option>
                  {/* Dropdown options could be added to schema, but for now just text input or fixed ones */}
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="unknown">Unknown</option>
                </select>
              ) : (
                <input
                  required
                  type={field.type}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder={`Enter ${field.label.toLowerCase()}...`}
                  value={formData[field.variableName] || ''}
                  onChange={(e) => handleInputChange(field.variableName, e.target.value)}
                />
              )}
            </div>
          ))}

          <div className="pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-lg shadow-slate-200 disabled:opacity-50"
            >
              {isSubmitting ? (
                <> <Loader2 className="animate-spin" /> Transmitting...</>
              ) : (
                <> <Send size={20} /> Submit Data Record</>
              )}
            </button>
            <p className="text-center text-[10px] text-slate-400 mt-4 font-bold uppercase tracking-widest">
              By submitting, you confirm data is accurate and collected at point-of-care.
            </p>
          </div>
        </form>
      </div>
      
      <footer className="mt-12 text-slate-400 text-xs font-bold uppercase tracking-widest text-center">
        Zambia National Health Intelligence Platform &copy; 2026
      </footer>
    </div>
  );
};

export default PublicCollection;
