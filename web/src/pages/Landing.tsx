import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Shield, 
  Sparkles, 
  LineChart, 
  Globe, 
  ArrowRight,
  Database,
  BrainCircuit,
  Pill,
  Server,
  Zap
} from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  
  // Ticker animation state
  const [facilities, setFacilities] = useState(0);
  const [records, setRecords] = useState(0);

  useEffect(() => {
    // Animate numbers
    const interval = setInterval(() => {
      setFacilities(prev => prev < 342 ? prev + 1 : prev);
      setRecords(prev => prev < 8450 ? prev + 25 : prev);
    }, 20);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafc] text-slate-900 overflow-hidden selection:bg-primary/20 font-sans">
      
      {/* Abstract Backgrounds (Removed gradients/blobs) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-slate-50/50">
      </div>

      <nav className="relative z-50 w-full px-8 py-6 flex items-center justify-between max-w-7xl mx-auto backdrop-blur-md bg-white/50 border-b border-slate-200/50 rounded-b-3xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/20">
            <Activity size={24} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-slate-800">ZNHIP</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-primary transition-colors">
            Documentation
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="group px-5 py-2.5 bg-slate-900 text-white rounded-full font-semibold text-sm hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2"
          >
            Access Portal <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </nav>

      {/* Hero Section (Centered with Role Logins) */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-12 pb-16 lg:pt-16 flex flex-col items-center justify-center min-h-[75vh]">
        
        {/* Centered Content */}
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto z-10 relative w-full">
          
          <h2 className="text-5xl md:text-7xl lg:text-[6rem] font-black tracking-tight leading-[1.05] mb-8 text-slate-900 drop-shadow-sm">
            Empowering Zambia's <br className="hidden md:block"/>
            <span className="text-primary">
              Health Intelligence.
            </span>
          </h2>
          
          <p className="text-lg md:text-2xl text-slate-600/90 font-medium leading-relaxed mb-16 max-w-4xl">
            Driving national health outcomes through state-of-the-art telemetry, predictive supply chain analytics, and <span className="text-slate-900 font-bold">Data-Driven Insights.</span>
          </p>

          {/* Quick Access Roles */}
          <div className="w-full mt-4 max-w-4xl">
             <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 relative">
                 <span className="bg-[#fafafc] px-4 relative z-10">Select Your Persona Portal</span>
                 <span className="absolute top-1/2 left-0 w-full h-px bg-slate-200 z-0 border-dashed"></span>
             </p>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button onClick={() => navigate('/login', { state: { email: 'dr.banda@uth.gov.zm' } })} className="group p-6 bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(16,185,129,0.15)] hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-300 text-left flex flex-col justify-between">
                   <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                     <Activity size={28} className="text-emerald-600" />
                   </div>
                   <div className="flex-1">
                     <h3 className="text-xl font-bold text-slate-800 mb-1">Clinical Terminal</h3>
                     <p className="text-sm font-medium text-slate-500">Facility mortality & lab diagnostics</p>
                   </div>
                   <span className="mt-6 inline-flex items-center justify-center w-full py-2.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-sm group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300 gap-2">
                     Login Account <ArrowRight size={16} />
                   </span>
                </button>
                
                <button onClick={() => navigate('/login', { state: { email: 'ministry@znhip.gov.zm' } })} className="group p-6 bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(99,102,241,0.15)] hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-300 text-left flex flex-col justify-between relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full group-hover:scale-150 transition-transform duration-700"></div>
                   <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 relative z-10">
                     <Globe size={28} className="text-indigo-600" />
                   </div>
                   <div className="relative z-10 flex-1">
                     <h3 className="text-xl font-bold text-slate-800 mb-1">Ministry Oversight</h3>
                     <p className="text-sm font-medium text-slate-500">National telemetry & policy alerts</p>
                   </div>
                   <span className="mt-6 relative z-10 inline-flex items-center justify-center w-full py-2.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-sm group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-300 gap-2">
                     Login Account <ArrowRight size={16} />
                   </span>
                </button>
                
                <button onClick={() => navigate('/login', { state: { email: 'cidrz.research@znhip.gov.zm' } })} className="group p-6 bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(59,130,246,0.15)] hover:border-blue-500/40 hover:-translate-y-1 transition-all duration-300 text-left flex flex-col justify-between">
                   <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                     <BrainCircuit size={28} className="text-blue-600" />
                   </div>
                   <div className="flex-1">
                     <h3 className="text-xl font-bold text-slate-800 mb-1">Research Intelligence</h3>
                     <p className="text-sm font-medium text-slate-500">AI pipelines & aggregated analysis</p>
                   </div>
                   <span className="mt-6 inline-flex items-center justify-center w-full py-2.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-sm group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300 gap-2">
                     Login Account <ArrowRight size={16} />
                   </span>
                </button>
             </div>
          </div>
        </div>
      </main>

      {/* Data Ticker Bar */}
      <div className="relative z-20 border-y border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-8 py-6 grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100">
          <div className="px-6">
            <div className="text-3xl font-black text-slate-900 mb-1">{facilities}+</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Facilities Syncing</div>
          </div>
          <div className="px-6">
            <div className="text-3xl font-black text-slate-900 mb-1">{records.toLocaleString()}</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Records Analyzed</div>
          </div>
          <div className="px-6 hidden md:block">
            <div className="text-3xl font-black text-slate-900 mb-1">99.9%</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Uptime SLA</div>
          </div>
          <div className="px-6 hidden md:block">
            <div className="text-3xl font-black text-slate-900 mb-1">&lt;50ms</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Query Latency</div>
          </div>
        </div>
      </div>

      {/* Bento Box Feature Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 py-32 bg-[#fafafc]">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Enterprise Grade Infrastructure</h3>
          <p className="text-slate-600 font-medium text-lg">A cohesive suite of intelligence tools designed strictly for clinical and administrative foresight.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
          
          {/* Large Hero Bento - AI Lab */}
          <div className="md:col-span-2 group relative overflow-hidden bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-500 p-8 flex flex-col justify-end">
             {/* Decorative Background grid inside box */}
             <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_24px]"></div>
             <div className="absolute top-8 right-8 w-64 h-64 bg-slate-50 rounded-full transition-colors"></div>
             
             <div className="relative z-10 max-w-md">
               <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mb-6">
                 <BrainCircuit size={24} className="text-white" />
               </div>
               <h4 className="text-2xl font-bold text-slate-900 mb-2">Digital AI Diagnostic Lab</h4>
               <p className="text-slate-600 font-medium">
                 Not just algorithmic sorting. The ZNHIP AI instantly cross-references patient symptoms against exact local drug inventories and historical mortality telemetry to prevent critical facility failures.
               </p>
             </div>
          </div>

          {/* Small Bento 1 - Serverless */}
          <div className="group relative overflow-hidden bg-primary rounded-3xl border border-primary-dark shadow-sm hover:shadow-2xl hover:shadow-primary/30 transition-all duration-500 p-8 flex flex-col">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-auto backdrop-blur-md">
                 <Server size={24} className="text-white" />
            </div>
            <div className="relative z-10 mt-6">
               <h4 className="text-xl font-bold text-white mb-2">Edge Telemetry</h4>
               <p className="text-white/70 font-medium text-sm">
                 Connecting directly from the client to our secure Supabase infrastructure, bypassing legacy middleware bottlenecks entirely.
               </p>
            </div>
          </div>

          {/* Small Bento 2 - Database */}
          <div className="group relative overflow-hidden bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-500 p-8 flex flex-col">
            <div className="w-12 h-12 bg-slate-100 group-hover:bg-accent/10 transition-colors rounded-xl flex items-center justify-center mb-auto">
                 <Database size={24} className="text-slate-700 group-hover:text-accent" />
            </div>
            <div className="relative z-10 mt-6">
               <h4 className="text-xl font-bold text-slate-900 mb-2">Postgres RLS</h4>
               <p className="text-slate-600 font-medium text-sm">
                 Zero-trust Row Level Security protocols dynamically mapped to user JWTs, ensuring absolute data partitioning.
               </p>
            </div>
          </div>

          {/* Medium Bento - Health Alerts */}
          <div className="md:col-span-2 group relative overflow-hidden bg-slate-900 rounded-3xl border border-slate-800 shadow-xl transition-all duration-500 p-8 flex items-center">
             <div className="absolute top-0 right-0 w-64 h-full bg-slate-800/50"></div>
             
             <div className="relative z-10">
               <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/10 border border-white/10 mb-4">
                 <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
                 <span className="text-xs font-bold text-white uppercase tracking-widest">Automated Alerts</span>
               </div>
               <h4 className="text-2xl font-bold text-white mb-2">Epidemiological Forecasting</h4>
               <p className="text-white/60 font-medium max-w-md">
                 Our systems automatically detect ICD-11 mortality spikes out-of-band and immediately flag correlations with facility drug stockouts.
               </p>
             </div>
             
             <div className="ml-auto hidden md:block opacity-50 group-hover:opacity-100 transition-opacity duration-700">
                <Globe size={120} className="text-emerald-500 flex-shrink-0 animate-[spin_60s_linear_infinite]" />
             </div>
          </div>

          {/* Large Hero Bento - Research Partners */}
          <div className="md:col-span-3 group relative overflow-hidden bg-slate-50 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-500 p-8 flex flex-col md:flex-row items-center gap-8">
             <div className="relative z-10 flex-1">
               <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white border border-indigo-200 mb-4 shadow-sm">
                 <BrainCircuit size={14} className="text-indigo-600" />
                 <span className="text-xs font-bold text-indigo-900 uppercase tracking-widest">New: Research Intelligence</span>
               </div>
               <h4 className="text-2xl font-bold text-slate-900 mb-2">Empowering Health Research Institutes</h4>
               <p className="text-slate-600 font-medium max-w-2xl">
                 ZNHIP now extends its capabilities to external researchers like CIDRZ. Generate PICO-formatted AI hypotheses, build custom data collection endpoints (REDCap/ODK compatible), and correlate public health metrics in our secure Data Analysis Workbench without exposing raw patient identities.
               </p>
             </div>
             <div className="w-full md:w-auto mt-6 md:mt-0 flex gap-4">
                <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200 text-center flex-1 min-w-[120px]">
                   <div className="text-xl font-black text-slate-800 mb-1">PICO</div>
                   <div className="text-xs font-bold text-slate-500 uppercase">AI Generator</div>
                </div>
                <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200 text-center flex-1 min-w-[120px]">
                   <div className="text-xl font-black text-slate-800 mb-1">RLS</div>
                   <div className="text-xs font-bold text-slate-500 uppercase">Secure Views</div>
                </div>
             </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
               <Shield size={16} className="text-slate-500" />
             </div>
             <span className="font-bold text-slate-600 text-sm">ZNHIP Enterprise Architecture</span>
          </div>
          <div className="text-slate-500 text-sm font-semibold">
            &copy; 2026 Ministry of Health.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
