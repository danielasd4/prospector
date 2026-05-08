import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { getAppSettings, saveAppSettings } from '../lib/supabase'
import { supabase } from '../lib/supabase'
import { LoadingState } from '../components/LoadingState'
import { Save, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'

const inputClass = "w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <div onClick={onChange} className={`w-10 h-5 rounded-full transition-colors cursor-pointer flex items-center ${value ? 'bg-brand-500' : 'bg-zinc-700'}`}>
      <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5 ${value ? 'translate-x-5' : 'translate-x-0'}`} />
    </div>
  )
}

export default function SettingsPage() {
  const { data: settings, isLoading } = useQuery({ queryKey: ['app-settings'], queryFn: getAppSettings })

  const [form, setForm] = useState({
    followup_1_days: 2,
    followup_2_days: 5,
    default_country_code: '55',
    generic_template: '',
    enable_score: true,
    enable_diagnostico: true,
  })

  useEffect(() => {
    if (settings) setForm(f => ({ ...f, ...settings }))
  }, [settings])

  const saveMutation = useMutation({
    mutationFn: () => saveAppSettings(form),
    onSuccess: () => toast.success('Configurações salvas!'),
    onError: () => toast.error('Erro ao salvar'),
  })

  if (isLoading) return <LoadingState />

  return (
    <div className="space-y-4 max-w-lg">
      <div>
        <h1 className="text-lg font-bold text-zinc-100">Configurações</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Personalize o comportamento do sistema</p>
      </div>

      <div className="card p-6 space-y-5">
        <h2 className="text-sm font-semibold text-zinc-300">Follow-up automático</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-zinc-500 block mb-1.5">Dias para follow-up 1</label>
            <input type="number" value={form.followup_1_days}
              onChange={e => setForm(f => ({ ...f, followup_1_days: Number(e.target.value) }))}
              className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-zinc-500 block mb-1.5">Dias para follow-up 2</label>
            <input type="number" value={form.followup_2_days}
              onChange={e => setForm(f => ({ ...f, followup_2_days: Number(e.target.value) }))}
              className={inputClass} />
          </div>
        </div>

        <div>
          <label className="text-xs text-zinc-500 block mb-1.5">Código do país (WhatsApp)</label>
          <input type="text" value={form.default_country_code}
            onChange={e => setForm(f => ({ ...f, default_country_code: e.target.value }))}
            className={inputClass} placeholder="55" />
        </div>

        <div className="space-y-4 pt-1">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-zinc-300">Score automático</span>
            <Toggle value={form.enable_score} onChange={() => setForm(f => ({ ...f, enable_score: !f.enable_score }))} />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-zinc-300">Diagnóstico automático</span>
            <Toggle value={form.enable_diagnostico} onChange={() => setForm(f => ({ ...f, enable_diagnostico: !f.enable_diagnostico }))} />
          </label>
        </div>

        <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-400 active:scale-95 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50">
          <Save className="w-4 h-4" /> Salvar configurações
        </button>
      </div>

      <div className="card p-6">
        <h2 className="text-sm font-semibold text-zinc-300 mb-4">Conta</h2>
        <button onClick={() => supabase.auth.signOut()}
          className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-medium transition-colors">
          <LogOut className="w-4 h-4" /> Sair da conta
        </button>
      </div>
    </div>
  )
}
