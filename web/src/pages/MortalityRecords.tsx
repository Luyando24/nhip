import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Activity, Search, Filter } from 'lucide-react';

const MortalityRecords: React.FC = () => {
  const { data: records, isLoading } = useQuery({
    queryKey: ['mortality-records'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('death_records')
        .select(`
          id,
          patient_age_years,
          patient_sex,
          patient_district,
          primary_cause_icd11,
          primary_cause_label,
          time_of_death,
          ward,
          facilities ( name, province )
        `)
        .order('time_of_death', { ascending: false });
        
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-12 bg-slate-200 rounded-xl mb-8"></div>
        {[1,2,3,4,5].map(i => <div key={i} className="h-20 bg-slate-200 rounded-xl"></div>)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Activity className="text-primary" size={32} />
            Mortality Records Registry
          </h1>
          <p className="text-slate-500 font-medium">National registry of all documented mortalities.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-slate-50">
            <Filter size={18} /> Filter
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search records..." 
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>
      </header>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Patient</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Location</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Primary Cause</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ICD-11 Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records?.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 font-medium italic">
                    No mortality records found for your facility or jurisdiction.
                  </td>
                </tr>
              )}
              {records?.map((record: any) => (
                <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="font-semibold text-slate-800">
                      {new Date(record.time_of_death).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      {new Date(record.time_of_death).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-slate-800 capitalize">
                      {record.patient_sex}, {record.patient_age_years} yrs
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      Origin: {record.patient_district}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-primary">
                      {record.facilities?.name || 'Unknown Facility'}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      {record.ward} • {record.facilities?.province || 'Unknown Province'}
                    </div>
                  </td>
                  <td className="p-4 font-semibold text-slate-800">
                    {record.primary_cause_label}
                  </td>
                  <td className="p-4">
                    <span className="bg-primary/10 text-primary px-2.5 py-1 rounded font-bold font-mono text-xs">
                      {record.primary_cause_icd11}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MortalityRecords;
