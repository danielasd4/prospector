import React, { useState, useEffect } from 'react'
import { X, ArrowRight, Zap, Users, BarChart2, MessageCircle, CheckCircle } from 'lucide-react'

const STEPS = [
  {
    icon: Zap,
    title: 'Bem-vindo ao Prospector!',
    description: 'Sua central de prospecção inteligente. Adicione leads, envie mensagens personalizadas e acompanhe cada contato em um só lugar.',
    color: 'text-brand-400',
    bg: 'bg-brand-500/10',
  },
  {
    icon: Users,
    title: 'Adicione seus leads',
    description: 'Clique em "Novo lead" na página de Leads. Você pode colar um link do Google Maps para preencher automaticamente, ou enviar uma foto do negócio.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    icon: MessageCircle,
    title: 'Contate com um clique',
    description: 'Cada lead tem uma mensagem personalizada gerada automaticamente. Clique no botão verde do WhatsApp para enviar direto — sem copiar e colar.',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
  },
  {
    icon: CheckCircle,
    title: 'Acompanhe o follow-up',
    description: 'O Dashboard mostra quem precisa de follow-up. Leads que não responderam aparecem automaticamente para você não perder nenhuma oportunidade.',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
  },
  {
    icon: BarChart2,
    title: 'Analise seus resultados',
    description: 'Na aba Analytics você vê o funil completo: quantos contatou, responderam e fecharam. Use isso para melhorar sua abordagem.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
]

const STORAGE_KEY = 'prospector_onboarding_done'

export function OnboardingTour() {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY)
    if (!done) setVisible(true)
  }, [])

  function finish() {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  const current = STEPS[step]
  const Icon = current.icon
  const isLast = step === STEPS.length - 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-0">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === step ? 'w-6 bg-brand-500' : i < step ? 'w-3 bg-brand-500/40' : 'w-3 bg-zinc-700'
                }`}
              />
            ))}
          </div>
          <button onClick={finish} className="text-zinc-600 hover:text-zinc-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-6 text-center">
          <div className={`w-14 h-14 rounded-2xl ${current.bg} flex items-center justify-center mx-auto mb-4`}>
            <Icon className={`w-7 h-7 ${current.color}`} />
          </div>
          <h2 className="text-lg font-bold text-zinc-100 mb-2">{current.title}</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">{current.description}</p>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex items-center gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-sm text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-colors"
            >
              Anterior
            </button>
          )}
          <button
            onClick={() => isLast ? finish() : setStep(s => s + 1)}
            className="flex-1 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 active:scale-95 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25"
          >
            {isLast ? 'Começar' : 'Próximo'}
            {!isLast && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}
