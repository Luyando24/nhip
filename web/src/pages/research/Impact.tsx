import React from 'react';
import { TrendingUp, Target, ShieldCheck, Zap } from 'lucide-react';

const Impact = () => {
  return (
    <div className="space-y-8">
       <div className="p-8 bg-slate-900 rounded-3xl text-white relative overflow-hidden flex justify-between items-center isolate">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/4"></div>
          
          <div className="z-10">
            <h2 className="text-3xl font-bold tracking-tight mb-2">Research Impact</h2>
            <p className="text-slate-400 font-medium">Measuring the translation of AI hypotheses into national health interventions.</p>
          </div>
          
          <div className="z-10 text-right">
            <div className="text-sm font-bold text-slate-400 tracking-wider uppercase mb-1">Total Policy Adoptions</div>
            <div className="flex items-center gap-3 text-5xl font-black text-emerald-400">
               <ShieldCheck size={40} /> 3
            </div>
          </div>
       </div>

       {/* Funnel Metrics */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
            <Zap size={24} className="mx-auto text-amber-500 mb-3" />
            <div className="text-3xl font-black text-slate-800">124</div>
            <div className="text-sm font-semibold text-slate-500 uppercase mt-1">AI Hypotheses</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
            <Target size={24} className="mx-auto text-blue-500 mb-3" />
            <div className="text-3xl font-black text-slate-800">18</div>
            <div className="text-sm font-semibold text-slate-500 uppercase mt-1">Funded Studies</div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center relative overflow-hidden">
             <div className="absolute inset-0 border-b-4 border-indigo-500"></div>
            <TrendingUp size={24} className="mx-auto text-indigo-500 mb-3" />
            <div className="text-3xl font-black text-slate-800">7</div>
            <div className="text-sm font-semibold text-slate-500 uppercase mt-1">Publications</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 rounded-2xl shadow-lg text-center text-white">
            <ShieldCheck size={24} className="mx-auto text-white/50 mb-3" />
            <div className="text-3xl font-black">3</div>
            <div className="text-sm font-semibold text-emerald-100 uppercase mt-1">Policies Changed</div>
          </div>
       </div>

       <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-sm">
         <table className="w-full text-left">
           <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 font-bold text-slate-500 uppercase">Institution</th>
                <th className="p-4 font-bold text-slate-500 uppercase">Proposals Claimed</th>
                <th className="p-4 font-bold text-slate-500 uppercase">Data Requests</th>
                <th className="p-4 font-bold text-slate-500 uppercase">Output Focus</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-slate-100 font-medium">
             <tr className="hover:bg-slate-50 transition-colors">
                <td className="p-4 text-slate-800">CIDRZ</td>
                <td className="p-4 text-slate-500">8</td>
                <td className="p-4 text-slate-500">12</td>
                <td className="p-4 text-emerald-600">Cross-sectional / TB</td>
             </tr>
             <tr className="hover:bg-slate-50 transition-colors">
                <td className="p-4 text-slate-800">TDRC</td>
                <td className="p-4 text-slate-500">4</td>
                <td className="p-4 text-slate-500">3</td>
                <td className="p-4 text-indigo-600">Malaria Vector Control</td>
             </tr>
             <tr className="hover:bg-slate-50 transition-colors">
                <td className="p-4 text-slate-800">UNZA SOph</td>
                <td className="p-4 text-slate-500">6</td>
                <td className="p-4 text-slate-500">9</td>
                <td className="p-4 text-blue-600">MCH / Obstetrics</td>
             </tr>
           </tbody>
         </table>
       </div>
    </div>
  );
};

export default Impact;
