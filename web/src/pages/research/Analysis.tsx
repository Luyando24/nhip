import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { BarChart2, Filter, Download, Activity, Map } from 'lucide-react';

const Analysis = () => {
  const [groupBy, setGroupBy] = useState('age_group');
  const [province, setProvince] = useState('All');

  const { data: results, isLoading } = useQuery({
    queryKey: ['mortality-analysis', groupBy, province],
    queryFn: async () => {
      let query = supabase.from('research_mortality_view').select('*');
      
      if (province !== 'All') {
        query = query.eq('province', province);
      }
      
      const { data, error } = await query;
      if (error) throw error;

      // Grouping data for visualization securely loaded via `research_mortality_view` RLS wrapper
      const aggregated: Record<string, number> = {};
      data.forEach(row => {
        const key = row[groupBy] || 'Unknown';
        aggregated[key] = (aggregated[key] || 0) + row.death_count;
      });

      return Object.keys(aggregated).map(k => ({ name: k, count: aggregated[k] }));
    }
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Left sidebar filters */}
      <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 h-fit space-y-6">
        <h3 className="font-bold flex items-center gap-2 text-slate-800"><Filter size={18}/> Filters Builder</h3>
        
        <div className="space-y-4 text-sm">
           <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Group By</label>
              <select value={groupBy} onChange={e => setGroupBy(e.target.value)} className="input w-full p-2 bg-slate-50">
                <option value="age_group">Age Group</option>
                <option value="patient_sex">Patient Sex</option>
                <option value="province">Province</option>
                <option value="facility_type">Facility Type</option>
                <option value="primary_cause_label">ICD-11 Cause</option>
              </select>
           </div>
           
           <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Province</label>
              <select value={province} onChange={e => setProvince(e.target.value)} className="input w-full p-2 bg-slate-50">
                <option value="All">All Provinces</option>
                <option value="Lusaka">Lusaka</option>
                <option value="Copperbelt">Copperbelt</option>
                <option value="Southern">Southern</option>
                <option value="Central">Central</option>
              </select>
           </div>

           <div className="pt-4 border-t border-slate-100 flex gap-2">
             <button className="flex-1 btn-primary py-2 text-xs flex justify-center gap-2"><Activity size={14}/> Run</button>
             <button className="flex-1 border bg-white rounded-xl font-medium text-slate-600 hover:bg-slate-50 py-2 text-xs flex justify-center gap-2"><Download size={14}/> Export</button>
           </div>
        </div>
      </div>

      {/* Main Results panel */}
      <div className="lg:col-span-3 bg-white p-8 rounded-2xl border border-slate-200">
        <div className="flex justify-between items-center mb-8">
           <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800"><BarChart2 size={24} className="text-primary"/> Live Output</h3>
           <span className="text-xs font-mono font-bold bg-slate-100 text-slate-500 py-1.5 px-3 rounded-full flex gap-2 items-center">
             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
             Aggregated View <span className="opacity-50">(`N&ge;5` suppressed)</span>
           </span>
        </div>

        {isLoading ? (
          <div className="h-96 w-full animate-pulse bg-slate-50 rounded-xl"></div>
        ) : (
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={results} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}} 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

export default Analysis;
