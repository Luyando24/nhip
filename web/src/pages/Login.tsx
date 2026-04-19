import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { 
  Activity, 
  Lock, 
  Mail, 
  AlertCircle, 
  ChevronLeft, 
  ShieldCheck, 
  Building2, 
  Map, 
  Hospital, 
  Stethoscope, 
  Pill, 
  Microscope,
  ArrowRight
} from 'lucide-react';

interface UserRole {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  email: string;
}

const USER_ROLES: UserRole[] = [
  {
    id: 'super_admin',
    title: 'Super Admin',
    description: 'System-wide oversight and platform management',
    icon: ShieldCheck,
    email: 'admin@znhip.gov.zm'
  },
  {
    id: 'ministry_admin',
    title: 'Ministry Admin',
    description: 'National health surveillance and policy monitoring',
    icon: Building2,
    email: 'ministry@znhip.gov.zm'
  },
  {
    id: 'provincial_officer',
    title: 'Provincial Officer',
    description: 'Regional data analysis and disease monitoring',
    icon: Map,
    email: 'lusaka.officer@znhip.gov.zm'
  },
  {
    id: 'facility_admin',
    title: 'Facility Admin',
    description: 'Hospital-level reporting and resource management',
    icon: Hospital,
    email: 'uth.admin@znhip.gov.zm'
  },
  {
    id: 'clinician',
    title: 'Clinician',
    description: 'Mortality recording and patient outcome tracking',
    icon: Stethoscope,
    email: 'dr.banda@uth.gov.zm'
  },
  {
    id: 'pharmacist',
    title: 'Pharmacist',
    description: 'Drug inventory and supply chain tracking',
    icon: Pill,
    email: 'pharm.chanda@uth.gov.zm'
  },
  {
    id: 'research_partner',
    title: 'Research Partner',
    description: 'Statistical analysis and health research insights',
    icon: Microscope,
    email: 'cidrz.research@znhip.gov.zm'
  }
];

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [view, setView] = useState<'selection' | 'login'>('selection');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
      setPassword('ZNHIPTest2026!');
      setView('login');
    }
  }, [location.state]);

  const handleRoleSelect = (role: UserRole) => {
    setEmail(role.email);
    setPassword('ZNHIPTest2026!');
    setView('login');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authData.session) {
        throw new Error(authError?.message || 'Invalid login credentials.');
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
        
      if (userError || !userData) {
        throw new Error('User profile not found in public database.');
      }

      const user = {
        id: userData.id,
        email: userData.email,
        fullName: userData.full_name,
        role: userData.role,
        facilityId: userData.facility_id,
        province: userData.province,
      };

      setAuth(user, authData.session.access_token);
      if (user.role === 'research_partner') {
        navigate('/research/portal');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F6E56] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative patterns */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/10 rounded-full -ml-48 -mb-48 blur-3xl"></div>

      <div className={`w-full transition-all duration-500 ease-in-out ${view === 'selection' ? 'max-w-5xl' : 'max-w-md'}`}>
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-2xl mb-6 animate-float">
            <Activity size={40} className="text-[#0F6E56]" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">ZNHIP</h1>
          <p className="text-white/80 font-medium uppercase tracking-widest text-sm">
            Ministry of Health - Zambia
          </p>
        </div>

        {view === 'selection' ? (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Select Your Portal</h2>
              <p className="text-white/60">Choose your role to access the corresponding intelligence module</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {USER_ROLES.map((role) => (
                <div 
                  key={role.id}
                  onClick={() => handleRoleSelect(role)}
                  className="role-card group"
                >
                  <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center mb-4 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <role.icon size={24} />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-1 group-hover:text-primary transition-colors">{role.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                    {role.description}
                  </p>
                  <div className="mt-4 flex items-center text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                    ACCESS PORTAL <ArrowRight size={14} className="ml-1" />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <button 
                onClick={() => setView('login')}
                className="text-white/60 hover:text-white transition-colors text-sm font-medium flex items-center justify-center mx-auto gap-2"
              >
                Or sign in manually <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-white/10 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center gap-4 mb-6">
              <button 
                onClick={() => setView('selection')}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
              >
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-2xl font-bold text-slate-800 font-sans">System Login</h2>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl mb-6 flex items-start gap-3">
                <AlertCircle size={20} className="shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-10"
                    placeholder="name@znhip.gov.zm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-10"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-4 text-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                {loading ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  'Access Platform'
                )}
              </button>
            </form>

            <div className="mt-8 text-center pt-6 border-t border-slate-100">
              <p className="text-sm text-slate-500 font-medium">
                National Health Intelligence Platform © 2026
              </p>
            </div>
          </div>
        )}

        <div className="mt-8 text-center max-w-lg mx-auto">
          <p className="text-white/60 text-xs font-medium uppercase tracking-widest leading-loose">
            Empowering Zambia's Health Intelligence through Data-Driven Insights
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
