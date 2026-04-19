import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { AlertTriangle, TrendingUp, PackageX, CheckCircle, Clock } from 'lucide-react';

const HealthAlerts: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['health-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mortality_alerts')
        .select(`
          *,
          facilities ( name )
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data;
    }
  });

  const resolveAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('mortality_alerts')
        .update({ is_resolved: true })
        .eq('id', alertId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-alerts'] });
    }
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-12 bg-slate-200 rounded-xl mb-8"></div>
        {[1,2,3].map(i => <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>)}
      </div>
    );
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'spike': return <TrendingUp size={24} className="text-red-500" />;
      case 'stockout_correlation': return <PackageX size={24} className="text-accent" />;
      default: return <AlertTriangle size={24} className="text-red-500" />;
    }
  };

  const getAlertColor = (type: string, isResolved: boolean) => {
    if (isResolved) return 'bg-slate-50 border-slate-200 opacity-75';
    if (type === 'spike') return 'bg-red-50/50 border-red-200 shadow-sm shadow-red-100';
    return 'bg-accent/5 border-accent/20 shadow-sm shadow-accent/10';
  };

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
          <AlertTriangle className="text-primary" size={32} />
          Automated Health Alerts
        </h1>
        <p className="text-slate-500 font-medium">Real-time epidemiological anomalies and resource correlations.</p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {alerts?.length === 0 && (
          <div className="card text-center py-12">
            <CheckCircle className="mx-auto text-emerald-500 mb-4" size={48} />
            <h3 className="text-xl font-bold text-slate-800">No Active Alerts</h3>
            <p className="text-slate-500">All mortality baselines and resource levels are normal.</p>
          </div>
        )}

        {alerts?.map((alert: any) => (
          <div key={alert.id} className={`rounded-xl border p-6 transition-all ${getAlertColor(alert.alert_type, alert.is_resolved)}`}>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-xl shadow-sm rounded-full shrink-0">
                {getAlertIcon(alert.alert_type)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className={`text-lg font-bold ${alert.is_resolved ? 'text-slate-600 line-through' : 'text-slate-800'}`}>
                      {alert.description}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm font-medium text-slate-600">
                      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-md border border-slate-200">
                        <Clock size={14} /> 
                        {new Date(alert.period_start).toLocaleDateString()} - {new Date(alert.period_end).toLocaleDateString()}
                      </span>
                      <span className="font-bold text-primary">
                        {alert.facilities?.name || 'Unknown Facility'} ({alert.province})
                      </span>
                      {alert.icd11_code && (
                        <span className="bg-primary/10 text-primary px-2 rounded-md font-mono text-xs">
                          ICD-11: {alert.icd11_code}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {!alert.is_resolved && (
                    <button 
                      onClick={() => resolveAlertMutation.mutate(alert.id)}
                      disabled={resolveAlertMutation.isPending}
                      className="px-4 py-2 bg-white hover:bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg font-bold text-sm shadow-sm transition-colors flex items-center gap-2"
                    >
                      <CheckCircle size={16} /> Mark Investigated
                    </button>
                  )}
                  {alert.is_resolved && (
                    <span className="px-4 py-2 bg-slate-100 text-slate-500 rounded-lg font-bold text-sm flex items-center gap-2 border border-slate-200">
                      <CheckCircle size={16} /> Resolved
                    </span>
                  )}
                </div>

                {!alert.is_resolved && (
                  <div className="mt-6 grid grid-cols-2 max-w-md gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Baseline Rate</p>
                      <p className="text-xl font-bold text-slate-800 flex items-end gap-1">
                        {alert.baseline_rate} <span className="text-sm font-medium text-slate-500 mb-1">/ 1k</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Observed Rate</p>
                      <p className="text-xl font-bold text-red-600 flex items-end gap-1">
                        {alert.observed_rate} <span className="text-sm font-medium text-slate-500 mb-1">/ 1k</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HealthAlerts;
