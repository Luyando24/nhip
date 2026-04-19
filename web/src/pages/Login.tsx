import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Activity, Lock, Mail, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Log into Supabase GoTrue Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authData.session) {
        throw new Error(authError?.message || 'Invalid login credentials.');
      }

      // 2. Fetch extended user profile from public.users table mapping by email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
        
      if (userError || !userData) {
        throw new Error('User profile not found in public database.');
      }

      // 3. Map to our local auth store correctly
      const user = {
        id: userData.id,
        email: userData.email,
        fullName: userData.full_name,
        role: userData.role,
        facilityId: userData.facility_id,
        province: userData.province,
      };

      setAuth(user, authData.session.access_token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F6E56] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative patterns */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full -ml-48 -mb-48 blur-3xl"></div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-2xl mb-6">
            <Activity size={40} className="text-[#0F6E56]" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">ZNHIP</h1>
          <p className="text-primary-light font-medium uppercase tracking-widest text-sm">
            Ministry of Health - Zambia
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 font-sans">System Login</h2>
          
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
              className="w-full btn-primary py-4 text-lg font-bold flex items-center justify-center gap-2"
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

        <div className="mt-8 text-center">
          <p className="text-white/60 text-xs font-medium uppercase tracking-widest leading-loose">
            Digitizing Zambia's Health One Death at a Time
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
