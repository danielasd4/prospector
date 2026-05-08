import { LayoutDashboard, Wallet, Plus, Building2, Bot, Home } from 'lucide-react';
import { cn } from '../lib/utils';

interface MobileNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenNewTransaction: () => void;
}

export const MobileNav = ({ currentView, onNavigate, onOpenNewTransaction }: MobileNavProps) => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-xl border-t border-white/10 px-6 py-3 flex items-center justify-between z-50 safe-area-bottom">
      <button 
        onClick={() => onNavigate('dashboard')}
        className={cn("flex flex-col items-center gap-1 transition-colors", currentView === 'dashboard' ? 'text-primary' : 'text-slate-500 hover:text-slate-300')}
      >
        <LayoutDashboard size={20} />
        <span className="text-[10px] font-bold">Início</span>
      </button>

      <button 
        onClick={() => onNavigate('financeiro')}
        className={cn("flex flex-col items-center gap-1 transition-colors", currentView === 'financeiro' ? 'text-primary' : 'text-slate-500 hover:text-slate-300')}
      >
        <Wallet size={20} />
        <span className="text-[10px] font-bold">Caixa</span>
      </button>

      <button 
        onClick={onOpenNewTransaction}
        className="w-14 h-14 bg-primary hover:bg-primary-hover text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/30 -mt-8 border-4 border-slate-950 transition-transform active:scale-95"
      >
        <Plus size={28} />
      </button>

      <button 
        onClick={() => onNavigate('empresas')}
        className={cn("flex flex-col items-center gap-1 transition-colors", currentView === 'empresas' ? 'text-primary' : 'text-slate-500 hover:text-slate-300')}
      >
        <Building2 size={20} />
        <span className="text-[10px] font-bold">Empresas</span>
      </button>

      <button 
        onClick={() => onNavigate('familia')}
        className={cn("flex flex-col items-center gap-1 transition-colors", currentView === 'familia' ? 'text-primary' : 'text-slate-500 hover:text-slate-300')}
      >
        <Home size={20} />
        <span className="text-[10px] font-bold">Família</span>
      </button>
    </div>
  );
};
