import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import { Company } from '../hooks/useDashboardData';

// Worker configuration for pdf.js via CDN to avoid Vite bundling issues
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export interface ExtractedFinancialData {
  type: 'income' | 'expense';
  amount: number;
  suggested_company_id?: string;
  suggested_company_name?: string;
  category: string;
  description: string;
  transaction_date: string;
  recurrence_type: 'variable' | 'recurring';
  confidence: number;
  rawText?: string;
}

export async function extractTextFromFile(file: File): Promise<string> {
  const type = file.type;
  
  if (type === 'application/pdf') {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }
    return fullText;
  } else if (type.startsWith('image/')) {
    // Using Tesseract.js for image OCR (Portuguese)
    const result = await Tesseract.recognize(file, 'por', {
      logger: m => console.log(m) // Opcional: ver progresso
    });
    return result.data.text;
  }
  
  throw new Error('Formato de arquivo não suportado');
}

export async function extractFinancialData(file: File, companies: Company[]): Promise<ExtractedFinancialData> {
  // 1. Extrair Texto do Arquivo
  const text = await extractTextFromFile(file);
  const lowerText = text.toLowerCase();
  
  // 2. Setup do Retorno Padrão
  const result: ExtractedFinancialData = {
    type: 'expense',
    amount: 0,
    category: 'Geral',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0], // Hoje
    recurrence_type: 'variable',
    confidence: 0,
    rawText: text
  };

  // 3. Extrair Valor
  // Exemplo: R$ 1.500,00 ou 1.500,00 ou 97,00
  const amountMatch = text.match(/(?:R\$|RS|BRL)?\s*(\d{1,3}(?:\.\d{3})*,\d{2})/i);
  if (amountMatch) {
    result.amount = Number(amountMatch[1].replace(/\./g, '').replace(',', '.'));
    result.confidence += 30;
  }

  // 4. Extrair Data
  // Exemplo: 25/10/2023
  const dateMatch = text.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (dateMatch) {
    result.transaction_date = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
    result.confidence += 20;
  }

  // 5. Identificar Tipo de Transação (Entrada/Saída)
  if (
    lowerText.includes('recebido') || 
    lowerText.includes('recebimento') || 
    lowerText.includes('você recebeu') || 
    lowerText.includes('entrada')
  ) {
    result.type = 'income';
    result.confidence += 20;
  } else if (
    lowerText.includes('pagamento efetuado') || 
    lowerText.includes('transferência enviada') || 
    lowerText.includes('você pagou') || 
    lowerText.includes('pago')
  ) {
    result.type = 'expense';
    result.confidence += 20;
  }

  // 6. Sugerir Empresa pelo Nome
  for (const company of companies) {
    if (lowerText.includes(company.name.toLowerCase())) {
      result.suggested_company_id = company.id;
      result.suggested_company_name = company.name;
      result.confidence += 20;
      break;
    }
  }

  // 7. Extrair Categorias, Descrição e Recorrência (Lógica de Regras Mockadas para Demo)
  if (lowerText.includes('canva') || lowerText.includes('adobe') || lowerText.includes('aws')) {
    result.category = 'Ferramenta / Software';
    result.recurrence_type = 'recurring';
    result.type = 'expense';
    result.description = 'Assinatura ' + (lowerText.includes('canva') ? 'Canva' : 'Software');
    result.confidence += 20;
  } else if (lowerText.includes('auto excelência') || lowerText.includes('excelencia')) {
    result.category = 'Cliente / Projeto';
    result.type = 'income';
    result.description = 'Auto Excelência';
    result.confidence += 20;
  } else {
    // Tentar pegar o nome do destinatário/pagador
    const nameMatch = text.match(/Nome(?:\sdo\s(?:destinatário|recebedor|pagador))?:\s*([A-Za-zÀ-ÿ\s]+)/i);
    if (nameMatch) {
      result.description = nameMatch[1].trim();
    } else if (lowerText.includes('pix')) {
      result.description = 'Transferência PIX';
    } else {
      result.description = 'Comprovante Importado';
    }
  }

  return result;
}
