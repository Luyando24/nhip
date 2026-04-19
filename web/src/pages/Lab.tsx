import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, Hospital, Stethoscope, BriefcaseMedical } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

const Lab: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      content: 'Welcome to the ZNHIP AI Lab. I have access to your facility\'s real-time drug inventory and national mortality baselines. How can I assist with your diagnosis or treatment plan today?',
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Mock API delay and response generation based on the prompt
    setTimeout(async () => {
      let mockResponse = '';
      const promptLower = userMessage.content.toLowerCase();

      if (promptLower.includes('fever') || promptLower.includes('malaria')) {
        // Fetch real stock levels to make the AI look smart locally
        const { data: stock } = await supabase
          .from('drug_inventory')
          .select('quantity_in_stock')
          .eq('drug_name', 'Artemether/Lumefantrine')
          .limit(1);

        const qty = stock?.[0]?.quantity_in_stock ?? 0;
        
        mockResponse = `Based on the localized symptoms, the primary differential suggests **Severe Malaria**. \n\nI have cross-referenced your facility's inventory: **you currently have ${qty} units of Artemether/Lumefantrine in stock**.\n\nSince local stock levels are critically low relative to national baseline consumption, if the patient develops acute complications like renal failure, I strongly recommend a strategic referral out of the immediate district or an international medical evacuation to **Apollo Hospitals, India** for advanced nephrology intervention, which is an approved Ministry of Health referral corridor.`;
      } else {
        mockResponse = `Analyzing symptoms... The clinical presentation suggests a complex pathology. Without specific indicators like fever/chills in your prompt, I recommend running a full blood count (FBC). \n\nPlease note: you can provide more detailed symptoms, and I will strictly cross-reference them with your local drug inventory to suggest immediate treatment paths or abroad referral options if local infrastructure is inadequate.`;
      }

      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'ai', content: mockResponse }]);
      setIsTyping(false);
    }, 2500);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-white rounded-2xl border border-surface-border shadow-xl overflow-hidden relative group">
      {/* Decorative background glow mimicking Gemini/AI UI */}
      <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>

      <header className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-md">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Advanced Digital Lab AI</h1>
            <p className="text-xs font-semibold text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Context: Active
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-md flex items-center gap-2 text-xs font-bold text-slate-500">
            <Hospital size={14} className="text-primary" /> Inventory Checked
          </span>
          <span className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-md flex items-center gap-2 text-xs font-bold text-slate-500">
            <BriefcaseMedical size={14} className="text-primary" /> Global Referrals On
          </span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 max-w-4xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-100 text-slate-600' : 'bg-primary/10 text-primary'}`}>
              {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
            </div>
            <div className={`space-y-2 ${msg.role === 'user' ? 'items-end' : ''}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-bold uppercase tracking-wider ${msg.role === 'user' ? 'text-slate-400 text-right w-full' : 'text-primary'}`}>
                  {msg.role === 'user' ? 'Clinician' : 'ZNHIP AI Assistant'}
                </span>
              </div>
              <div 
                className={`p-5 rounded-2xl text-[15px] leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-slate-100 text-slate-800 rounded-tr-none' 
                    : 'bg-white border border-slate-100 shadow-sm rounded-tl-none whitespace-pre-wrap'
                }`}
              >
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-4 max-w-3xl">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-sm border border-primary/20">
              <Sparkles size={18} className="animate-pulse" />
            </div>
            <div className="bg-white border border-slate-100 shadow-sm rounded-2xl rounded-tl-none p-5 flex items-center gap-3">
              <Loader2 size={18} className="animate-spin text-primary" />
              <span className="text-sm font-semibold text-slate-500 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent animate-pulse">
                Synthesizing diagnosis & cross-referencing inventory...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSend} className="relative flex items-center">
            <Stethoscope className="absolute left-4 text-slate-400" size={24} />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe patient symptoms (e.g. fever, chills) to generate AI diagnostic..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-16 py-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all text-[15px]"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-2 p-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:hover:bg-primary flex items-center justify-center shadow-md shadow-primary/20"
            >
              <Send size={18} />
            </button>
          </form>
          <p className="text-center text-xs text-slate-400 font-medium mt-3">
            AI analyses are advisory. Medical professionals must use their clinical judgment before authorizing international referrals.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Lab;
