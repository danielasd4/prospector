import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Key, Lock, Activity, Sparkles } from 'lucide-react';
import { buildAiContext } from '../lib/aiContextBuilder';
import { Company, ProductService, RecurringBill } from '../hooks/useDashboardData';
import { SectionTitle } from './ui/SectionTitle';

interface AiAssistantViewProps {
  metrics: any;
  companies: Company[];
  products: ProductService[];
  recurringBills: RecurringBill[];
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const AiAssistantView = ({ metrics, companies, products, recurringBills }: AiAssistantViewProps) => {
  const [apiKey, setApiKey] = useState(localStorage.getItem('OPENAI_API_KEY') || '');
  const [isConfiguring, setIsConfiguring] = useState(!localStorage.getItem('OPENAI_API_KEY'));
  const [tempKey, setTempKey] = useState('');
  
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Olá. Sou seu Assistente Estratégico. Acessei seus dados operacionais mais recentes. O que vamos analisar hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSaveKey = () => {
    if (tempKey.trim().length > 10) {
      localStorage.setItem('OPENAI_API_KEY', tempKey.trim());
      setApiKey(tempKey.trim());
      setIsConfiguring(false);
    }
  };

  const clearKey = () => {
    localStorage.removeItem('OPENAI_API_KEY');
    setApiKey('');
    setIsConfiguring(true);
  };

  const handleSend = async () => {
    if (!input.trim() || !apiKey) return;
    
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const systemContext = buildAiContext(metrics, companies, products, recurringBills);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemContext },
            ...messages.filter(m => m.role !== 'system').slice(-5),
            { role: 'user', content: userMsg }
          ],
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.statusText}`);
      }

      const data = await response.json();
      const assistantMsg = data.choices[0].message.content;

      setMessages(prev => [...prev, { role: 'assistant', content: assistantMsg }]);
    } catch (e: any) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ Erro de conexão com a OpenAI. Verifique sua chave API ou conexão de rede.` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatResponse = (text: string) => {
    return text.split('\n').map((line, i) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedLine = parts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j} className="text-zinc-900 font-semibold">{part.slice(2, -2)}</strong>;
        }
        return part;
      });
      return <p key={i} className="mb-2 last:mb-0 leading-relaxed text-[14px]">{formattedLine}</p>;
    });
  };

  if (isConfiguring) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] animate-in fade-in duration-500">
        <div className="glass-card p-10 max-w-md w-full text-center relative overflow-hidden bg-white shadow-xl">
          <div className="absolute top-0 right-0 p-8 opacity-5"><Lock size={120} className="text-zinc-900" /></div>
          
          <div className="w-12 h-12 bg-zinc-100 text-zinc-900 rounded-xl mx-auto mb-6 relative z-10 flex items-center justify-center border border-zinc-200">
            <Sparkles size={24} />
          </div>
          
          <h2 className="text-[20px] font-semibold text-zinc-900 mb-2 relative z-10 tracking-tight">Inteligência Estratégica</h2>
          <p className="text-zinc-500 text-[13px] mb-8 relative z-10 leading-relaxed">
            O Copiloto lê seus dados reais para sugerir estratégias e prever riscos. Conecte sua chave da OpenAI. Ela ficará salva **apenas no seu navegador local**.
          </p>

          <div className="flex flex-col gap-4 relative z-10">
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input 
                type="password"
                placeholder="sk-proj-..."
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                className="input-premium pl-10 text-[13px] text-center tracking-widest"
              />
            </div>
            <button onClick={handleSaveKey} className="btn-primary w-full text-[13px]">
              Ativar Copiloto
            </button>
            <p className="text-[10px] text-zinc-400 mt-2">Nenhum dado financeiro bruto é compartilhado com a OpenAI, apenas totais consolidados para cálculo estratégico.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] lg:h-[calc(100vh-6rem)] animate-in fade-in duration-300">
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionTitle 
          title="Copiloto Estratégico" 
          subtitle="Suas perguntas respondidas com base na realidade dos seus dados."
          icon={Bot}
          className="mb-0"
        />
        <button onClick={clearKey} className="btn-ghost flex items-center gap-2">
          <Lock size={14} /> <span>Trocar API Key</span>
        </button>
      </header>

      <div className="flex-1 glass-card overflow-hidden flex flex-col relative bg-white">
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center border ${
                msg.role === 'user' ? 'bg-zinc-900 text-white border-zinc-800' : 'bg-zinc-50 text-zinc-600 border-zinc-200'
              }`}>
                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              
              <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-5 ${
                msg.role === 'user' 
                  ? 'bg-zinc-50 text-zinc-900 border border-zinc-200 rounded-tr-sm' 
                  : 'bg-white text-zinc-700 border border-zinc-100 shadow-sm rounded-tl-sm'
              }`}>
                {formatResponse(msg.content)}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center bg-zinc-50 text-zinc-600 border border-zinc-200">
                <Bot size={14} />
              </div>
              <div className="max-w-[85%] rounded-2xl p-5 bg-white text-zinc-500 border border-zinc-100 shadow-sm rounded-tl-sm flex items-center gap-3">
                <Activity size={16} className="animate-spin text-zinc-400" /> 
                <span className="text-[13px] font-medium">Processando matriz de dados...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 border-t border-zinc-100 bg-zinc-50/50">
          <div className="max-w-4xl mx-auto">
            <div className="relative flex items-center bg-white rounded-xl shadow-sm border border-zinc-200 focus-within:border-zinc-400 transition-colors">
              <input 
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Pergunte ao copiloto (ex: Qual operação está dando mais lucro?)"
                className="w-full bg-transparent pl-4 pr-14 py-3 text-[14px] text-zinc-900 outline-none placeholder:text-zinc-400"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="absolute right-2 p-1.5 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400 text-white rounded-md transition-all"
              >
                <Send size={16} />
              </button>
            </div>
            <div className="flex justify-center gap-4 mt-3">
              <button onClick={() => setInput('Existe algum risco imediato de caixa para os próximos meses?')} className="text-[11px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors bg-zinc-100 px-2 py-1 rounded">Ex: Riscos de Caixa</button>
              <button onClick={() => setInput('Onde devo focar minha energia para aumentar a previsibilidade?')} className="text-[11px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors bg-zinc-100 px-2 py-1 rounded">Ex: Foco e Prioridade</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
