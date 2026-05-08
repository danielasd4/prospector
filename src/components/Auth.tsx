import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Target, Lock, Mail, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface AuthProps {
  onLogin: () => void;
}

export const Auth = ({ onLogin }: AuthProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      onLogin();
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      setError('Cadastro realizado. Se houver confirmação de email ativa no painel, verifique sua caixa de entrada.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md animate-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-primary to-primary-hover flex items-center justify-center shadow-lg shadow-primary/20 mb-4">
            <span className="font-display font-bold text-white text-3xl leading-none">V</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">Vency Hub</h1>
          <p className="text-slate-400 mt-2">Seu Centro de Decisão Estratégica</p>
        </div>

        <div className="glass-card p-8 rounded-3xl border border-white/10 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium text-center">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu email"
                  required
                  className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-primary focus:bg-primary/5 rounded-xl pl-11 pr-4 py-3.5 text-white outline-none transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  required
                  className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-primary focus:bg-primary/5 rounded-xl pl-11 pr-4 py-3.5 text-white outline-none transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : 'Entrar na Plataforma'}
              </button>
              
              <button
                type="button"
                onClick={handleSignUp}
                disabled={loading}
                className="w-full bg-transparent border border-white/10 hover:bg-white/5 text-slate-300 font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-70"
              >
                Criar Nova Conta
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
