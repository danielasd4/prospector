import { useState, useEffect } from 'react'
import { Save, Loader2, MessageCircle, Key, Info, Eye, EyeOff, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'
import { getConfig, setConfig } from '../lib/supabase'
import { DEFAULT_MESSAGE, formatMessage } from '../lib/whatsapp'

const LEAD_EXAMPLE = { nome: 'Clínica Bella Forma', segmento: 'Clínica estética', cidade: 'São Paulo' }

const VARIABLES = [
  { tag: '{nome}', desc: 'Nome do negócio' },
  { tag: '{segmento}', desc: 'Segmento do lead' },
  { tag: '{cidade}', desc: 'Cidade do lead' },
]

export default function Settings() {
  const [message, setMessage] = useState(DEFAULT_MESSAGE)
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // Supabase keys (display only)
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  const anthropicKey = import.meta.env.VITE_OPENAI_API_KEY || ''
  const [showKeys, setShowKeys] = useState(false)

  useEffect(() => {
    getConfig('mensagem_whatsapp').then((v) => {
      if (v) setMessage(v)
      setLoaded(true)
    })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await setConfig('mensagem_whatsapp', message)
      toast.success('Mensagem salva com sucesso!')
    } catch (err) {
      toast.error('Erro ao salvar: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const preview = formatMessage(message, LEAD_EXAMPLE)
  const maskKey = (k) => k ? k.slice(0, 8) + '••••••••' + k.slice(-4) : '—'

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-100">Configurações</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Personalize o comportamento do sistema</p>
      </div>

      <div className="space-y-4">
        {/* Mensagem WhatsApp */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle size={16} className="text-brand-400" />
            <h2 className="font-medium text-zinc-100 text-sm">Mensagem padrão do WhatsApp</h2>
          </div>

          {/* Variables reference */}
          <div className="flex flex-wrap gap-2 mb-3">
            {VARIABLES.map(({ tag, desc }) => (
              <button
                key={tag}
                onClick={() => setMessage((m) => m + tag)}
                title={`Inserir ${desc}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700
                           border border-zinc-700 rounded-lg text-xs text-zinc-300 transition-colors font-mono"
              >
                {tag}
                <span className="text-zinc-500 font-sans">→ {desc}</span>
              </button>
            ))}
          </div>

          <textarea
            className="input-base resize-none font-mono text-xs leading-relaxed"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Digite sua mensagem padrão..."
            disabled={!loaded}
          />

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPreview((v) => !v)}
                className="btn-ghost text-xs"
              >
                {showPreview ? <EyeOff size={12} /> : <Eye size={12} />}
                {showPreview ? 'Ocultar' : 'Preview'}
              </button>
              <button
                onClick={() => setMessage(DEFAULT_MESSAGE)}
                className="btn-ghost text-xs text-zinc-500"
              >
                <RotateCcw size={12} />
                Restaurar padrão
              </button>
            </div>
            <button
              onClick={handleSave}
              disabled={saving || !loaded}
              className="btn-primary"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              Salvar mensagem
            </button>
          </div>

          {showPreview && (
            <div className="mt-3 p-4 bg-zinc-800 rounded-xl border border-zinc-700 animate-in">
              <p className="text-xs text-zinc-500 mb-2 flex items-center gap-1">
                <Info size={10} />
                Preview com lead de exemplo
              </p>
              <p className="text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">{preview}</p>
            </div>
          )}
        </div>

        {/* Environment Info */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Key size={16} className="text-zinc-400" />
              <h2 className="font-medium text-zinc-100 text-sm">Variáveis de ambiente</h2>
            </div>
            <button
              onClick={() => setShowKeys((v) => !v)}
              className="btn-ghost text-xs"
            >
              {showKeys ? <EyeOff size={12} /> : <Eye size={12} />}
              {showKeys ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>

          <div className="space-y-3">
            <EnvRow
              label="VITE_SUPABASE_URL"
              value={supabaseUrl}
              show={showKeys}
              ok={!!supabaseUrl}
            />
            <EnvRow
              label="VITE_SUPABASE_ANON_KEY"
              value={supabaseKey}
              show={showKeys}
              ok={!!supabaseKey}
              mask
            />
            <EnvRow
              label="VITE_OPENAI_API_KEY"
              value={anthropicKey}
              show={showKeys}
              ok={!!anthropicKey}
              mask
            />
          </div>

          <div className="mt-4 p-3 bg-zinc-800 rounded-lg border border-zinc-700">
            <p className="text-xs text-zinc-500 leading-relaxed">
              Configure essas variáveis no arquivo <code className="text-brand-400 font-mono">.env</code> na raiz do projeto.
              Copie o <code className="text-zinc-300 font-mono">.env.example</code> como base.
              Reinicie o servidor após alterar.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function EnvRow({ label, value, show, ok, mask }) {
  const display = !value ? '—' : show ? value : mask ? '••••••••' : value
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs font-mono text-zinc-500">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-mono truncate max-w-48 ${ok ? 'text-zinc-300' : 'text-red-400'}`}>
          {display}
        </span>
        <div className={`w-2 h-2 rounded-full ${ok ? 'bg-brand-500' : 'bg-red-500'}`} />
      </div>
    </div>
  )
}
