import { useState } from 'react'
import { Zap, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [mode, setMode] = useState('login') // 'login' | 'signup' | 'forgot'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        toast.success('Conta criada! Faça login.')
        setMode('login')
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        })
        if (error) throw error
        toast.success('E-mail de redefinição enviado!')
        setMode('login')
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const titles = {
    login:  { h1: 'Entrar na conta',      sub: 'Bem-vindo de volta!' },
    signup: { h1: 'Criar conta',           sub: 'Comece a prospectar agora' },
    forgot: { h1: 'Redefinir senha',       sub: 'Enviaremos um link por e-mail' },
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">

        {/* Left — gradient */}
        <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-brand-600 via-brand-500 to-brand-400">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Zap size={16} className="text-white" fill="currentColor" />
            </div>
            <span className="font-semibold text-white text-sm">Prospector</span>
          </div>
          <div>
            <p className="text-white/70 text-sm mb-3">Gerencie seus leads com</p>
            <h2 className="text-3xl font-bold text-white leading-tight">
              Inteligência artificial<br />no seu processo<br />comercial
            </h2>
          </div>
          <p className="text-white/50 text-xs">
            Capture, organize e contate leads diretamente pelo WhatsApp.
          </p>
        </div>

        {/* Right — form */}
        <div className="bg-zinc-900 p-8 md:p-10 flex flex-col justify-center">
          {/* Logo mobile */}
          <div className="flex items-center gap-2 mb-8 md:hidden">
            <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
              <Zap size={14} className="text-white" fill="currentColor" />
            </div>
            <span className="font-semibold text-zinc-100 text-sm">Prospector</span>
          </div>

          <h1 className="text-xl font-semibold text-zinc-100 mb-1">{titles[mode].h1}</h1>
          <p className="text-sm text-zinc-500 mb-7">{titles[mode].sub}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="label">E-mail</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="email"
                  className="input-base pl-9"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Senha */}
            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="label mb-0">Senha</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-xs text-brand-400 hover:text-brand-300"
                    >
                      Esqueci a senha
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input-base pl-9 pr-10"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Criar conta' : 'Enviar link'}
            </button>
          </form>

          <p className="text-sm text-zinc-500 mt-5 text-center">
            {mode === 'forgot' ? (
              <button onClick={() => setMode('login')} className="text-brand-400 hover:text-brand-300 font-medium">
                ← Voltar ao login
              </button>
            ) : mode === 'login' ? (
              <>Não tem conta?{' '}
                <button onClick={() => setMode('signup')} className="text-brand-400 hover:text-brand-300 font-medium">
                  Criar conta
                </button>
              </>
            ) : (
              <>Já tem conta?{' '}
                <button onClick={() => setMode('login')} className="text-brand-400 hover:text-brand-300 font-medium">
                  Entrar
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
