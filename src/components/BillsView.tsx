import React, { useState } from 'react';
import { 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight, 
  CalendarDays, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  MoreVertical,
  Plus,
  Building2,
  Calendar
} from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { Company, Transaction, RecurringBill } from '../hooks/useDashboardData';
import { DashboardCard } from './DashboardCard';
import { InsightCard } from './InsightCard';
import { SectionTitle } from './ui/SectionTitle';

// Error Boundary Local para evitar quebras de página inteira
class ViewErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-12 text-center glass-card bg-white">
          <AlertCircle className="mx-auto text-rose-500 mb-4" size={48} />
          <h3 className="text-lg font-bold text-zinc-900">Ops! Esta aba encontrou um erro.</h3>
          <p className="text-zinc-500 mb-6">Pode haver um problema nos dados carregados.</p>
          <button onClick={() => window.location.reload()} className="btn-primary">Recarregar Sistema</button>
        </div>
      );
    }
    return this.props.children;
  }
}

interface BillsViewProps {
  companies: Company[];
  transactions: Transaction[];
  recurringBills: RecurringBill[];
  onAddBill: (data: Partial<RecurringBill>) => Promise<void>;
  onUpdateBill: (id: string, data: Partial<RecurringBill>) => Promise<void>;
  onDeleteBill: (id: string) => Promise<void>;
  onAddTransaction: (data: Partial<Transaction>) => Promise<void>;
}

