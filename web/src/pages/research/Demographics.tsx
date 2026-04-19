import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, Area
} from 'recharts';
import { 
  Users, 
  Filter, 
  MapPin, 
  ChevronDown, 
  Activity, 
  AlertCircle,
  RotateCcw,
  Building2
} from 'lucide-react';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Demographics = () => {
  // Global Filters for Linking
  const [filters, setFilters] = useState({
    province: 'All',
    sex: 'All',
    facilityType: 'All'
  });

  const { data: rawData, isLoading } = useQuery({
    queryKey: ['mortality-demographics', filters],
    queryFn: async () => {
      let query = supabase.from('research_mortality_view').select('*');
      
      if (filters.province !== 'All') query = query.eq('province', filters.province);
      if (filters.sex !== 'All') query = query.eq('patient_sex', filters.sex);
      if (filters.facilityType !== 'All') query = query.eq('facility_type', filters.facilityType);
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  // Aggregations
  const aggregateData = (key: string) => {
    if (!rawData) return [];
    const aggregated: Record<string, number> = {};
    rawData.forEach(row => {
      const val = row[key] || 'Unknown';
      aggregated[val] = (aggregated[val] || 0) + row.death_count;
    });
    return Object.keys(aggregated).map(name => ({ name, value: aggregated[name] }));
  };

  const sexData = aggregateData('patient_sex');
  const ageData = aggregateData('age_group').sort((a, b) => a.name.localeCompare(b.name));
  const facilityData = aggregateData('facility_type');
  const causeData = aggregateData('primary_cause_label')
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const totalDeaths = rawData?.reduce((sum, r) => sum + r.death_count, 0) || 0;

  const resetFilters = () => setFilters({ province: 'All', sex: 'All', facilityType: 'All' });

  return (
    <div className="space-y-6">
      {/* Header & Global Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Users className="text-primary" /> Demographic Insights
          </h2>
          <p className="text-slate-500 font-medium">Population-scale mortality distribution analysis.</p>
        </div>

        <div className="flex flex-wrap gap-3 relative z-10">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
             <MapPin size={14} className="text-slate-400" />
             <select 
               value={filters.province} 
               onChange={e => setFilters({...filters, province: e.target.value})}
               className="bg-transparent text-sm font-bold text-slate-700 outline-none"
             >
               <option value="All">All Provinces</option>
               <option value="Lusaka">Lusaka</option>
               <option value="Copperbelt">Copperbelt</option>
               <option value="Southern">Southern</option>
               <option value="Northern">Northern</option>
               <option value="Western">Western</option>
             </select>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
             <Activity size={14} className="text-slate-400" />
             <select 
               value={filters.sex} 
               onChange={e => setFilters({...filters, sex: e.target.value})}
               className="bg-transparent text-sm font-bold text-slate-700 outline-none"
             >
               <option value="All">All Sexes</option>
               <option value="Male">Male</option>
               <option value="Female">Female</option>
               <option value="Other">Other</option>
             </select>
          </div>

          <button 
            onClick={resetFilters}
            className="p-2 text-slate-400 hover:text-primary transition-colors hover:bg-primary/5 rounded-xl"
            title="Reset All Filters"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* Summary KPI Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Target Population</p>
          <p className="text-3xl font-black text-slate-900">{totalDeaths.toLocaleString()}</p>
          <div className="mt-2 text-xs font-bold text-emerald-600 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Total Records Analyzed
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Primary Burden</p>
          <p className="text-xl font-bold text-slate-800 line-clamp-1">{causeData[0]?.name || 'N/A'}</p>
          <p className="mt-2 text-xs font-bold text-slate-500 uppercase tracking-widest">Top Mortality Driver</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Highest Risk Group</p>
          <p className="text-3xl font-black text-slate-900">{ageData[0]?.name || '60+'}</p>
          <p className="mt-2 text-xs font-bold text-slate-500 uppercase tracking-widest">Demographic Peak</p>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl text-white">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Anonymity Status</p>
          <p className="text-lg font-bold">N &ge; 5 Suppression</p>
          <p className="mt-2 text-[10px] text-slate-500 uppercase font-bold">Active Privacy Protocol</p>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sex Distribution - Donut */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[400px]">
          <h3 className="font-bold text-slate-800 mb-6 flex justify-between">
            Sex Distribution
            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded uppercase tracking-tighter">Click to Link</span>
          </h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sexData}
                  cx="50%" cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  onClick={(data) => setFilters({...filters, sex: data.name})}
                  className="cursor-pointer"
                >
                  {sexData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Age Group - Bar */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-[400px] flex flex-col">
          <h3 className="font-bold text-slate-800 mb-6">Age Group Mortality Burden</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageData} margin={{bottom: 20}}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Causes - List Design */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <AlertCircle size={18} className="text-red-500" /> Leading ICD-11 Drivers
          </h3>
          <div className="space-y-4">
            {causeData.map((cause, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span className="truncate pr-4">{cause.name}</span>
                  <span className="text-slate-400 font-mono">{cause.value}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-1000"
                    style={{ width: `${(cause.value / causeData[0].value) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-8 w-full py-2 bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-colors">
            View Full Etiology Report
          </button>
        </div>

        {/* Facility Distribution - Pie */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[300px]">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Building2 size={18} className="text-slate-400" /> Facility Resilience
          </h3>
          <div className="flex-1 min-h-0">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                    data={facilityData}
                    cx="50%" cy="50%"
                    outerRadius={60}
                    dataKey="value"
                    stroke="#fff"
                    strokeWidth={2}
                 >
                   {facilityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                   ))}
                 </Pie>
                 <Tooltip />
               </PieChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Regional Correlation - Minimal Map Proxy Grid */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[300px]">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            Regional Correlation
          </h3>
          <div className="grid grid-cols-2 gap-2 overflow-y-auto pr-2 custom-scrollbar">
             {aggregateData('province').map((prov, i) => (
               <button 
                 key={i} 
                 onClick={() => setFilters({...filters, province: prov.name})}
                 className={`p-3 rounded-xl border transition-all text-left group ${filters.province === prov.name ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-300'}`}
               >
                 <div className="text-[10px] font-black text-slate-400 uppercase mb-1">{prov.name}</div>
                 <div className="text-sm font-bold text-slate-700">{prov.value} records</div>
               </button>
             ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Demographics;
