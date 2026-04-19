import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { 
  TrendingUp, 
  Users, 
  Skull, 
  Map as MapIcon,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

const Dashboard: React.FC = () => {
  const { data: mortalityData, isLoading } = useQuery({
    queryKey: ['dashboard-mortality'],
    queryFn: async () => {
      // For production, this should be moved to a Postgres RPC or View.
      const { data: records, error } = await supabase
        .from('death_records')
        .select(`
          time_of_death,
          primary_cause_icd11,
          primary_cause_label,
          facilities ( province )
        `);
        
      if (error) throw error;

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      let current_month = 0;
      let last_month = 0;
      const provinceCount: Record<string, number> = {};
      const causeCount: Record<string, { label: string, code: string, count: number }> = {};

      records.forEach((r: any) => {
        const t = new Date(r.time_of_death);
        if (t >= thirtyDaysAgo) {
          current_month++;
        } else if (t >= sixtyDaysAgo && t < thirtyDaysAgo) {
          last_month++;
        }

        const prov = r.facilities?.province || 'Unknown';
        provinceCount[prov] = (provinceCount[prov] || 0) + 1;

        const code = r.primary_cause_icd11;
        if (!causeCount[code]) {
          causeCount[code] = { code, label: r.primary_cause_label, count: 0 };
        }
        causeCount[code].count++;
      });

      const byProvince = Object.entries(provinceCount).map(([province, count]) => ({ province, count }));
      const topCauses = Object.values(causeCount).sort((a, b) => b.count - a.count).slice(0, 5);

      return {
        trend: { current_month, last_month },
        byProvince,
        topCauses
      };
    }
  });

  if (isLoading) return <div className="animate-pulse space-y-8">
    <div className="grid grid-cols-4 gap-6">
      {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>)}
    </div>
    <div className="h-96 bg-slate-200 rounded-xl"></div>
  </div>;

  const stats = [
    { name: 'Total deaths (30d)', value: mortalityData?.trend?.current_month || 0, icon: Skull, trend: '+12%', color: 'text-red-600' },
    { name: 'National Baseline', value: mortalityData?.trend?.last_month || 0, icon: Users, trend: '-3%', color: 'text-slate-600' },
    { name: 'Top Cause', value: mortalityData?.topCauses?.[0]?.label || 'None', icon: AlertCircle, trend: 'High', color: 'text-primary' },
    { name: 'Reporting Facilities', value: '42', icon: MapIcon, trend: 'Active', color: 'text-primary' },
  ];

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">National Health Intelligence</h1>
          <p className="text-slate-500 font-medium">Real-time mortality surveillance and drug correlation.</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <span>Export Stats</span>
          <ChevronRight size={18} />
        </button>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card group hover:scale-[1.02] transition-transform cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <stat.icon size={24} />
              </div>
              <span className={`text-sm font-bold ${stat.trend.includes('+') ? 'text-red-500' : 'text-emerald-500'}`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">{stat.name}</p>
            <h3 className="text-3xl font-bold mt-1 text-slate-900 truncate" title={String(stat.value)}>{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* National Trend Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="text-primary" />
              Mortality Trends
            </h3>
            <select className="bg-surface border-none text-sm font-semibold rounded-lg px-3 py-1 text-slate-600">
              <option>Last 12 Months</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mortalityData?.byProvince || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="province" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                <Tooltip cursor={{fill: '#F1F5F9'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="count" fill="#0F6E56" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Causes of Death */}
        <div className="card">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
            <AlertCircle className="text-secondary" />
            Top 5 National Causes
          </h3>
          <div className="space-y-6">
            {mortalityData?.topCauses?.map((cause: any, idx: number) => (
              <div key={cause.code} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center font-bold text-slate-400 shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-1">
                    <span className="font-bold text-slate-800 truncate" title={cause.label}>{cause.label}</span>
                    <span className="text-slate-500 text-sm font-medium shrink-0 ml-2">{cause.count || 0}</span>
                  </div>
                  <div className="w-full bg-surface h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-1000"
                      style={{ width: `${(cause.count / Math.max(mortalityData.trend.current_month, 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
            {mortalityData?.topCauses?.length === 0 && (
              <p className="text-sm text-slate-500">No records found for the selected period.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
