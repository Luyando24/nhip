import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import { 
  Pill, 
  Search, 
  AlertTriangle, 
  Plus, 
  History, 
  ArrowUpRight, 
  ArrowDownLeft,
  Calendar,
  Package,
  CheckCircle2,
  XCircle
} from 'lucide-react';

const Inventory: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: drugs, isLoading } = useQuery({
    queryKey: ['drugs'],
    queryFn: () => api.get('/api/drugs').then(res => res.data.data)
  });

  const [selectedDrug, setSelectedDrug] = React.useState<any>(null);
  const [showTransactionModal, setShowTransactionModal] = React.useState(false);
  const [transactionType, setTransactionType] = React.useState<'received' | 'dispensed'>('dispensed');
  const [quantity, setQuantity] = React.useState(0);

  const transactionMutation = useMutation({
    mutationFn: (data: any) => api.post(`/api/drugs/${data.id}/transaction`, data.body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drugs'] });
      setShowTransactionModal(false);
      setQuantity(0);
    }
  });

  const handleTransaction = () => {
    if (!selectedDrug) return;
    transactionMutation.mutate({
      id: selectedDrug.id,
      body: { transactionType, quantity }
    });
  };

  const getStockStatus = (drug: any) => {
    if (drug.quantity_in_stock === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-700 font-bold', icon: XCircle };
    if (drug.quantity_in_stock < drug.reorder_level) return { label: 'Critical', color: 'bg-orange-100 text-orange-700', icon: AlertTriangle };
    return { label: 'Good Stock', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 };
  };

  if (isLoading) return <div className="space-y-6">
    <div className="h-64 bg-slate-200 rounded-xl animate-pulse"></div>
    <div className="h-96 bg-slate-200 rounded-xl animate-pulse"></div>
  </div>;

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Package className="text-primary" size={32} />
            Drug Inventory
          </h1>
          <p className="text-slate-500 font-medium">Real-time stock monitoring for {drugs?.[0]?.facility_name || 'your facility'}.</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          New Batch Arrival
        </button>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card border-l-4 border-l-red-500">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Out of Stock</p>
          <h3 className="text-3xl font-bold">{drugs?.filter((d: any) => d.quantity_in_stock === 0).length || 0}</h3>
        </div>
        <div className="card border-l-4 border-l-orange-500">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Low Stock Alerts</p>
          <h3 className="text-3xl font-bold">{drugs?.filter((d: any) => d.quantity_in_stock < d.reorder_level).length || 0}</h3>
        </div>
        <div className="card border-l-4 border-l-primary">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Expiring within 30d</p>
          <h3 className="text-3xl font-bold">{drugs?.filter((d: any) => new Date(d.expiry_date) < new Date(Date.now() + 30*24*60*60*1000)).length || 0}</h3>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="p-4 border-b border-surface-border bg-surface flex items-center justify-between">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Search drug name or generic..." className="input-field pl-10 h-10 text-sm" />
          </div>
          <div className="flex items-center gap-2">
             <button className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg">All</button>
             <button className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 rounded-lg">Critical</button>
          </div>
        </div>
        
        <table className="w-full text-left">
          <thead className="bg-surface/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Drug Item</th>
              <th className="px-6 py-4">Generic Name</th>
              <th className="px-6 py-4">Quantity</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Expiry</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {drugs?.map((drug: any) => {
              const status = getStockStatus(drug);
              const StatusIcon = status.icon;
              return (
                <tr key={drug.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-5 font-bold text-slate-800">{drug.drug_name}</td>
                  <td className="px-6 py-5 text-slate-500 text-sm">{drug.generic_name}</td>
                  <td className="px-6 py-5">
                    <span className="text-lg font-bold mr-1">{drug.quantity_in_stock}</span>
                    <span className="text-slate-400 text-xs font-medium uppercase">{drug.unit}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>
                      <StatusIcon size={14} />
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm font-medium">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar size={14} />
                      {new Date(drug.expiry_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button 
                      onClick={() => { setSelectedDrug(drug); setShowTransactionModal(true); }}
                      className="inline-flex items-center gap-1 text-primary hover:text-primary-dark font-bold text-sm bg-primary/10 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Activity size={16} /> Update
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Transaction Modal */}
      {showTransactionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl relative">
            <h3 className="text-2xl font-bold mb-2">Update Stock Level</h3>
            <p className="text-slate-500 mb-8 font-medium">Changing inventory for <span className="text-primary font-bold">{selectedDrug.drug_name}</span></p>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setTransactionType('dispensed')}
                  className={`py-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${transactionType === 'dispensed' ? 'bg-orange-50 border-orange-200 text-orange-700' : 'border-slate-100 hover:bg-slate-50'}`}
                >
                  <ArrowDownLeft />
                  <span className="font-bold">Dispense</span>
                </button>
                <button 
                  onClick={() => setTransactionType('received')}
                  className={`py-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${transactionType === 'received' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'border-slate-100 hover:bg-slate-50'}`}
                >
                  <ArrowUpRight />
                  <span className="font-bold">Receive</span>
                </button>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Transaction Quantity ({selectedDrug.unit})</label>
                <input 
                  type="number" 
                  className="input-field h-14 text-2xl font-bold text-center" 
                  value={quantity}
                  onChange={e => setQuantity(parseInt(e.target.value))}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setShowTransactionModal(false)}
                  className="flex-1 px-6 py-3 font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleTransaction}
                  className="flex-1 btn-primary py-3 font-bold"
                >
                  Save Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Activity: React.FC<{size: number}> = ({size}) => <History size={size} />;

export default Inventory;
