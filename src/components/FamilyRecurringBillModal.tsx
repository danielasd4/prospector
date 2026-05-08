import React, { useState, useEffect } from 'react';
import { X, Zap, Calendar, Tag, Info, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { Company, RecurringBill } from '../hooks/useDashboardData';

interface FamilyRecurringBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  companies: Company[];
  initialData?: any;
}

export const FamilyRecurringBillModal: React.FC<FamilyRecurringBillModalProps> = ({
  isOpen,
  onClose,
  onSave,
  companies,
  initialData
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [data, setData] = useState<Partial<RecurringBill>>({
    title: '',
    amount: 0,
    category: 'Assinatura',
    due_day: 1,
    type: 'expense',
    recurrence: 'monthly',
    status: 'active',
    payment_status: 'pending',
    predictability: 'Fixa',
    company_id: companies.find(c => c.company_type === 'Financeiro Pessoal')?.id || companies[0]?.id || ''
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setData(initialData);
      } else {
        setData({
          title: '',
          amount: 0,
          category: 'Assinatura',
          due_day: 1,
          type: 'expense',
          recurrence: 'monthly',
          status: 'active',
          payment_status: 'pending',
          predictability: 'Fixa',
          company_id: companies.find(c => c.company_type === 'Financeiro Pessoal')?.id || companies[0]?.id || ''
        });
      }
      setError(null);
    }
  }, [isOpen, initialData, companies]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!data.title) { setError("Título é obrigatório."); return; }
    if (!data.amount || data.amount <= 0) { setError("Valor inválido."); return; }
    if (!data.company_id) { setError("Selecione uma conta."); return; }

    setIsSaving(true);
    setError(null);
    try {
      await onSave(data);
      onClose();
    } catch (e: any) {
      setError(e.message || "Erro ao salvar assinatura.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-zinc-200 overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-8 py-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div>
            <h2 className="text-xl font-black text-zinc-900 tracking-tight">Nova Assinatura / Conta Fixa</h2>
            <p className="text-xs font-medium text-zinc-500 mt-0.5">Gerencie os gastos recorrentes da família.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-200/50 rounded-full transition-colors text-zinc-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-in shake duration-300">
              <AlertCircle size={18} />
              <p className="text-xs font-bold leading-tight">{error}</p>
            </div>
          )}

          {/* Nome da Assinatura */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1">O que é? (Ex: Netflix, Aluguel)</label>
            <div className="relative group">
              <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input 
                autoFocus
                type="text" 
                value={data.title}
                onChange={e => setData({...data, title: e.target.value})}
                placeholder="Ex: Netflix Premium"
                className="input-premium pl-12 h-14 text-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Valor Mensal */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1">Valor Mensal</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold group-focus-within:text-emerald-600 transition-colors">R$</span>
                <input 
                  type="text" 
                  value={data.amount ? (data.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : ''}
                  onChange={e => {
                    const val = e.target.value.replace(/[^\d]/g, '');
                    setData({ ...data, amount: val ? parseFloat(val) / 100 : 0 });
                  }}
                  className="input-premium pl-12 h-14 text-xl font-black"
                  placeholder="0,00"
                />
              </div>
            </div>

            {/* Dia do Vencimento */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1">Dia do Vencimento</label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input 
                  type="number" 
                  min="1"
                  max="31"
                  value={data.due_day}
                  onChange={e => setData({...data, due_day: parseInt(e.target.value)})}
                  className="input-premium pl-12 h-14"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Conta */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1">Conta Familiar</label>
              <select 
                value={data.company_id}
                onChange={e => setData({...data, company_id: e.target.value})}
                className="input-premium h-14 bg-zinc-50/50"
              >
                {companies.map(company => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
            </div>

            {/* Categoria */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1">Categoria</label>
              <select 
                value={data.category}
                onChange={e => setData({...data, category: e.target.value})}
                className="input-premium h-14 bg-zinc-50/50"
              >
                <option value="Assinatura">Assinatura</option>
                <option value="Moradia">Moradia</option>
                <option value="Lazer">Lazer</option>
                <option value="Educação">Educação</option>
                <option value="Saúde">Saúde</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-zinc-50/80 border-t border-zinc-100 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 h-14 rounded-2xl font-bold text-zinc-500 hover:bg-zinc-200/50 transition-all border border-zinc-200 shadow-sm"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex-[2] h-14 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSaving ? "Salvando..." : "Confirmar Assinatura"}
          </button>
        </div>
      </div>
    </div>
  );
};
