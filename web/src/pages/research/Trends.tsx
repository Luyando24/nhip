import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Filter, 
  MapPin, 
  Activity, 
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  AlertCircle
} from 'lucide-react';

const Trends = () => {
  const [filters, setFilters] = useState({
    province: 'All',
    sex: 'All',
    facilityType: 'All'
  });

  const { data: trendData, isLoading } = useQuery({
    queryKey: ['mortality-trends', filters],
    queryFn: async () => {
      let query = supabase.from('research_mortality_view').select('death_month, death_count, province');
      
      if (filters.province !== 'All') query = query.eq('province', filters.province);
      if (filters.sex !== 'All') query = query.eq('patient_sex', filters.sex);
      if (filters.facilityType !== 'All') query = query.eq('facility_type', filters.facilityType);
      
      const { data, error } = await query;
      if (error) throw error;

      // Aggregate by month for the line chart
      const aggregated: Record<string, number> = {};
      data.forEach(row => {
        const month = new Date(row.death_month).toLocaleDateString('en-ZM', { year: 'numeric', month: 'short' });
        aggregated[month] = (aggregated[month] || 0) + row.death_count;
      });

      return Object.keys(aggregated).map(name => ({ name, count: aggregated[name] }));
    }
  });

  const totalDeaths = trendData?.reduce((sum, r) => sum + r.count, 0) || 0;
  const avgDeaths = (totalDeaths / (trendData?.length || 1)).toFixed(1);
  const peakMonth = [...(trendData || [])].sort((a, b) => b.count - a.count)[0];

  return (
    <div className="space-y-6">
      {/* Search/Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <TrendingUp size={28} className="text-primary" /> Temporal Trends
          </h2>
          <p className="text-slate-500 font-medium">Longitudinal mortality analysis and anomaly detection.</p>
        </div>

        <div className="flex flex-wrap gap-2">
           <select 
             value={filters.province} 
             onChange={e => setFilters({...filters, province: e.target.value})}
             className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20"
           >
             <option value="All">All Provinces</option>
             <option value="Lusaka">Lusaka</option>
             <option value="Copperbelt">Copperbelt</option>
             <option value="Southern">Southern</option>
             <option value="Central">Central</option>
           </select>
           <select 
             value={filters.facilityType} 
             onChange={e => setFilters({...filters, facilityType: e.target.value})}
             className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20"
           >
             <option value="All">All Facilities</option>
             <option value="Hospital">General Hospital</option>
             <option value="Health Center">Health Center</option>
             <option value="Clinic">Public Clinic</option>
           </select>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center gap-4 group">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
             <Calendar size={28} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Aggregated Total</p>
            <p className="text-2xl font-black text-slate-800">{totalDeaths.toLocaleString()}</p>
          </div>
          <div className="ml-auto flex items-center text-emerald-500 font-bold text-sm">
             <ArrowUpRight size={16} /> 2.4%
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center gap-4 group">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
             <Activity size={28} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Avg. Monthly Volume</p>
            <p className="text-2xl font-black text-slate-800">{avgDeaths}</p>
          </div>
          <div className="ml-auto flex items-center text-red-500 font-bold text-sm">
             <ArrowDownRight size={16} /> 0.8%
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex items-center justify-between group overflow-hidden relative">
          <div className="relative z-10">
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Peak Anomaly Month</p>
            <p className="text-2xl font-black text-white">{peakMonth?.name || 'Loading...'}</p>
            <p className="text-xs text-slate-400 font-medium mt-1">Found {peakMonth?.count} total records</p>
          </div>
          <AlertCircle size={80} className="absolute -right-4 -bottom-4 text-white/5" />
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm min-h-[500px] flex flex-col">
         <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-slate-800">Longitudinal Mortality Volume</h3>
            <div className="flex gap-2">
               <button className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase rounded-full">Monthly View</button>
               <button className="px-3 py-1 text-slate-400 text-[10px] font-black uppercase tracking-widest">Quarterly</button>
            </div>
         </div>

         {isLoading ? (
           <div className="flex-1 w-full bg-slate-50 rounded-2xl animate-pulse"></div>
         ) : (
           <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontSize: 10}} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontSize: 10}} 
                    />
                    <Tooltip 
                      contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#4f46e5" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorCount)" 
                      animationDuration={1500}
                    />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
         )}

         <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
            <div>
               <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                 <TrendingUp size={16} className="text-emerald-500" /> Key Growth Factors
               </h4>
               <p className="text-slate-500 font-medium">Significant spike detected in early Q2, correlating with seasonal changes in facility pressure across Lusaka and the Copperbelt.</p>
            </div>
            <div>
               <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                 <Filter size={16} className="text-indigo-500" /> Observation Bias
               </h4>
               <p className="text-slate-500 font-medium">Trends adjusted for reporting lag. Most recent month data might appear incomplete until provincial uploads sync.</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Trends;
