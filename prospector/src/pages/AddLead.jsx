import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Link2, ImageUp, Sparkles, Pencil, Loader2, CheckCircle2,
  AlertCircle, X, ArrowRight, RotateCcw, Save, MapPin,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { extractFromGoogleMapsLink, extractFromImage, SEGMENTOS_LIST } from '../lib/extractInfo'
import { createLead, getConfig } from '../lib/supabase'
import { openWhatsApp, DEFAULT_MESSAGE } from '../lib/whatsapp'
import QuickActions from '../components/QuickActions'

const STEP_CAPTURE  = 'capture'
const STEP_REVIEW   = 'review'
const STEP_SAVED    = 'saved'

const EMPTY_FORM = {
  nome: '', segmento: '', cidade: '', telefone: '',
  instagram: '', site: '', endereco: '', google_link: '',
  origem: 'manual', observacoes: '',
}

export default function AddLead() {
  const navigate = useNavigate()
  const [step, setStep] = useState(STEP_CAPTURE)
  const [mode, setMode] = useState(null) // 'link' | 'image' | 'manual'
  const [link, setLink] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [extracting, setExtracting] = useState(false)
  const [extractError, setExtractError] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [savedLead, setSavedLead] = useState(null)
  const [saving, setSaving] = useState(false)
  const [msgTemplate, setMsgTemplate] = useState(DEFAULT_MESSAGE)
  const fileRef = useRef()

  useEffect(() => {
    getConfig('mensagem_whatsapp').then((v) => { if (v) setMsgTemplate(v) })
  }, [])

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  // ─── Extraction ──────────────────────────────────────────────────────────────

  const handleExtractLink = async () => {
    if (!link.trim()) return
    setExtracting(true)
    setExtractError(null)
    try {
      const data = await extractFromGoogleMapsLink(link)
      setForm({ ...EMPTY_FORM, ...data, google_link: link })
      setStep(STEP_REVIEW)
    } catch (err) {
      setExtractError(err.message)
    } finally {
      setExtracting(false)
    }
  }

  const handleExtractImage = async () => {
    if (!imageFile) return
    setExtracting(true)
    setExtractError(null)
    try {
      const data = await extractFromImage(imageFile)
      setForm({ ...EMPTY_FORM, ...data })
      setStep(STEP_REVIEW)
    } catch (err) {
      setExtractError(err.message)
    } finally {
      setExtracting(false)
    }
  }

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleManual = () => {
    setForm(EMPTY_FORM)
    setMode('manual')
    setStep(STEP_REVIEW)
  }

  // ─── Save ─────────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!form.nome.trim()) { toast.error('Nome é obrigatório'); return }
    setSaving(true)
    try {
      const { confianca, ...formData } = form
      const lead = await createLead({ ...formData, status: 'novo' })
      setSavedLead(lead)
      setStep(STEP_SAVED)
      toast.success('Lead salvo com sucesso!')
    } catch (err) {
      toast.error('Erro ao salvar: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setStep(STEP_CAPTURE)
    setMode(null)
    setLink('')
    setImageFile(null)
    setImagePreview(null)
    setForm(EMPTY_FORM)
    setSavedLead(null)
    setExtractError(null)
  }

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-xl font-semibold text-zinc-100">Novo Lead</h1>
          <StepIndicator step={step} />
        </div>
        <p className="text-sm text-zinc-500">
          {step === STEP_CAPTURE && 'Escolha como deseja capturar o lead'}
          {step === STEP_REVIEW  && 'Revise e edite as informações antes de salvar'}
          {step === STEP_SAVED   && 'Lead salvo! Agora você pode entrar em contato'}
        </p>
      </div>

      {/* ── STEP 1: Capture ────────────────────────────────────────────── */}
      {step === STEP_CAPTURE && (
        <div className="space-y-3 animate-in">
          {/* Link */}
          <div className={`card p-5 ${mode === 'link' ? 'border-brand-500/40' : ''}`}>
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => setMode(mode === 'link' ? null : 'link')}
            >
              <div className="w-9 h-9 rounded-lg bg-brand-500/10 flex items-center justify-center">
                <Link2 size={16} className="text-brand-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-100">Colar link do Google Maps</p>
                <p className="text-xs text-zinc-500">A IA extrai as informações automaticamente</p>
              </div>
            </div>

            {mode === 'link' && (
              <div className="mt-4 space-y-3 animate-in">
                <input
                  className="input-base"
                  placeholder="https://maps.google.com/maps/place/..."
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleExtractLink()}
                  autoFocus
                />
                {extractError && (
                  <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
                    <AlertCircle size={12} className="shrink-0 mt-0.5" />
                    {extractError}
                  </div>
                )}
                <button
                  onClick={handleExtractLink}
                  disabled={!link.trim() || extracting}
                  className="btn-primary w-full justify-center"
                >
                  {extracting
                    ? <><Loader2 size={14} className="animate-spin" /> Extraindo informações...</>
                    : <><Sparkles size={14} /> Buscar informações</>
                  }
                </button>
              </div>
            )}
          </div>

          {/* Image */}
          <div className={`card p-5 ${mode === 'image' ? 'border-violet-500/40' : ''}`}>
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => setMode(mode === 'image' ? null : 'image')}
            >
              <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <ImageUp size={16} className="text-violet-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-100">Upload de print</p>
                <p className="text-xs text-zinc-500">Envie um screenshot da ficha do negócio</p>
              </div>
            </div>

            {mode === 'image' && (
              <div className="mt-4 space-y-3 animate-in">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                />

                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full max-h-48 object-contain rounded-lg bg-zinc-800 border border-zinc-700"
                    />
                    <button
                      onClick={() => { setImageFile(null); setImagePreview(null) }}
                      className="absolute top-2 right-2 w-6 h-6 bg-zinc-900/80 rounded-full flex items-center justify-center hover:bg-zinc-800"
                    >
                      <X size={12} className="text-zinc-400" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="w-full border-2 border-dashed border-zinc-700 hover:border-zinc-500 rounded-xl
                               py-8 flex flex-col items-center gap-2 transition-colors"
                  >
                    <ImageUp size={24} className="text-zinc-600" />
                    <span className="text-sm text-zinc-500">Clique para selecionar imagem</span>
                    <span className="text-xs text-zinc-600">PNG, JPG, WEBP</span>
                  </button>
                )}

                {extractError && (
                  <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
                    <AlertCircle size={12} className="shrink-0 mt-0.5" />
                    {extractError}
                  </div>
                )}

                <button
                  onClick={handleExtractImage}
                  disabled={!imageFile || extracting}
                  className="btn-primary w-full justify-center"
                >
                  {extracting
                    ? <><Loader2 size={14} className="animate-spin" /> Analisando imagem...</>
                    : <><Sparkles size={14} /> Extrair informações</>
                  }
                </button>
              </div>
            )}
          </div>

          {/* Manual */}
          <div className="card p-5">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={handleManual}
            >
              <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center">
                <Pencil size={16} className="text-zinc-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-zinc-100">Cadastrar manualmente</p>
                <p className="text-xs text-zinc-500">Preencha os dados você mesmo</p>
              </div>
              <ArrowRight size={14} className="text-zinc-600" />
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 2: Review ─────────────────────────────────────────────── */}
      {step === STEP_REVIEW && (
        <div className="animate-in space-y-4">
          {/* Info banner */}
          {form.confianca && (
            <div className={`flex items-center gap-2 p-3 rounded-lg text-xs border
              ${form.confianca === 'alta'
                ? 'bg-brand-500/10 border-brand-500/20 text-brand-400'
                : form.confianca === 'media'
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                : 'bg-zinc-800 border-zinc-700 text-zinc-400'
              }`
            }>
              <Sparkles size={12} />
              Extração com confiança{' '}
              <strong>{form.confianca === 'alta' ? 'alta' : form.confianca === 'media' ? 'média' : 'baixa'}</strong>
              . Revise os campos antes de salvar.
            </div>
          )}

          <div className="card p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">Nome do negócio *</label>
                <input
                  className="input-base"
                  placeholder="Ex: Clínica Estética Bella Forma"
                  value={form.nome}
                  onChange={(e) => setField('nome', e.target.value)}
                  autoFocus
                />
              </div>

              <div>
                <label className="label">Segmento</label>
                <select
                  className="input-base"
                  value={form.segmento}
                  onChange={(e) => setField('segmento', e.target.value)}
                >
                  <option value="">Selecionar...</option>
                  {SEGMENTOS_LIST.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Cidade</label>
                <input
                  className="input-base"
                  placeholder="São Paulo, SP"
                  value={form.cidade}
                  onChange={(e) => setField('cidade', e.target.value)}
                />
              </div>

              <div>
                <label className="label">Telefone / WhatsApp</label>
                <input
                  className="input-base"
                  placeholder="(11) 99999-9999"
                  value={form.telefone}
                  onChange={(e) => setField('telefone', e.target.value)}
                />
              </div>

              <div>
                <label className="label">Instagram</label>
                <input
                  className="input-base"
                  placeholder="@perfil"
                  value={form.instagram}
                  onChange={(e) => setField('instagram', e.target.value)}
                />
              </div>

              <div>
                <label className="label">Site</label>
                <input
                  className="input-base"
                  placeholder="https://..."
                  value={form.site}
                  onChange={(e) => setField('site', e.target.value)}
                />
              </div>

              <div>
                <label className="label">Link Google Maps</label>
                <input
                  className="input-base"
                  placeholder="https://maps.google.com/..."
                  value={form.google_link}
                  onChange={(e) => setField('google_link', e.target.value)}
                />
              </div>

              <div className="col-span-2">
                <label className="label">Endereço</label>
                <input
                  className="input-base"
                  placeholder="Rua, número, bairro..."
                  value={form.endereco}
                  onChange={(e) => setField('endereco', e.target.value)}
                />
              </div>

              <div className="col-span-2">
                <label className="label">Observações</label>
                <textarea
                  className="input-base resize-none"
                  rows={2}
                  placeholder="Notas internas..."
                  value={form.observacoes}
                  onChange={(e) => setField('observacoes', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={handleReset} className="btn-secondary gap-2">
              <RotateCcw size={14} />
              Recomeçar
            </button>
            <button
              onClick={handleSave}
              disabled={!form.nome.trim() || saving}
              className="btn-primary flex-1 justify-center"
            >
              {saving
                ? <><Loader2 size={14} className="animate-spin" /> Salvando...</>
                : <><Save size={14} /> Salvar Lead</>
              }
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Saved ──────────────────────────────────────────────── */}
      {step === STEP_SAVED && savedLead && (
        <div className="animate-in space-y-4">
          {/* Success */}
          <div className="card p-5 border-brand-500/30 bg-brand-500/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center">
                <CheckCircle2 size={18} className="text-brand-400" />
              </div>
              <div>
                <p className="font-semibold text-zinc-100">{savedLead.nome}</p>
                <p className="text-xs text-zinc-500">
                  {savedLead.segmento && `${savedLead.segmento} · `}
                  {savedLead.cidade}
                </p>
              </div>
            </div>

            {/* Quick info */}
            <div className="grid grid-cols-2 gap-2 text-xs mb-4">
              {savedLead.telefone && (
                <InfoChip label="Telefone" value={savedLead.telefone} />
              )}
              {savedLead.instagram && (
                <InfoChip label="Instagram" value={savedLead.instagram} />
              )}
              {savedLead.endereco && (
                <InfoChip label="Endereço" value={savedLead.endereco} className="col-span-2" />
              )}
            </div>

            {/* Actions */}
            <div className="border-t border-zinc-800 pt-4">
              <p className="text-xs text-zinc-500 mb-3">Ações rápidas</p>
              <QuickActions
                lead={savedLead}
                messageTemplate={msgTemplate}
                onUpdate={async (id, updates) => {
                  setSavedLead((l) => ({ ...l, ...updates }))
                }}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={handleReset} className="btn-secondary flex-1 justify-center">
              <MapPin size={14} />
              Adicionar outro
            </button>
            <button
              onClick={() => navigate('/leads')}
              className="btn-primary flex-1 justify-center"
            >
              Ver todos os leads
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function StepIndicator({ step }) {
  const steps = [STEP_CAPTURE, STEP_REVIEW, STEP_SAVED]
  const idx = steps.indexOf(step)
  return (
    <div className="flex items-center gap-1 ml-2">
      {steps.map((s, i) => (
        <div
          key={s}
          className={`h-1.5 rounded-full transition-all ${
            i <= idx ? 'w-4 bg-brand-500' : 'w-1.5 bg-zinc-700'
          }`}
        />
      ))}
    </div>
  )
}

function InfoChip({ label, value, className = '' }) {
  return (
    <div className={`bg-zinc-800 rounded-lg px-3 py-2 ${className}`}>
      <p className="text-zinc-500 text-xs">{label}</p>
      <p className="text-zinc-200 mt-0.5 truncate">{value}</p>
    </div>
  )
}
