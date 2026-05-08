import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Filter, 
  CheckCircle2, 
  Archive,
  Calendar,
  AlertCircle,
  Download,
  FileText,
  UploadCloud,
  Wallet,
  Trash2
} from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { InsightCard } from './InsightCard';
import { SectionTitle } from './ui/SectionTitle';
import { Company, Transaction, RecurringBill } from '../hooks/useDashboardData';
import { generateFinancialInsights } from '../lib/generateInsights';

interface FinanceViewProps {
  transactions: Transaction[];
  companies: Company[];
  recurringBills: RecurringBill[];
  onEditTransaction: (tx: Transaction) => void;
  onUpdateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>;
  onArchiveTransaction: (id: string) => void;
  onHardDeleteTransaction: (id: string) => void;
  onOpenReceiptModal: () => void;
}

export const FinanceView = ({ 
  transactions, 
  companies, 
  recurringBills, 
  onEditTransaction, 
  onUpdateTransaction,
  onArchiveTransaction,
  onHardDeleteTransaction, 
  onOpenReceiptModal 
}: FinanceViewProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const insights = generateFinancialInsights(transactions, recurringBills);

  const formatDate = (isoString: string) => {
    if (!isoString) return 'Sem data';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Data inválida';
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(date);
  };

  const filteredTransactions = transactions.filter(tx => {
    if (activeFilter === 'entradas') return tx.type === 'income';
    if (activeFilter === 'saídas') return tx.type === 'expense';
    if (activeFilter === 'recorrente') return tx.recurrence_type === 'recurring';
    if (activeFilter === 'variável') return tx.recurrence_type === 'variable';
    if (activeFilter === 'pendente') return tx.status === 'pending';
    return true; 
  }).filter(tx => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    const company = (companies.find(c => c.id === tx.company_id)?.name || '').toLowerCase();
    return (
      tx.description?.toLowerCase().includes(search) || 
      tx.category?.toLowerCase().includes(search) ||
      company.includes(search)
    );
  });

  const getCompanyName = (id: string) => companies.find(c => c.id === id)?.name || 'Desconhecida';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-2">
        <SectionTitle 
          title="Gestão de Caixa" 
          subtitle="O centro financeiro rigoroso da sua operação."
          icon={Wallet}
          className="mb-0"
        />
        
        <div className="flex items-center gap-3">
          <button onClick={onOpenReceiptModal} className="btn-secondary">
            <UploadCloud size={16} />
            <span className="text-[13px]">Scan de Comprovante</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 space-y-6">
          
          {/* Search and Filters */}
          <div className="glass-card p-4 flex flex-col lg:flex-row gap-4 justify-between items-center z-20 relative">
            <div className="relative w-full lg:w-96 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Buscar (ex: aws, canva, cliente x...)" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-premium pl-9 text-[13px]"
              />
            </div>
            
            <div className="flex gap-1.5 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 scrollbar-hide">
              {['all', 'entradas', 'saídas', 'recorrente', 'variável', 'pendente'].map(filter => (
                <button 
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap transition-all border",
                    activeFilter === filter 
                      ? "bg-zinc-900 border-zinc-900 text-white shadow-sm" 
                      : "bg-white border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 hover:bg-zinc-50"
                  )}
                >
                  {filter === 'all' ? 'Tudo' : filter}
                </button>
              ))}
              <button className="btn-ghost ml-1">
                <Filter size={14} />
              </button>
            </div>
          </div>

          {/* Transaction List */}
          <div className="glass-card overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Movimentações</span>
              <span className="text-[11px] font-semibold text-zinc-400">{filteredTransactions.length} registros</span>
            </div>
            
            <div className="divide-y divide-zinc-100">
              {filteredTransactions.length === 0 ? (
                <div className="p-12 text-center text-zinc-500 flex flex-col items-center bg-white">
                  <Search size={24} className="mb-3 text-zinc-300" />
                  <p className="text-[13px] font-medium">Nenhuma movimentação atende aos critérios.</p>
                </div>
              ) : (
                filteredTransactions.map((tx) => (
                  <div key={tx.id} className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group hover:bg-zinc-50 transition-colors bg-white">
                    
                    <div className="flex items-center gap-4 flex-1">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border",
                        tx.type === 'income' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                      )}>
                        {tx.type === 'income' ? <TrendingUp size={16} strokeWidth={2.5} /> : <TrendingDown size={16} strokeWidth={2.5} />}
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-zinc-900 text-[14px]">{tx.description || tx.category}</span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider border border-zinc-200 bg-zinc-100 text-zinc-500">
                            {getCompanyName(tx.company_id)}
                          </span>
                          {tx.recurrence_type === 'recurring' && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider border border-blue-200 bg-blue-50 text-blue-600">
                              Recorrente
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[12px] font-medium text-zinc-500">
                          <span>{formatDate(tx.transaction_date)}</span>
                          <span className="w-1 h-1 rounded-full bg-zinc-300"></span>
                          <span>{tx.category}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t border-zinc-100 sm:border-0 pt-3 sm:pt-0 mt-1 sm:mt-0">
                      <div className="text-right">
                        <div className={cn(
                          "font-display font-semibold text-[17px] tracking-tight",
                          tx.type === 'income' ? 'text-emerald-600' : 'text-zinc-900'
                        )}>
                          {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                        </div>
                        <div className="flex items-center justify-end gap-1 text-[11px] font-semibold mt-0.5">
                          {tx.status === 'paid' ? (
                            <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 size={10} /> Liquidado</span>
                          ) : (
                            <span className="text-amber-600 flex items-center gap-1"><AlertCircle size={10} /> Pendente</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onEditTransaction(tx)} className="btn-ghost p-1.5" title="Editar">
                          <FileText size={14} />
                        </button>
                        <button onClick={() => { if(confirm('Arquivar? O registro sumirá daqui mas continuará existindo no banco de dados.')) onArchiveTransaction(tx.id); }} className="btn-ghost p-1.5 hover:text-amber-600 hover:bg-amber-50" title="Arquivar">
                          <Archive size={14} />
                        </button>
                        <button onClick={() => { if(confirm('Tem certeza? Essa exclusão é permanente e não poderá ser desfeita.')) onHardDeleteTransaction(tx.id); }} className="btn-ghost p-1.5 hover:text-rose-600 hover:bg-rose-50" title="Excluir Permanentemente">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Lateral */}
        <div className="xl:col-span-1 space-y-6">
          <div className="glass-card p-5">
            <h3 className="text-[13px] font-semibold text-zinc-600 uppercase tracking-wider mb-5 flex items-center gap-2">
              <Calendar size={14} className="text-zinc-400" />
              Contas Pendentes
            </h3>
            
            <div className="space-y-3">
              {transactions.filter(t => t.status === 'pending').length === 0 ? (
                <p className="text-[13px] text-zinc-500 font-medium">Nenhuma pendência.</p>
              ) : (
                transactions.filter(t => t.status === 'pending').map((tx) => (
                  <div key={tx.id} className="p-3 rounded-lg border border-amber-200/50 bg-amber-50/30 hover:border-amber-300 transition-colors group cursor-pointer">
                    <div className="flex justify-between items-start mb-1.5">
                      <div>
                        <span className="font-semibold text-[13px] text-zinc-900 block leading-tight">{tx.description || tx.category}</span>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{getCompanyName(tx.company_id)}</span>
                      </div>
                      <span className="font-semibold text-rose-600 text-[13px] tracking-tight">
                        - {formatCurrency(tx.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] mt-2 pt-2 border-t border-amber-200/30">
                      <span className="text-amber-700 font-medium flex items-center gap-1">
                        <AlertCircle size={10} /> Vence {formatDate(tx.transaction_date)}
                      </span>
                      <button 
                        onClick={() => onUpdateTransaction(tx.id, { status: 'paid' })}
                        className="text-zinc-500 hover:text-emerald-600 font-semibold flex items-center gap-1 transition-colors"
                      >
                        <CheckCircle2 size={10} /> Pagar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <button className="w-full mt-4 py-2 rounded-md border border-dashed border-zinc-300 text-zinc-500 hover:text-zinc-900 hover:border-zinc-400 hover:bg-zinc-50 transition-colors text-[12px] font-semibold">
              + Nova Conta
            </button>
          </div>

          <div className="glass-card bg-zinc-50 border-zinc-200 p-5 text-center group cursor-pointer hover:bg-zinc-100 transition-colors">
             <div className="w-10 h-10 mx-auto bg-white border border-zinc-200 text-zinc-700 rounded-lg flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-sm">
               <Download size={16} strokeWidth={2.5} />
             </div>
             <h4 className="font-semibold text-[14px] text-zinc-900 mb-0.5">Exportar Extrato</h4>
             <p className="text-[12px] text-zinc-500 font-medium">Gere um PDF detalhado da visão atual.</p>
          </div>

          <div className="space-y-3">
             <h3 className="text-[13px] font-semibold text-zinc-600 uppercase tracking-wider mb-2 flex items-center gap-2">
              <AlertCircle size={14} className="text-zinc-400" />
              Saúde Financeira
            </h3>
            {insights.map(insight => (
              <InsightCard key={insight.id} text={insight.text} type={insight.type} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
