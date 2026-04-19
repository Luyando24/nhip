import React, { useState } from 'react';
import { Layers, Plus, Save, Download, PlayCircle, Settings, Trash, ArrowLeft, Database, Edit, Share2, Copy, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';

const SubmissionsView = ({ instrument, onBack }: { instrument: any, onBack: () => void }) => {
  const { data: submissions, isLoading } = useQuery({
    queryKey: ['instrument-data', instrument.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('research_data')
        .select('*')
        .eq('instrument_id', instrument.id)
        .order('collected_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const columns = instrument.form_schema || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-4 mb-2">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800">{instrument.name} - Submissions</h2>
          <p className="text-sm text-slate-500">Viewing collected digital health parameters</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Collected At</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Collected By</th>
                {columns.map((col: any) => (
                  <th key={col.id} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-l border-slate-100">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {isLoading ? (
                 [1, 2, 3].map(i => (
                   <tr key={i} className="animate-pulse">
                     <td colSpan={columns.length + 2} className="px-6 py-4 bg-slate-50/50 h-16"></td>
                   </tr>
                 ))
              ) : !submissions || submissions.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 2} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                        <Database size={32} />
                      </div>
                      <p className="text-slate-400 font-medium">No submissions recorded for this instrument yet.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                submissions.map((sub: any) => (
                  <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                      {new Date(sub.collected_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-500">
                      {sub.collected_by?.substring(0, 8)}...
                    </td>
                    {columns.map((col: any) => (
                      <td key={col.id} className="px-6 py-4 text-sm text-slate-800 border-l border-slate-50">
                        {String(sub.data[col.variableName] || '-')}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const Instruments = () => {
  const queryClient = useQueryClient();
  const [fields, setFields] = useState<any[]>([
    { id: '1', label: 'Patient UID', type: 'text', variableName: 'znhip_patient_uid' }
  ]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [editingInstrument, setEditingInstrument] = useState<any>(null);
  const [selectedInst, setSelectedInst] = useState<any>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  // Fetch existing instruments
  const { data: instruments, isLoading } = useQuery({
    queryKey: ['research-instruments'],
    queryFn: async () => {
      const { data, error } = await supabase.from('research_instruments').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const handleEdit = (inst: any) => {
    setFields(inst.form_schema);
    setEditingInstrument(inst);
    setIsBuilding(true);
  };

  const addField = () => {
    setFields([...fields, { id: Date.now().toString(), label: 'New Field', type: 'text', variableName: 'znhip_new_var' }]);
  };

  const updateField = (id: string, updates: any) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const saveInstrument = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    if (editingInstrument) {
      const { error } = await supabase
        .from('research_instruments')
        .update({
          form_schema: fields,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingInstrument.id);

      if (!error) {
        alert("Instrument updated successfully!");
        setEditingInstrument(null);
        setIsBuilding(false);
        queryClient.invalidateQueries({ queryKey: ['research-instruments'] });
      } else {
        alert("Update failed: " + error.message);
      }
    } else {
      const { error } = await supabase.from('research_instruments').insert({
        name: 'New Custom Form ' + new Date().toLocaleDateString(),
        description: 'Custom research parameters',
        owner_institution: 'Ministry/Research Partner',
        owner_user_id: user.id,
        form_schema: fields,
        status: 'active'
      });

      if (!error) {
        alert("Instrument saved & Deployed successfully!");
        setIsBuilding(false);
        queryClient.invalidateQueries({ queryKey: ['research-instruments'] });
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this instrument? This will not remove already collected data but the form will no longer be accessible.")) return;
    
    const { error } = await supabase.from('research_instruments').delete().eq('id', id);
    if (!error) {
       queryClient.invalidateQueries({ queryKey: ['research-instruments'] });
    } else {
       alert("Delete failed: " + error.message);
    }
  };

  const handleShare = (id: string) => {
    const url = `${window.location.origin}/collect/${id}`;
    setShareUrl(url);
  };

  const handleExport = (inst: any) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(inst.form_schema, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", `${inst.name.replace(/\s+/g, '_')}_schema.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  if (selectedInst) {
    return <SubmissionsView instrument={selectedInst} onBack={() => setSelectedInst(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Data Collection Instruments</h2>
          <p className="text-slate-500">Manage REDCap and ODK compatible data forms.</p>
        </div>
        <button className="btn-primary" onClick={() => {
          if (isBuilding) {
            setIsBuilding(false);
            setEditingInstrument(null);
            setFields([{ id: '1', label: 'Patient UID', type: 'text', variableName: 'znhip_patient_uid' }]);
          } else {
            setIsBuilding(true);
          }
        }}>
          {isBuilding ? 'Cancel Builder' : <><Plus size={18}/> New Instrument</>}
        </button>
      </div>

      {shareUrl && (
        <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl animate-in fade-in zoom-in-95 duration-300">
           <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-emerald-900 flex items-center gap-2"><Share2 size={18}/> Public Collection Link</h3>
              <button onClick={() => setShareUrl(null)} className="text-emerald-500 hover:text-emerald-700"><X size={20}/></button>
           </div>
           <p className="text-sm text-emerald-700 mb-4 font-medium">Share this link with field researchers or clinicians to collect data. No ZNHIP login required.</p>
           <div className="flex gap-2">
              <input readOnly value={shareUrl} className="flex-1 bg-white border border-emerald-200 rounded-xl px-4 py-3 text-sm font-mono text-emerald-800" />
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  alert("Link copied to clipboard!");
                }}
                className="bg-emerald-600 text-white px-6 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors flex items-center gap-2"
              >
                <Copy size={18} /> Copy Link
              </button>
           </div>
        </div>
      )}

      {isBuilding ? (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Settings size={18} /> Form Builder</h3>
          <div className="space-y-4 max-w-3xl">
            {fields.map((field, index) => (
              <div key={field.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex gap-4 items-center">
                <div className="font-mono text-slate-400 font-bold">{index + 1}.</div>
                <input 
                  type="text" 
                  value={field.label} 
                  onChange={(e) => updateField(field.id, { label: e.target.value })}
                  className="input-field flex-1"
                  placeholder="Field Label"
                />
                <input 
                  type="text" 
                  value={field.variableName} 
                  onChange={(e) => updateField(field.id, { variableName: e.target.value })}
                  className="input-field font-mono text-sm w-48"
                  placeholder="variable_name"
                />
                <select 
                  value={field.type}
                  onChange={(e) => updateField(field.id, { type: e.target.value })}
                  className="input-field w-32"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="select">Dropdown</option>
                </select>
                <button 
                  onClick={() => setFields(fields.filter(f => f.id !== field.id))}
                  className="p-2 text-slate-400 hover:text-red-500"
                >
                  <Trash size={18} />
                </button>
              </div>
            ))}
            
            <button onClick={addField} className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 font-semibold">
              <Plus size={18} /> Add Field
            </button>
            <div className="flex gap-4 pt-4 border-t border-slate-100">
              <button onClick={saveInstrument} className="btn-primary flex items-center gap-2">
                <Save size={18}/> {editingInstrument ? 'Update Instrument' : 'Deploy to Mobile/Web'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {isLoading ? (
            <div className="animate-pulse h-32 bg-slate-100 rounded-2xl w-full"></div>
          ) : (
             instruments?.map(inst => (
               <div key={inst.id} className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between items-center hover:shadow-md transition-all group gap-4">
                 <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                      <Layers size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{inst.name}</h3>
                      <p className="text-sm text-slate-500">Owned by {inst.owner_institution} • {inst.status}</p>
                    </div>
                 </div>
                 <div className="flex flex-wrap gap-2">
                   <button 
                    onClick={() => handleShare(inst.id)}
                    className="px-3 py-1.5 rounded-lg font-bold text-xs bg-emerald-50 text-emerald-700 flex items-center gap-1.5 hover:bg-emerald-600 hover:text-white transition-all"
                    title="Share for Data Collection"
                   >
                     <Share2 size={14}/> Share Link
                   </button>
                   <button 
                    onClick={() => handleEdit(inst)}
                    className="px-3 py-1.5 rounded-lg font-bold text-xs bg-blue-50 text-blue-700 flex items-center gap-1.5 hover:bg-blue-600 hover:text-white transition-all"
                   >
                     <Edit size={14}/> Edit Form
                   </button>
                   <button 
                    onClick={() => handleExport(inst)}
                    className="px-3 py-1.5 rounded-lg font-bold text-xs border border-slate-200 text-slate-600 flex items-center gap-1.5 hover:bg-slate-50 transition-all"
                   >
                     <Download size={14}/> Schema
                   </button>
                   <button 
                    onClick={() => setSelectedInst(inst)}
                    className="px-3 py-1.5 rounded-lg font-bold text-xs bg-slate-900 text-white flex items-center gap-1.5 hover:bg-slate-800 transition-all shadow-sm"
                   >
                     <PlayCircle size={14}/> Submissions
                   </button>
                   <button 
                    onClick={() => handleDelete(inst.id)}
                    className="px-3 py-1.5 rounded-lg font-bold text-xs bg-red-50 text-red-600 flex items-center gap-1.5 hover:bg-red-600 hover:text-white transition-all"
                   >
                     <Trash size={14}/>
                   </button>
                 </div>
               </div>
             ))
          )}
        </div>
      )}
    </div>
  );
};

export default Instruments;
