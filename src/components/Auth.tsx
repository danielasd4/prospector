import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Target, Lock, Mail, Loader2, Eye, EyeOff } from 'lucide-react';
import { cn } from '../lib/utils';

interface AuthProps {
  onLogin: () => void;
}

export const Auth = ({ onLogin }: AuthProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Limpar estados ao trocar de aba
  React.useEffect(() => {
    setError(null);
    setSuccess(null);
    setLoading(false);
  }, [isSignUp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (isSignUp) {
      console.log("[Auth] Criando conta...");
      try {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;
        
        if (data.session) {
          onLogin();
        } else {
          setSuccess('Conta criada! Verifique seu e-mail para confirmar o acesso.');
          setIsSignUp(false);
        }
      } catch (err: any) {
        if (err.message.includes("already registered")) {
          setError("Este e-mail já possui cadastro. Tente entrar.");
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    } else {
      console.log("[Auth] Acessando Hub...");
      try {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;
        onLogin();
      } catch (err: any) {
        if (err.message.includes("Invalid login credentials")) {
          setError("E-mail ou senha incorretos.");
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor - Premium Aura */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full" />

      <div className="w-full max-w-[420px] z-10">
        {/* Header - Direct & Powerful */}
        <div className="flex flex-col items-center mb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="w-14 h-14 rounded-xl bg-white text-black flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.1)] mb-8">
            <span className="font-display font-black text-2xl tracking-tighter">V</span>
          </div>
          <h1 className="text-4xl font-display font-bold text-white tracking-tighter mb-3">Vency Hub</h1>
          <p className="text-zinc-500 font-medium text-center text-sm leading-relaxed max-w-[280px]">
            Gestão empresarial e familiar <br /> unificada em um único lugar.
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass-card p-8 rounded-[40px] border border-white/5 shadow-2xl animate-in fade-in zoom-in-95 duration-700">
          <div className="flex bg-white/5 p-1 rounded-2xl mb-10 border border-white/5">
            <button 
              type="button"
              onClick={() => setIsSignUp(false)}
              className={cn(
                "flex-1 py-3 text-[12px] font-black uppercase tracking-widest rounded-xl transition-all duration-300",
                !isSignUp ? "bg-white text-black shadow-xl" : "text-zinc-500 hover:text-zinc-300"
              )}
            >Entrar</button>
            <button 
              type="button"
              onClick={() => setIsSignUp(true)}
              className={cn(
                "flex-1 py-3 text-[12px] font-black uppercase tracking-widest rounded-xl transition-all duration-300",
                isSignUp ? "bg-white text-black shadow-xl" : "text-zinc-500 hover:text-zinc-300"
              )}
            >Criar Conta</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-bold text-center animate-in shake-1">
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold text-center">
                {success}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Identificação</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 transition-colors group-focus-within:text-white" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu e-mail"
                  required
                  className="w-full bg-white/[0.03] border border-white/5 hover:border-white/10 focus:border-white/20 focus:bg-white/[0.05] rounded-2xl pl-12 pr-4 py-4 text-white outline-none transition-all placeholder:text-zinc-700 text-sm font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Senha</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 transition-colors group-focus-within:text-white" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white/[0.03] border border-white/5 hover:border-white/10 focus:border-white/20 focus:bg-white/[0.05] rounded-2xl pl-12 pr-12 py-4 text-white outline-none transition-all placeholder:text-zinc-700 text-sm font-medium"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white hover:bg-zinc-200 text-black font-black py-4 rounded-2xl transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.05)] flex items-center justify-center gap-3 disabled:opacity-50 mt-8 text-[12px] uppercase tracking-widest"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : (isSignUp ? 'Finalizar Registro' : 'Acessar Painel')}
            </button>
          </form>
        </div>
        
        <div className="mt-12 flex items-center justify-between px-2">
          <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">v2.4 Production</span>
          <div className="flex gap-4">
            <span className="text-[10px] text-zinc-500 hover:text-white cursor-pointer transition-colors font-bold uppercase tracking-widest">Segurança</span>
            <span className="text-[10px] text-zinc-500 hover:text-white cursor-pointer transition-colors font-bold uppercase tracking-widest">Termos</span>
          </div>
        </div>
      </div>
    </div>
  );
};
