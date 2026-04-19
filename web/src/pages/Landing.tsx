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
      
      {/* Abstract Glowing Backgrounds */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] mix-blend-multiply animate-blob"></div>
        <div className="absolute top-[20%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[100px] mix-blend-multiply animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] mix-blend-multiply animate-blob animation-delay-2000"></div>
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

      {/* Hero Section (Asymmetrical with Floating UI) */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-24 pb-20 lg:pt-32 lg:pb-32 flex flex-col lg:flex-row items-center gap-16">
        
        {/* Left Content */}
        <div className="flex-1 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm mb-8 animate-fade-in-down">
             <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
             <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Active Intelligence V2.0</span>
          </div>
          
          <h2 className="text-6xl lg:text-[5.5rem] font-black tracking-tight leading-[1.05] mb-8 text-slate-900">
            Intelligent<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-600 to-accent">
              Health Data.
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed mb-10 max-w-xl">
            A state-of-the-art national telemetry platform merging real-time mortality surveillance with localized AI diagnostics and predictive inventory analytics.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-bold transition-all shadow-[0_8px_30px_rgb(15,110,86,0.2)] hover:shadow-[0_8px_40px_rgb(15,110,86,0.3)] hover:-translate-y-0.5 flex items-center gap-2"
            >
              Initialize Workspace
            </button>
            <button className="bg-white border border-slate-200 text-slate-700 px-8 py-4 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2 shadow-sm">
              <Zap size={18} className="text-accent" /> Architecture
            </button>
          </div>
        </div>

        {/* Right Content - Floating UI Composition */}
        <div className="flex-1 relative w-full h-[500px] hidden lg:block perspective-1000">
          
          {/* Main Dashboard Card */}
          <div className="absolute top-10 right-10 w-[400px] bg-white rounded-2xl border border-slate-200/60 shadow-2xl p-6 animate-float z-20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><Activity size={16} className="text-primary" /></div>
                <div>
                  <div className="text-sm font-bold">National Mortality</div>
                  <div className="text-[10px] text-slate-400">Live Telemetry</div>
                </div>
              </div>
              <div className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded font-bold">+12% Spike</div>
            </div>
            {/* Mock Chart Area */}
            <div className="h-32 flex items-end gap-2 mt-4">
              {[40, 25, 60, 45, 80, 50, 75].map((h, i) => (
                <div key={i} className="flex-1 bg-gradient-to-t from-primary to-emerald-300 rounded-t-sm" style={{ height: `${h}%` }}></div>
              ))}
            </div>
          </div>

          {/* Floating AI Chat Card */}
          <div className="absolute bottom-10 left-0 w-[320px] bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] p-5 animate-float-delayed z-30 transform -rotate-2">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-accent" />
              <div className="text-xs font-bold text-slate-700">Digital Lab AI</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 mb-3 border border-slate-100 text-xs text-slate-600">
              "Patient presents with fever..."
            </div>
            <div className="bg-primary/5 rounded-xl p-3 border border-primary/10 text-xs text-slate-800 font-medium">
              <p className="mb-2">Diagnosing Severe Malaria.</p>
              <div className="flex items-center gap-1 text-[10px] bg-white px-2 py-1 rounded-md border border-slate-200 w-fit">
                <Pill size={10} className="text-primary"/> 14 units Artemether local.
              </div>
            </div>
          </div>

          {/* Floating Alert Card */}
          <div className="absolute top-0 left-10 w-[240px] bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-2xl p-4 animate-float-fast z-10 transform rotate-3">
             <div className="flex items-center gap-2 mb-2">
               <Shield size={14} className="text-emerald-400" />
               <span className="text-[10px] font-bold tracking-widest uppercase">System Secure</span>
             </div>
             <p className="text-xs text-slate-400">End-to-end encryption active across all provincial nodes.</p>
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
             <div className="absolute top-8 right-8 w-64 h-64 bg-primary/5 rounded-full blur-[50px] group-hover:bg-primary/10 transition-colors"></div>
             
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
             <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-emerald-500/20 to-transparent"></div>
             
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