export const BillsView = ({ 
  companies, 
  transactions, 
  recurringBills, 
  onAddBill, 
  onUpdateBill, 
  onDeleteBill,
  onAddTransaction
}: BillsViewProps) => {
  const [activeTab, setActiveTab] = useState<'all' | 'payable' | 'receivable' | 'pf' | 'pj'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingBill, setEditingBill] = useState<RecurringBill | null>(null);

  const pfCompany = (companies || []).find(c => (c.name || '').includes('PF'));
  
  const activeBills = (recurringBills || []).filter(b => b.status === 'active');
  const fixosPF = activeBills.filter(b => b.type === 'expense' && b.company_id === pfCompany?.id).reduce((acc, b) => acc + Number(b.amount), 0);
  const fixosPJ = activeBills.filter(b => b.type === 'expense' && b.company_id !== pfCompany?.id).reduce((acc, b) => acc + Number(b.amount), 0);
  const totalCustosFixos = fixosPF + fixosPJ;

  const activeBillsIncome = activeBills.filter(b => b.type === 'income').reduce((acc, b) => acc + Number(b.amount), 0);
  const sobraPrevista = activeBillsIncome - totalCustosFixos;

  const contasFuturas = activeBills.filter(b => b.type === 'expense' && b.payment_status === 'pending');

  const displayedBills = activeBills.filter(b => {
    if (activeTab === 'all') return true;
    if (activeTab === 'payable') return b.type === 'expense';
    if (activeTab === 'receivable') return b.type === 'income';
    if (activeTab === 'pf') return b.company_id === pfCompany?.id;
    if (activeTab === 'pj') return b.company_id !== pfCompany?.id;
    return true;
  }).sort((a, b) => (Number(a.due_day) || 0) - (Number(b.due_day) || 0));

  const getDayStatus = (dueDay: number, paymentStatus: string) => {
    if (paymentStatus === 'paid') return 'pago';
    const today = new Date().getDate();
    if (dueDay < today) return 'atrasado';
    if (dueDay - today <= 7) return 'proximo';
    return 'ok';
  };

  const handleMarkAsPaid = async (bill: RecurringBill) => {
    try {
      await onAddTransaction({
        company_id: bill.company_id,
        type: bill.type,
        amount: bill.amount,
        category: bill.category || 'Recorrência',
        subcategory: bill.subcategory || '',
        description: `Pgto: ${bill.title}`,
        status: 'paid',
        recurrence_type: 'recurring',
        predictability: 'Alta',
        transaction_date: new Date().toISOString(),
        hours_spent: 0
      });
      await onUpdateBill(bill.id, { payment_status: 'paid' });
    } catch (e) {
      console.error("Payment Error:", e);
      alert('Erro ao processar pagamento');
    }
  };

  const handleDuplicate = async (bill: RecurringBill) => {
    const newBill = { ...bill };
    delete (newBill as any).id;
    newBill.title = `${newBill.title} (Cópia)`;
    newBill.payment_status = 'pending';
    await onAddBill(newBill);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-2">
        <SectionTitle 
          title="Contas e Recorrências" 
          subtitle="Controle rigoroso dos seus compromissos e previsões."
          icon={Calendar}
          className="mb-0"
        />
        <button 
          onClick={() => { setEditingBill(null); setShowModal(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          <span>Nova Conta</span>
        </button>
      </header>

      {/* Strategic Metrics Top */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard title="Custos Fixos Totais" value={totalCustosFixos} icon={CreditCard} priority="high" variant="warning" />
        <DashboardCard title="Custos PF" value={fixosPF} icon={ArrowDownRight} priority="medium" variant="neutral" />
        <DashboardCard title="Custos PJ" value={fixosPJ} icon={Building2} priority="medium" variant="neutral" />
        <DashboardCard title="Sobra Projetada (Prev.)" value={sobraPrevista} icon={ArrowUpRight} priority="high" variant={sobraPrevista > 0 ? 'success' : 'danger'} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        {/* Left/Main Column: Bills List */}
        <div className="xl:col-span-2 space-y-6">
          <div className="glass-card overflow-hidden">
            <div className="flex flex-wrap gap-1.5 p-4 border-b border-zinc-100 bg-zinc-50/50">
              <button onClick={() => setActiveTab('all')} className={cn("px-3 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-all", activeTab === 'all' ? "bg-zinc-900 text-white" : "text-zinc-500 hover:bg-zinc-200")}>Todas</button>
              <button onClick={() => setActiveTab('payable')} className={cn("px-3 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-all", activeTab === 'payable' ? "bg-rose-100 text-rose-700" : "text-zinc-500 hover:bg-zinc-200")}>A Pagar</button>
              <button onClick={() => setActiveTab('receivable')} className={cn("px-3 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-all", activeTab === 'receivable' ? "bg-emerald-100 text-emerald-700" : "text-zinc-500 hover:bg-zinc-200")}>A Receber</button>
              <button onClick={() => setActiveTab('pf')} className={cn("px-3 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-all", activeTab === 'pf' ? "bg-amber-100 text-amber-700" : "text-zinc-500 hover:bg-zinc-200")}>Fixos PF</button>
              <button onClick={() => setActiveTab('pj')} className={cn("px-3 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-all", activeTab === 'pj' ? "bg-blue-100 text-blue-700" : "text-zinc-500 hover:bg-zinc-200")}>Fixos PJ</button>
            </div>

            <div className="divide-y divide-zinc-100">
              {displayedBills.length === 0 ? (
                <div className="p-10 text-center">
                  <p className="text-[13px] text-zinc-500 font-medium">Nenhuma conta encontrada nesta categoria.</p>
                </div>
              ) : (
                displayedBills.map(bill => {
                  const company = companies.find(c => c.id === bill.company_id);
                  const dStatus = getDayStatus(bill.due_day, bill.payment_status);
                  
                  return (
                    <div key={bill.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 hover:bg-zinc-50 transition-colors group bg-white">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-lg flex flex-col items-center justify-center shrink-0 border bg-white shadow-sm",
                          dStatus === 'pago' ? "border-zinc-200 text-zinc-400" :
                          dStatus === 'atrasado' ? "border-rose-200 text-rose-600 bg-rose-50" :
                          dStatus === 'proximo' ? "border-amber-200 text-amber-600 bg-amber-50" :
                          "border-zinc-200 text-zinc-900"
                        )}>
                          <span className="text-[9px] uppercase font-semibold tracking-wider opacity-60 leading-none mb-0.5">Dia</span>
                          <span className="leading-none text-[15px] font-bold font-display tracking-tight">{bill.due_day}</span>
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={cn("font-semibold text-[14px]", dStatus === 'pago' ? "text-zinc-400 line-through" : "text-zinc-900")}>{bill.title}</h4>
                            {bill.payment_status === 'paid' && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wider">Pago</span>}
                            {dStatus === 'atrasado' && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-50 text-rose-600 border border-rose-100 uppercase tracking-wider">Atrasado</span>}
                          </div>
                          <div className="flex items-center gap-2 text-[12px] font-medium text-zinc-500">
                            <span>{company?.name || 'Desconhecida'}</span>
                            <span className="w-1 h-1 rounded-full bg-zinc-300"></span>
                            <span>{bill.category}</span>
                            <span className="w-1 h-1 rounded-full bg-zinc-300"></span>
                            <span className="capitalize">{bill.recurrence}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/3 border-t border-zinc-100 sm:border-0 pt-3 sm:pt-0 mt-1 sm:mt-0">
                        <span className={cn(
                          "font-display font-semibold text-[16px] tracking-tight",
                          dStatus === 'pago' ? "text-zinc-400" :
                          bill.type === 'income' ? "text-emerald-600" : "text-zinc-900"
                        )}>
                          {bill.type === 'income' ? '+' : '-'} {formatCurrency(bill.amount)}
                        </span>
                        
                        {/* Quick Actions (Hover) */}
                        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          {bill.payment_status !== 'paid' && (
                            <button onClick={() => handleMarkAsPaid(bill)} title="Marcar como Pago e Lançar" className="btn-ghost p-1.5 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700">
                              <CheckCircle2 size={16} />
                            </button>
                          )}
                          <button onClick={() => { setEditingBill(bill); setShowModal(true); }} title="Editar" className="btn-ghost p-1.5">
                            <MoreVertical size={16} />
                          </button>
                          <button onClick={() => handleDuplicate(bill)} title="Duplicar" className="btn-ghost p-1.5 hidden sm:block">
                            <Copy size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Insights & Alerts */}
        <div className="xl:col-span-1 space-y-6">
          <section className="glass-card p-5 bg-rose-50/50 border-rose-100/50">
            <h3 className="text-[13px] font-semibold text-rose-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlertCircle size={14} />
              Atenção
            </h3>
            {contasFuturas.filter(b => getDayStatus(b.due_day, b.payment_status) === 'atrasado').length > 0 ? (
               <p className="text-[13px] text-rose-600 font-medium leading-relaxed">Você possui contas em atraso. Regularize para não impactar sua previsão de caixa.</p>
            ) : (
               <p className="text-[13px] text-rose-500/70 font-medium">Nenhuma conta em atraso no momento. Bom trabalho!</p>
            )}
          </section>

          <section className="glass-card p-5">
             <h3 className="text-[13px] font-semibold text-zinc-600 uppercase tracking-wider mb-4 flex items-center gap-2">
              <CalendarDays size={14} className="text-zinc-400" />
              Previsão Semanal
            </h3>
            <div className="space-y-3">
              <InsightCard text={`Existem ${contasFuturas.filter(b => getDayStatus(b.due_day, b.payment_status) === 'proximo').length} compromissos para os próximos 7 dias.`} type="warning" />
              <InsightCard text={`A sobra prevista para este mês é de ${formatCurrency(sobraPrevista)}.`} type="info" />
            </div>
          </section>
        </div>
      </div>

      {/* MODAL NOVA/EDITAR CONTA */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-[2px]" onClick={() => setShowModal(false)} />
          <div className="relative bg-white p-6 rounded-xl w-full max-w-lg shadow-2xl border border-zinc-200 animate-in fade-in zoom-in-95">
            <h3 className="text-[16px] font-semibold text-zinc-900 tracking-tight mb-6">
              {editingBill ? 'Editar Conta' : 'Nova Conta Recorrente / Fixa'}
            </h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const dataToSave = {
                title: formData.get('title') as string,
                amount: Number(formData.get('amount')),
                company_id: formData.get('company_id') as string,
                type: formData.get('type') as 'income' | 'expense',
                due_day: Number(formData.get('due_day')),
                recurrence: formData.get('recurrence') as string,
                category: formData.get('category') as string,
                status: 'active',
                payment_status: 'pending'
              };

              try {
                if (editingBill) {
                  await onUpdateBill(editingBill.id, dataToSave);
                } else {
                  await onAddBill(dataToSave);
                }
                setShowModal(false);
              } catch (err) {
                alert('Erro ao salvar conta.');
              }
            }} className="space-y-4">
              
              <div>
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Título da Conta</label>
                <input required name="title" defaultValue={editingBill?.title} type="text" className="input-premium" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Tipo</label>
                  <select name="type" defaultValue={editingBill?.type || 'expense'} className="input-premium">
                    <option value="expense">A Pagar (Saída)</option>
                    <option value="income">A Receber (Entrada)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Empresa Responsável</label>
                  <select required name="company_id" defaultValue={editingBill?.company_id} className="input-premium">
                    <option value="">Selecione...</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Valor Esperado (R$)</label>
                  <input required name="amount" defaultValue={editingBill?.amount} type="number" step="0.01" className="input-premium" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Dia Venc.</label>
                  <input required name="due_day" defaultValue={editingBill?.due_day} type="number" min="1" max="31" className="input-premium" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Categoria Principal</label>
                  <input name="category" defaultValue={editingBill?.category} type="text" placeholder="Ex: Software, Aluguel..." className="input-premium" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 block">Recorrência</label>
                  <select name="recurrence" defaultValue={editingBill?.recurrence || 'monthly'} className="input-premium">
                    <option value="monthly">Mensal</option>
                    <option value="weekly">Semanal</option>
                    <option value="yearly">Anual</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3 border-t border-zinc-100 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancelar</button>
                {editingBill && (
                  <button type="button" onClick={async () => {
                    if(confirm('Tem certeza?')) {
                      await onDeleteBill(editingBill.id);
                      setShowModal(false);
                    }
                  }} className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-md font-medium text-[13px] transition-colors">Excluir</button>
                )}
                <button type="submit" className="btn-primary flex-1">Salvar Conta</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
