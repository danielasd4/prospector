import { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, X, Activity, AlertCircle } from 'lucide-react';
import { Company, ProductService, Transaction } from '../hooks/useDashboardData';
import { extractFinancialData, ExtractedFinancialData } from '../lib/extractFinancialData';
import { cn, formatCurrency } from '../lib/utils';

interface ReceiptUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: Company[];
  onConfirm: (data: Partial<Transaction>) => Promise<void>;
}

export const ReceiptUploaderModal = ({ isOpen, onClose, companies, onConfirm }: ReceiptUploaderModalProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedFinancialData | null>(null);
  const [editableData, setEditableData] = useState<Partial<Transaction> | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = async (file: File) => {
    setError('');
    setIsProcessing(true);
    setExtractedData(null);
    try {
      const data = await extractFinancialData(file, companies);
      setExtractedData(data);
      setEditableData({
        type: data.type,
        amount: data.amount,
        company_id: data.suggested_company_id || companies[0]?.id,
        category: data.category,
        description: data.description,
        transaction_date: data.transaction_date,
        recurrence_type: data.recurrence_type,
        status: 'paid'
      });
    } catch (e: any) {
      setError(e.message || 'Falha ao processar o arquivo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleConfirm = async () => {
    if (!editableData) return;
    setIsProcessing(true);
    try {
      await onConfirm({
        ...editableData,
        hours_spent: 0,
        predictability: editableData.recurrence_type === 'recurring' ? 'Alta' : 'Baixa',
        status: 'paid'
      });
      handleClose();
    } catch (e) {
      console.error(e);
      setError('Erro ao salvar lançamento.');
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setExtractedData(null);
    setEditableData(null);
    setError('');
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose}></div>
      <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-2xl relative z-10 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 text-primary rounded-xl">
              <FileText size={24} />
            </div>
            <h3 className="text-xl font-bold text-white font-display">Leitor de Comprovantes</h3>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {!isProcessing && !extractedData && (
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all text-center",
                isDragging ? "border-primary bg-primary/5" : "border-white/10 hover:border-primary/50 hover:bg-white/5",
                error ? "border-rose-500/50" : ""
              )}
            >
              <UploadCloud size={48} className={cn("mb-4", isDragging ? "text-primary" : "text-slate-500")} />
              <h4 className="text-lg font-bold text-white mb-2">Arraste seu comprovante aqui</h4>
              <p className="text-sm text-slate-400 mb-6 max-w-sm">Suporta PDF, PNG, JPG e WEBP. O sistema extrairá os dados automaticamente.</p>
              <button className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-medium">
                Procurar arquivo
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="application/pdf,image/png,image/jpeg,image/webp"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              {error && (
                <div className="mt-4 flex items-center gap-2 text-rose-400 text-sm bg-rose-500/10 px-4 py-2 rounded-lg">
                  <AlertCircle size={16} /> {error}
                </div>
              )}
            </div>
          )}

          {isProcessing && (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <Activity size={48} className="text-primary animate-spin mb-6" />
              <h4 className="text-xl font-bold text-white mb-2">Lendo documento...</h4>
              <p className="text-slate-400">Extraindo texto, identificando valores e categorizando a transação.</p>
            </div>
          )}

          {extractedData && editableData && !isProcessing && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
                <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-emerald-500 font-bold mb-1">Informações Encontradas!</h4>
                  <p className="text-sm text-emerald-500/80">Revisamos seu documento com {(extractedData.confidence).toFixed(0)}% de confiança nos dados extraídos.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Valor Extraído</label>
                    <input 
                      type="number" 
                      value={editableData.amount}
                      onChange={(e) => setEditableData({ ...editableData, amount: Number(e.target.value) })}
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-lg font-bold focus:border-primary outline-none transition-all text-white font-display" 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Data</label>
                    <input 
                      type="date" 
                      value={editableData.transaction_date ? editableData.transaction_date.split('T')[0] : ''}
                      onChange={(e) => setEditableData({ ...editableData, transaction_date: e.target.value })}
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all text-white [&::-webkit-calendar-picker-indicator]:invert" 
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Descrição</label>
                  <input 
                    type="text" 
                    value={editableData.description}
                    onChange={(e) => setEditableData({ ...editableData, description: e.target.value })}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all text-white" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Empresa Sugerida</label>
                    <select 
                      value={editableData.company_id || ''}
                      onChange={(e) => setEditableData({ ...editableData, company_id: e.target.value })}
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all text-white"
                    >
                      {companies.map(c => (
                        <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tipo</label>
                    <select 
                      value={editableData.type}
                      onChange={(e) => setEditableData({ ...editableData, type: e.target.value as any })}
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all text-white"
                    >
                      <option value="income" className="bg-slate-900">Entrada (Recebimento)</option>
                      <option value="expense" className="bg-slate-900">Saída (Pagamento)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {extractedData && !isProcessing && (
          <div className="p-6 border-t border-white/5 bg-white/5 flex items-center justify-end gap-3">
            <button 
              onClick={() => { setExtractedData(null); setEditableData(null); }}
              className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={handleConfirm}
              className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl shadow-lg shadow-primary/20 transition-all font-bold flex items-center gap-2"
            >
              <CheckCircle2 size={18} /> Confirmar Lançamento
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
