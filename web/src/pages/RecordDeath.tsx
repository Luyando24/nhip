import React from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { 
  Search, 
  Plus, 
  Trash2, 
  Save, 
  ChevronRight, 
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  Stethoscope
} from 'lucide-react';

const RecordDeath: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = React.useState(1);
  const [icdSearch, setIcdSearch] = React.useState('');
  const [icdResults, setIcdResults] = React.useState<any[]>([]);
  
  const [formData, setFormData] = React.useState({
    patientAgeYears: 0,
    patientSex: 'male',
    patientDistrict: '',
    primaryCauseIcd11: '',
    primaryCauseLabel: '',
    timeOfDeath: '',
    timeOfAdmission: '',
    ward: '',
    wasAdmitted: true,
    notes: '',
    contributingFactors: [] as any[]
  });

  const handleIcdSearch = async (val: string) => {
    setIcdSearch(val);
    if (val.length > 2) {
      const res = await api.get(`/api/icd11/search?q=${val}`);
      setIcdResults(res.data.data);
    }
  };

  const selectIcd = (code: string, label: string) => {
    setFormData({ ...formData, primaryCauseIcd11: code, primaryCauseLabel: label });
    setIcdSearch(label);
    setIcdResults([]);
  };

  const addFactor = () => {
    setFormData({
      ...formData,
      contributingFactors: [...formData.contributingFactors, { factorType: 'other', label: '', notes: '' }]
    });
  };

  const removeFactor = (index: number) => {
    const list = [...formData.contributingFactors];
    list.splice(index, 1);
    setFormData({ ...formData, contributingFactors: list });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/deaths', formData);
      navigate('/deaths');
    } catch (err) {
      alert('Failed to save record.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
          <Stethoscope className="text-primary" size={32} />
          Record New Death
        </h1>
        <p className="text-slate-500 font-medium">Please ensure accurate ICD-11 coding for national reporting data.</p>
        
        {/* Progress Stepper */}
        <div className="flex items-center gap-4 mt-8">
          {[1,2,3].map(i => (
            <React.Fragment key={i}>
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= i ? 'bg-primary text-white shadow-lg' : 'bg-white text-slate-300 border border-slate-200'}`}
              >
                {i}
              </div>
              {i < 3 && <div className={`flex-1 h-1 rounded-full ${step > i ? 'bg-primary' : 'bg-slate-200'}`}></div>}
            </React.Fragment>
          ))}
        </div>
      </header>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-8">
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
              <h3 className="text-xl font-bold text-slate-800">1. Patient Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Patient Sex</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['male', 'female', 'unknown'].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFormData({...formData, patientSex: s as any})}
                        className={`py-2 px-4 rounded-lg border font-medium capitalize transition-all ${formData.patientSex === s ? 'bg-primary/10 border-primary text-primary' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Age (Years)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={formData.patientAgeYears}
                    onChange={e => setFormData({...formData, patientAgeYears: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <MapPin size={16} /> District of Orign
                  </label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="e.g. Ndola"
                    value={formData.patientDistrict}
                    onChange={e => setFormData({...formData, patientDistrict: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Ward/Department</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="e.g. Paediatrics A"
                    value={formData.ward}
                    onChange={e => setFormData({...formData, ward: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
              <h3 className="text-xl font-bold text-slate-800">2. Clinical Context & Cause</h3>
              
              {/* ICD-11 Search */}
              <div className="relative">
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <Search size={16} /> Primary Cause (ICD-11 Search)
                </label>
                <input 
                  type="text" 
                  className="input-field pl-10 h-12 text-lg"
                  placeholder="Search by keywords (e.g. malaria, sepsis)..."
                  value={icdSearch}
                  onChange={e => handleIcdSearch(e.target.value)}
                />
                <Search className="absolute left-3 top-[3.25rem] -translate-y-1/2 text-slate-400" size={20} />
                
                {icdResults.length > 0 && (
                  <div className="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
                    {icdResults.map(res => (
                      <button
                        key={res.code}
                        type="button"
                        onClick={() => selectIcd(res.code, res.label)}
                        className="w-full px-6 py-4 text-left hover:bg-primary/5 flex items-center justify-between group transition-colors border-b border-slate-50 last:border-none"
                      >
                        <div>
                          <p className="font-bold text-slate-800 group-hover:text-primary">{res.label}</p>
                          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{res.chapter}</p>
                        </div>
                        <span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold font-mono text-slate-500">{res.code}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <Calendar size={16} /> Date & Time of Death
                  </label>
                  <input 
                    type="datetime-local" 
                    className="input-field" 
                    value={formData.timeOfDeath}
                    onChange={e => setFormData({...formData, timeOfDeath: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <Clock size={16} /> Date & Time of Admission
                  </label>
                  <input 
                    type="datetime-local" 
                    className="input-field" 
                    value={formData.timeOfAdmission}
                    onChange={e => setFormData({...formData, timeOfAdmission: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">3. Contributing Factors</h3>
                <button 
                  type="button" 
                  onClick={addFactor}
                  className="px-4 py-2 bg-primary/10 text-primary rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-primary/20"
                >
                  <Plus size={18} /> Add Factor
                </button>
              </div>

              <div className="space-y-4">
                {formData.contributingFactors.map((factor, idx) => (
                  <div key={idx} className="p-4 bg-surface rounded-xl border border-slate-200 relative group animate-in slide-in-from-top-2">
                    <button 
                      type="button" 
                      onClick={() => removeFactor(idx)}
                      className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Factor Type</label>
                        <select 
                          className="input-field bg-white"
                          value={factor.factorType}
                          onChange={e => {
                            const list = [...formData.contributingFactors];
                            list[idx].factorType = e.target.value;
                            setFormData({...formData, contributingFactors: list});
                          }}
                        >
                          <option value="comorbidity">Comorbidity</option>
                          <option value="drug_shortage">Drug Shortage</option>
                          <option value="delayed_presentation">Delayed Presentation</option>
                          <option value="malnutrition">Malnutrition</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Description</label>
                        <input 
                          type="text" 
                          className="input-field bg-white"
                          placeholder="e.g. History of Diabetes..."
                          value={factor.label}
                          onChange={e => {
                            const list = [...formData.contributingFactors];
                            list[idx].label = e.target.value;
                            setFormData({...formData, contributingFactors: list});
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {formData.contributingFactors.length === 0 && (
                  <div className="py-12 text-center bg-surface border border-dashed border-slate-300 rounded-xl">
                    <p className="text-slate-400 font-medium italic">No contributing factors added.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(s => Math.max(1, s - 1))}
              disabled={step === 1}
              className="flex items-center gap-2 px-6 py-2.5 font-bold text-slate-400 hover:text-slate-600 disabled:opacity-0"
            >
              <ChevronLeft size={20} /> Back
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(s => Math.min(3, s + 1))}
                className="btn-primary flex items-center gap-2"
              >
                Next Step <ChevronRight size={20} />
              </button>
            ) : (
              <button
                type="submit"
                className="btn-primary bg-primary flex items-center gap-2 px-8"
              >
                <Save size={20} /> Save National Record
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordDeath;
