import { Company, ProductService } from '../hooks/useDashboardData';

export interface ParseResult {
  amount?: number;
  type?: 'income' | 'expense';
  company_id?: string;
  category?: string;
  subcategory?: string;
  product_service_id?: string;
  recurrence_type?: 'variable' | 'recurring';
  predictability?: string;
  hours_spent?: number;
  description?: string;
  transaction_date?: string;
  confidence: number;
}

export const parseSmartTransaction = (
  text: string, 
  companies: Company[], 
  products: ProductService[],
  patterns: any[] = [] // Future: dynamic patterns from DB
): ParseResult => {
  const result: ParseResult = {
    confidence: 0,
    description: text,
    type: 'expense' // Padrão: despesa (mais comum em lançamentos rápidos)
  };

  const lowerText = text.toLowerCase();
  const lowerInput = lowerText;

  // 1. Extract Amount
  const amountMatch = text.match(/(?:r\$|rs|\$)?\s*(\d+[.,]?\d*)/i);
  if (amountMatch) {
    result.amount = Number(amountMatch[1].replace(',', '.'));
    result.confidence += 20;
    // Remove amount from description
    if (result.description) {
      result.description = result.description.replace(amountMatch[0], '').trim();
    }
  }

  // 2. Identify Type by keywords
  if (/(recebi|venda|entrada|pagou|depósito|pix recebido)/.test(lowerText)) {
    result.type = 'income';
    result.confidence += 10;
  } else if (/(paguei|gasto|saída|compra|assinatura|mensalidade|boleto)/.test(lowerText)) {
    result.type = 'expense';
    result.confidence += 10;
  }

  // 3. Match Companies
  const companyMatches = companies.filter(c => lowerText.includes(c.name.toLowerCase()) || lowerText.includes(c.name.split(' ')[0].toLowerCase()));
  if (companyMatches.length > 0) {
    const comp = companyMatches[0];
    result.company_id = comp.id;
    result.confidence += 30;
    // Inherit type if not set (generally income for our own companies if not specified)
    if (!result.type) result.type = 'income';
  }

  // 4. Hardcoded Business Rules (as requested by user)
  if (/(setz|casamento|sessão|pré wedding|evento)/.test(lowerText)) {
    const setz = companies.find(c => c.name.toLowerCase().includes('setz'));
    if (setz) result.company_id = setz.id;
    result.type = 'income';
    result.predictability = 'Variável';
    result.recurrence_type = 'variable';
    result.confidence += 30;
  }
  
  if (/(studio|vency|landing|site|branding|criativo)/.test(lowerText)) {
    const studio = companies.find(c => c.name.toLowerCase().includes('studio') || c.name.toLowerCase().includes('vency'));
    if (studio) result.company_id = studio.id;
    result.type = 'income';
    result.category = 'Serviço';
    result.confidence += 30;
  }
  
  if (/(canva|adobe|vercel|domínio|figma|openai)/.test(lowerText)) {
    result.type = 'expense';
    result.category = 'Ferramentas / Software';
    result.recurrence_type = 'recurring';
    result.confidence += 30;
  }
  
  if (/(marketeria|salário|clt)/.test(lowerText)) {
    const marketeria = companies.find(c => c.name.toLowerCase().includes('marketeria'));
    if (marketeria) result.company_id = marketeria.id;
    result.type = 'income';
    result.category = lowerText.includes('clt') ? 'Salário CLT' : 'Salário empresa';
    result.predictability = 'Garantida';
    result.recurrence_type = 'recurring';
    result.confidence += 30;
  }

  // 4.2 Detecção de Dia e Recorrência (Item 10 e 3 do User Request)
  const dayMatch = lowerText.match(/dia\s?(\d{1,2})/i);
  if (dayMatch) {
    const day = parseInt(dayMatch[1]);
    if (day >= 1 && day <= 31) {
      const date = new Date();
      date.setDate(day);
      result.transaction_date = date.toISOString().split('T')[0];
      result.predictability = 'Garantida';
      result.confidence += 15;
    }
  }

  if (/(fixa|mensal|todo mês|recorrente|assinatura)/.test(lowerText)) {
    result.recurrence_type = 'recurring';
    result.confidence += 15;
  }

  // 4.3 Melhores Categorias para Família
  if (/(mercado|comida|almoço|janta|ifood|restaurante|compras)/.test(lowerText)) {
    result.category = 'Mercado';
    result.type = 'expense';
    result.confidence += 40;
  }
  if (/(aluguel|condominio|energia|luz|água|internet|iptu|casa)/.test(lowerText)) {
    result.category = 'Moradia';
    result.type = 'expense';
    result.confidence += 40;
  }
  if (/(uber|gasolina|combustivel|estacionamento|pedágio|transporte)/.test(lowerText)) {
    result.category = 'Transporte';
    result.type = 'expense';
    result.confidence += 40;
  }
  if (/(nubank|itau|inter|fatura|cartão|crédito)/.test(lowerText)) {
    result.category = 'Cartão de crédito';
    result.type = 'expense';
    result.confidence += 40;
  }
  if (/(farmacia|medico|unimed|saude|exame|hospital)/.test(lowerText)) {
    result.category = 'Saúde';
    result.type = 'expense';
    result.confidence += 40;
  }
  if (/(cinema|viagem|show|lazer|bar|festa|viagem)/.test(lowerText)) {
    result.category = 'Lazer';
    result.type = 'expense';
    result.confidence += 40;
  }
  if (/(invest|bolsa|xp|btg|poupança|tesouro|aplicação)/.test(lowerText)) {
    result.category = 'Investimentos';
    result.type = 'expense';
    result.confidence += 40;
  }
  if (/(salario|clt|receita|recebi|pagamento recebido)/.test(lowerText)) {
    result.type = 'income';
    result.category = lowerText.includes('clt') ? 'Salário CLT' : 'Salário empresa';
    result.confidence += 40;
  }

  // 5. Match Products/Services (if company is known or product name is very specific)
  if (result.company_id) {
    const compProducts = products.filter(p => p.company_id === result.company_id);
    const prodMatch = compProducts.find(p => lowerText.includes(p.name.toLowerCase()));
    if (prodMatch) {
      result.product_service_id = prodMatch.id;
      result.recurrence_type = prodMatch.is_recurring ? 'recurring' : 'variable';
      result.category = prodMatch.type;
      result.confidence += 20;
    }
  }

  // Cap confidence at 100
  result.confidence = Math.min(result.confidence, 100);

  // Capitalize first letter of description
  if (result.description) {
    result.description = result.description.charAt(0).toUpperCase() + result.description.slice(1);
  }

  return result;
};
