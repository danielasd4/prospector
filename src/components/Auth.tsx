import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Lock, 
  Mail, 
  Loader2, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Globe, 
  BarChart3, 
  CheckCircle2,
  LockKeyhole,
  UserCheck,
  ShieldAlert,
  Headphones
} from 'lucide-react';
import { cn } from '../lib/utils';

interface AuthProps {
  onLogin: () => void;
}

export const Auth = ({ onLogin }: AuthProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    setSuccess(null);
    setLoading(false);
  }, [isSignUp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        if (data.session) {
          onLogin();
        } else {
          setSuccess('Conta criada! Verifique seu e-mail para confirmar o acesso.');
          setIsSignUp(false);
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        onLogin();
      }
    } catch (err: any) {
      setError(err.message.includes("Invalid login credentials") ? "E-mail ou senha incorretos." : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Main Split Layout */}
      <div className="flex-1 flex flex-col lg:flex-row">
        
        {/* Left Side: Institutional / Branding */}
        <div className="hidden lg:flex lg:w-[45%] bg-[#080808] relative overflow-hidden flex-col justify-between p-12">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          </div>
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full" />
          
          {/* Logo & Slogan Area */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-16">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                <span className="font-display font-black text-xl text-black">V</span>
              </div>
              <span className="text-xl font-display font-bold text-white tracking-tight">VENCY HUB</span>
            </div>

            <div className="max-w-md space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                <ShieldCheck size={12} className="text-emerald-500" />
                Sua gestão. Seu crescimento. Seu futuro.
              </div>
              <h2 className="text-4xl xl:text-5xl font-display font-bold text-white leading-[1.1] tracking-tight">
                Um sistema completo para transformar a gestão da sua empresa.
              </h2>
              <p className="text-lg text-zinc-400 font-medium leading-relaxed">
                Tenha controle financeiro, organize suas empresas e tome decisões melhores com dados claros e confiáveis.
              </p>
            </div>

            {/* Trust Blocks */}
            <div className="mt-16 space-y-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <LockKeyhole size={20} className="text-zinc-400" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">Segurança de ponta</h4>
                  <p className="text-zinc-500 text-xs mt-1 leading-relaxed">Seus dados protegidos com criptografia e as melhores práticas do mercado.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <Globe size={20} className="text-zinc-400" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">Acesso em qualquer lugar</h4>
                  <p className="text-zinc-500 text-xs mt-1 leading-relaxed">Acesse de onde estiver. Web, mobile e sempre sincronizado.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <BarChart3 size={20} className="text-zinc-400" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">Informações que geram resultados</h4>
                  <p className="text-zinc-500 text-xs mt-1 leading-relaxed">Dashboards inteligentes para você decidir com confiança.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Partners / Social Proof */}
          <div className="relative z-10 pt-12 border-t border-white/5">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-6">Empresas que confiam</p>
            <div className="flex flex-wrap gap-8 items-center grayscale opacity-40 hover:opacity-70 transition-opacity">
              <span className="text-white font-display font-bold text-lg tracking-tighter">Google</span>
              <span className="text-white font-display font-bold text-lg tracking-tighter">Microsoft</span>
              <span className="text-white font-display font-bold text-lg tracking-tighter">Amazon</span>
              <span className="text-white font-display font-bold text-lg tracking-tighter">Uber</span>
              <span className="text-white font-display font-bold text-lg tracking-tighter">Airbnb</span>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex-1 flex flex-col justify-center items-center p-6 bg-white">
          <div className="w-full max-w-[440px] space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Form Header */}
            <div className="space-y-2">
              <h1 className="text-3xl font-display font-bold text-zinc-900 tracking-tight">
                {isSignUp ? 'Criar sua conta' : 'Bem-vindo de volta!'}
              </h1>
              <p className="text-zinc-500 font-medium text-sm">
                {isSignUp ? 'Comece sua jornada de gestão inteligente hoje.' : 'Faça login para acessar sua conta.'}
              </p>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold text-center animate-in shake-1">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold text-center">
                  {success}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemplo@email.com"
                    required
                    className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-zinc-900 focus:ring-0 outline-none transition-all font-medium text-zinc-900 placeholder:text-zinc-300"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Senha</label>
                  </div>
                  <div className="relative group">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-zinc-900 focus:ring-0 outline-none transition-all font-medium text-zinc-900 placeholder:text-zinc-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-zinc-300 hover:text-zinc-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              {!isSignUp && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center transition-all",
                      rememberMe ? "bg-zinc-900 border-zinc-900" : "bg-white border-zinc-300 group-hover:border-zinc-400"
                    )} onClick={() => setRememberMe(!rememberMe)}>
                      {rememberMe && <CheckCircle2 size={10} className="text-white" />}
                    </div>
                    <span className="text-[13px] font-medium text-zinc-500">Lembrar de mim</span>
                  </label>
                  <button type="button" className="text-[13px] font-bold text-zinc-400 hover:text-zinc-900 transition-colors">
                    Esqueci minha senha
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-zinc-900 hover:bg-black text-white rounded-xl font-bold text-sm shadow-lg shadow-zinc-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : isSignUp ? 'Criar minha conta' : 'Entrar'}
              </button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-100"></div></div>
                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest text-zinc-300 bg-white px-4">
                  ou continue com
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="w-full h-12 bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-700 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-3"
              >
                {googleLoading ? (
                  <Loader2 className="animate-spin text-zinc-400" size={18} />
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continuar com Google
                  </>
                )}
              </button>
            </form>

            {/* Bottom Footer Area */}
            <div className="pt-6 text-center">
              <p className="text-[13px] font-medium text-zinc-500">
                {isSignUp ? 'Já possui uma conta?' : 'Ainda não tem uma conta?'}
                <button 
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="ml-2 font-bold text-zinc-900 hover:underline"
                >
                  {isSignUp ? 'Fazer login' : 'Crie sua conta'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Bar Footer */}
      <footer className="bg-zinc-50 border-t border-zinc-100 py-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white rounded-lg border border-zinc-200 shadow-sm">
              <CheckCircle2 size={16} className="text-emerald-500" />
            </div>
            <div>
              <h5 className="text-[11px] font-black text-zinc-900 uppercase tracking-widest mb-1">Seus dados estão seguros</h5>
              <p className="text-[11px] font-medium text-zinc-500 leading-relaxed">Utilizamos criptografia avançada e os melhores padrões de segurança.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-white rounded-lg border border-zinc-200 shadow-sm">
              <UserCheck size={16} className="text-zinc-600" />
            </div>
            <div>
              <h5 className="text-[11px] font-black text-zinc-900 uppercase tracking-widest mb-1">Privacidade Garantida</h5>
              <p className="text-[11px] font-medium text-zinc-500 leading-relaxed">Seus dados nunca são compartilhados. Respeitamos sua privacidade.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-white rounded-lg border border-zinc-200 shadow-sm">
              <ShieldAlert size={16} className="text-zinc-600" />
            </div>
            <div>
              <h5 className="text-[11px] font-black text-zinc-900 uppercase tracking-widest mb-1">Conformidade</h5>
              <p className="text-[11px] font-medium text-zinc-500 leading-relaxed">Estamos em conformidade com a LGPD para proteger suas informações.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-white rounded-lg border border-zinc-200 shadow-sm">
              <Headphones size={16} className="text-zinc-600" />
            </div>
            <div>
              <h5 className="text-[11px] font-black text-zinc-900 uppercase tracking-widest mb-1">Suporte Humano</h5>
              <p className="text-[11px] font-medium text-zinc-500 leading-relaxed">Nosso time está pronto para te ajudar sempre que você precisar.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
