import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { getAppSettings, saveAppSettings } from '../lib/supabase'
import { supabase } from '../lib/supabase'
import { LoadingState } from '../components/LoadingState'
import { Save, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { data: settings, isLoading } = useQuery({
    queryKey: ['app-settings'],
    queryFn: getAppSettings,
  })

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

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  if (isLoading) return <LoadingState />

  return (
    <div className="space-y-4 max-w-lg">
      <div>
        <h1 className="text-lg font-bold text-gray-900">Configurações</h1>
        <p className="text-sm text-gray-500 mt-0.5">Personalize o comportamento do sistema</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">Follow-up</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Dias para follow-up 1</label>
            <input
              type="number"
              value={form.followup_1_days}
              onChange={e => setForm(f => ({ ...f, followup_1_days: Number(e.target.value) }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Dias para follow-up 2</label>
            <input
              type="number"
              value={form.followup_2_days}
              onChange={e => setForm(f => ({ ...f, followup_2_days: Number(e.target.value) }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">Código do país (WhatsApp)</label>
          <input
            type="text"
            value={form.default_country_code}
            onChange={e => setForm(f => ({ ...f, default_country_code: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400"
            placeholder="55"
          />
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setForm(f => ({ ...f, enable_score: !f.enable_score }))}
              className={`w-10 h-5 rounded-full transition-colors cursor-pointer ${
                form.enable_score ? 'bg-brand-500' : 'bg-gray-200'
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full shadow mt-0.5 transition-transform ${
                  form.enable_score ? 'translate-x-5 ml-0.5' : 'ml-0.5'
                }`}
              />
            </div>
            <span className="text-sm text-gray-700">Score automático</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setForm(f => ({ ...f, enable_diagnostico: !f.enable_diagnostico }))}
              className={`w-10 h-5 rounded-full transition-colors cursor-pointer ${
                form.enable_diagnostico ? 'bg-brand-500' : 'bg-gray-200'
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full shadow mt-0.5 transition-transform ${
                  form.enable_diagnostico ? 'translate-x-5 ml-0.5' : 'ml-0.5'
                }`}
              />
            </div>
            <span className="text-sm text-gray-700">Diagnóstico automático</span>
          </label>
        </div>

        <button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
        >
          <Save className="w-4 h-4" /> Salvar configurações
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Conta</h2>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-500 hover:text-red-600 text-sm font-medium transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sair da conta
        </button>
      </div>
    </div>
  )
}
