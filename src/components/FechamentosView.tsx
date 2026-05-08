import { useState, useEffect } from 'react';
import { Archive, Download, Calendar, Activity } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { SectionTitle } from './ui/SectionTitle';

export const FechamentosView = ({ metrics, onExport }: { metrics: any, onExport: () => void }) => {
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSnapshots();
  }, []);

  const fetchSnapshots = async () => {
    try {
      const { data, error } = await supabase
        .from('monthly_snapshots')
        .select('*')
        .order('year', { ascending: false })
        .order('month', { ascending: false });
      
      if (error) {
        console.error("Supabase Snapshots Error:", error);
        setSnapshots([]);
      } else {
        setSnapshots(data || []);
      }
    } catch (e) {
      console.error("Unexpected Fechamentos Error:", e);
      setSnapshots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseMonth = async () => {
    if (!window.confirm("Deseja realizar o fechamento financeiro do mês atual? Os cálculos ficarão salvos no histórico imutável.")) return;
    
    try {
      const { error } = await supabase.from('monthly_snapshots').insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        month: new Date().getMonth(),
        year: new Date().getFullYear(),
        total_income: metrics?.revenue || 0,
        total_expense: parseFloat((metrics?.saidasMes || '').replace(/[^0-9,-]+/g,"").replace(",", ".")) || 0,
        net_profit: parseFloat((metrics?.lucroLiquido || '').replace(/[^0-9,-]+/g,"").replace(",", ".")) || 0,
        predictable_revenue: metrics?.receitaPrevisivelRaw || 0,
        variable_revenue: parseFloat((metrics?.receitaVariavel || '').replace(/[^0-9,-]+/g,"").replace(",", ".")) || 0,
        total_hours: metrics?.totalHorasMes || 0,
        notes: "Fechamento de Sistema"
      });

      if (error) throw error;
      alert("Mês fechado com sucesso!");
      fetchSnapshots();
    } catch (e) {
      console.error(e);
      alert("Erro ao fechar mês. Verifique se o mês já não foi fechado.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
        <SectionTitle 
          title="Fechamentos & Histórico" 
          subtitle="Registros imutáveis de caixa mês a mês."
          icon={Archive}
          className="mb-0"
        />
        
        <div className="flex items-center gap-3">
          <button 
            onClick={onExport}
            className="btn-secondary"
          >
            <Download size={16} /> <span className="hidden sm:inline">Exportar CSV</span>
          </button>
          <button 
            onClick={handleCloseMonth}
            className="btn-primary"
          >
            <Calendar size={16} /> <span>Fechar Mês Atual</span>
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center p-12"><Activity className="animate-spin text-zinc-300" size={32} /></div>
      ) : snapshots.length === 0 ? (
        <div className="glass-card p-12 text-center text-zinc-500 bg-white">
          <p className="text-[14px] font-medium">Nenhum fechamento registrado no banco de dados.</p>
          <p className="text-[12px] mt-1">Ao final do mês, utilize o botão "Fechar Mês Atual" para arquivar os resultados.</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden bg-white">
          <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Histórico de Fechamentos</span>
          </div>
          <div className="divide-y divide-zinc-100">
            {snapshots.map(s => (
              <div key={s.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-zinc-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-zinc-100 flex flex-col items-center justify-center text-zinc-900 border border-zinc-200 shadow-sm">
                    <span className="text-[12px] font-bold uppercase leading-none">{new Date(s.year, s.month, 1).toLocaleString('pt-BR', { month: 'short' })}</span>
                    <span className="text-[10px] font-semibold text-zinc-500 leading-none mt-0.5">{s.year}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[14px] text-zinc-900">Fechamento Consolidado</h4>
                    <p className="text-[12px] text-zinc-500 font-medium">Registrado em {new Date(s.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 md:gap-10 md:ml-auto">
                  <div className="text-right">
                    <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">Faturamento</p>
                    <p className="font-semibold text-[14px] text-zinc-900">{formatCurrency(s.total_income)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">Saídas</p>
                    <p className="font-semibold text-[14px] text-rose-600">{formatCurrency(s.total_expense)}</p>
                  </div>
                  <div className="pl-6 md:pl-10 border-l border-zinc-200 text-right">
                    <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-0.5">Lucro Líquido</p>
                    <p className="font-display font-semibold text-lg tracking-tight text-emerald-600">{formatCurrency(s.net_profit)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
