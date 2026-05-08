import { useState } from 'react'
import { Zap, Lock, Loader2, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) {
      toast.error('As senhas não coincidem')
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setDone(true)
      toast.success('Senha redefinida com sucesso!')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <Zap size={16} className="text-white" fill="currentColor" />
          </div>
          <span className="font-semibold text-zinc-100">Prospector</span>
        </div>

        <div className="card p-8">
          {done ? (
            <div className="text-center">
              <p className="text-zinc-100 font-medium mb-2">Senha redefinida!</p>
              <p className="text-zinc-500 text-sm mb-5">Você já pode fazer login com a nova senha.</p>
              <a href="/" className="btn-primary justify-center w-full">Ir para o login</a>
            </div>
          ) : (
            <>
              <h1 className="text-lg font-semibold text-zinc-100 mb-1">Nova senha</h1>
              <p className="text-sm text-zinc-500 mb-6">Digite e confirme sua nova senha</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Nova senha</label>
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

                <div>
                  <label className="label">Confirmar senha</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="input-base pl-9"
                      placeholder="••••••••"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  Redefinir senha
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
