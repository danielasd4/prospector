import { Company, Transaction, ProductService, RecurringBill } from '../hooks/useDashboardData';
import { formatCurrency } from './utils';

export interface Insight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'danger';
  text: string;
  category: 'revenue' | 'cost' | 'time' | 'risk' | 'growth' | 'focus' | 'info';
}

export const generateInsights = (
  companies: Company[] = [],
  transactions: Transaction[] = [],
  products: ProductService[] = [],
  recurringBills: RecurringBill[] = []
): Insight[] => {
  const insights: Insight[] = [];

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  // Filtragem de Transações por Mês
  const currentMonthTxs = transactions.filter(t => {
    const d = new Date(t.transaction_date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const lastMonthTxs = transactions.filter(t => {
    const d = new Date(t.transaction_date);
    return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
  });

  // Métricas Atuais
  const currentIncome = currentMonthTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
  const currentExpense = currentMonthTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
  
  const lastIncome = lastMonthTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
  const lastExpense = lastMonthTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);

  const predictableIncome = currentMonthTxs.filter(t => t.type === 'income' && t.recurrence_type === 'recurring').reduce((sum, t) => sum + Number(t.amount), 0);
  
  const fixedCosts = recurringBills.filter(b => b.type === 'expense' && b.status === 'active').reduce((sum, b) => sum + Number(b.amount), 0);

  // 1. Risco de Cobertura de Custo Fixo
  if (fixedCosts > 0) {
    const coverageRatio = predictableIncome / fixedCosts;
    if (coverageRatio < 1) {
      insights.push({
        id: 'risk_coverage_danger',
        type: 'danger',
        category: 'risk',
        text: `Sua receita previsível cobre apenas ${Math.round(coverageRatio * 100)}% dos seus custos fixos. Cuidado com o fluxo de caixa.`
      });
    } else if (coverageRatio < 1.5) {
      insights.push({
        id: 'risk_coverage_warning',
        type: 'warning',
        category: 'risk',
        text: `Sua receita previsível cobre ${coverageRatio.toFixed(1)}x seus custos fixos. Margem de segurança baixa.`
      });
    } else {
      insights.push({
        id: 'risk_coverage_success',
        type: 'success',
        category: 'risk',
        text: `Sua receita previsível cobre com folga (${coverageRatio.toFixed(1)}x) seus custos fixos atuais.`
      });
    }
  }

  // 2. Aumento de Custos Operacionais
  if (lastExpense > 0) {
    const expenseGrowth = ((currentExpense - lastExpense) / lastExpense) * 100;
    if (expenseGrowth > 15) {
      insights.push({
        id: 'cost_growth',
        type: 'warning',
        category: 'cost',
        text: `Seus custos aumentaram ${Math.round(expenseGrowth)}% em relação ao mês passado.`
      });
    } else if (expenseGrowth < -10) {
      insights.push({
        id: 'cost_reduction',
        type: 'success',
        category: 'cost',
        text: `Ótimo controle: seus custos reduziram ${Math.abs(Math.round(expenseGrowth))}% em relação ao último mês.`
      });
    }
  }

  // 3. Representatividade de Receita por Empresa
  if (predictableIncome > 0) {
    const companyIncomes = companies.map(c => {
      const inc = currentMonthTxs.filter(t => t.company_id === c.id && t.type === 'income' && t.recurrence_type === 'recurring').reduce((sum, t) => sum + Number(t.amount), 0);
      return { name: c.name, income: inc };
    }).sort((a, b) => b.income - a.income);

    if (companyIncomes[0] && companyIncomes[0].income > 0) {
      const percentage = (companyIncomes[0].income / predictableIncome) * 100;
      if (percentage > 50) {
        insights.push({
          id: 'revenue_dependency',
          type: percentage > 75 ? 'warning' : 'info',
          category: 'revenue',
          text: `A empresa ${companyIncomes[0].name} representa ${Math.round(percentage)}% da sua receita previsível.`
        });
      }
    }
  }

  // 4. Valor/Hora e Baixo Retorno
  const companyPerformance = companies.map(c => {
    const txs = currentMonthTxs.filter(t => t.company_id === c.id);
    const inc = txs.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
    const hrs = txs.reduce((sum, t) => sum + Number(t.hours_spent || 0), 0);
    return { name: c.name, vh: hrs > 0 ? inc / hrs : 0, hours: hrs };
  }).filter(c => c.vh > 0).sort((a, b) => b.vh - a.vh);

  if (companyPerformance.length > 1) {
    insights.push({
      id: 'best_vh',
      type: 'success',
      category: 'time',
      text: `${companyPerformance[0].name} possui o maior valor/hora médio do seu portfólio (${formatCurrency(companyPerformance[0].vh)}/h).`
    });
  }

  const lowVhTransactions = currentMonthTxs.filter(t => t.type === 'income' && t.hours_spent > 0 && (t.amount / t.hours_spent) < 80);
  if (lowVhTransactions.length > 0) {
    const lowVhHours = lowVhTransactions.reduce((sum, t) => sum + Number(t.hours_spent), 0);
    if (lowVhHours > 10) {
      insights.push({
        id: 'low_vh_warning',
        type: 'danger',
        category: 'time',
        text: `Projetos/Serviços abaixo de R$80/h consumiram ${lowVhHours}h do seu tempo este mês.`
      });
    }
  }

  // 5. Foco Recomendado
  if (fixedCosts > predictableIncome) {
    insights.push({
      id: 'focus_predictable',
      type: 'info',
      category: 'focus',
      text: `Foco Recomendado: Estruturar mais serviços recorrentes para cobrir os R$ ${fixedCosts - predictableIncome} fixos faltantes.`
    });
  } else if (companyPerformance.length > 0 && companyPerformance[0].vh > 200) {
    insights.push({
      id: 'focus_scale',
      type: 'info',
      category: 'focus',
      text: `Foco Recomendado: Escalar a operação de ${companyPerformance[0].name} devido ao alto valor/hora.`
    });
  } else {
    insights.push({
      id: 'focus_margin',
      type: 'info',
      category: 'focus',
      text: `Foco Recomendado: Proteger a receita atual e otimizar horas para aumentar o valor/hora global.`
    });
  }

  // Sort insights: danger -> warning -> success -> info
  const severityMap = { 'danger': 1, 'warning': 2, 'success': 3, 'info': 4 };
  insights.sort((a, b) => severityMap[a.type] - severityMap[b.type]);

  return insights;
};

export const generateCompanyInsights = (companyId: string, transactions: Transaction[]): Insight[] => {
  const insights: Insight[] = [];
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const compTxs = transactions.filter(t => t.company_id === companyId && new Date(t.transaction_date).getMonth() === currentMonth);
  const inc = compTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
  const hrs = compTxs.reduce((sum, t) => sum + Number(t.hours_spent || 0), 0);
  const vh = hrs > 0 ? inc / hrs : 0;

  if (vh > 150) {
    insights.push({
      id: 'c_high_vh',
      type: 'success',
      category: 'time',
      text: `Operação de alto valor agregado (${formatCurrency(vh)}/hora). Potencial de escala.`
    });
  } else if (hrs > 40 && vh < 80) {
    insights.push({
      id: 'c_low_vh',
      type: 'warning',
      category: 'time',
      text: `Alto consumo de tempo para baixo retorno. Necessário revisar precificação ou automatizar processos.`
    });
  }

  const predictable = compTxs.filter(t => t.type === 'income' && t.recurrence_type === 'recurring').reduce((sum, t) => sum + Number(t.amount), 0);
  if (inc > 0 && predictable / inc > 0.7) {
    insights.push({
      id: 'c_stable',
      type: 'success',
      category: 'growth',
      text: `Operação altamente previsível (${Math.round((predictable/inc)*100)}% recorrente). Excelente âncora de caixa.`
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: 'c_neutral',
      type: 'info',
      category: 'info',
      text: `A operação está performando dentro da média de mercado. Acompanhe os custos diretos.`
    });
  }

  return insights;
};

export const generateFinancialInsights = (transactions: Transaction[] = [], recurringBills: RecurringBill[] = []): Insight[] => {
  const insights: Insight[] = [];
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const currentMonthTxs = transactions.filter(t => new Date(t.transaction_date).getMonth() === currentMonth && new Date(t.transaction_date).getFullYear() === currentYear);
  const pendingTxs = transactions.filter(t => t.status === 'pending');
  const pastDue = pendingTxs.filter(t => new Date(t.transaction_date) < new Date());
  
  if (pastDue.length > 0) {
    insights.push({
      id: 'f_past_due',
      type: 'danger',
      category: 'risk',
      text: `Você possui ${pastDue.length} lançamentos pendentes com data vencida.`
    });
  }

  const predictableRevenue = currentMonthTxs.filter(t => t.type === 'income' && t.recurrence_type === 'recurring').reduce((sum, t) => sum + Number(t.amount), 0);
  const fixedCosts = recurringBills.filter(b => b.type === 'expense' && b.status === 'active').reduce((sum, b) => sum + Number(b.amount), 0);

  if (predictableRevenue >= fixedCosts && fixedCosts > 0) {
    insights.push({
      id: 'f_safety',
      type: 'success',
      category: 'revenue',
      text: `Sua receita previsível já cobre seus custos fixos deste mês.`
    });
  }

  const variableRevenue = currentMonthTxs.filter(t => t.type === 'income' && t.recurrence_type === 'variable').reduce((sum, t) => sum + Number(t.amount), 0);
  if (variableRevenue > predictableRevenue) {
    insights.push({
      id: 'f_variable_heavy',
      type: 'warning',
      category: 'revenue',
      text: `Sua principal fonte de renda atual é variável. Cuidado com oscilações.`
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: 'f_neutral',
      type: 'info',
      category: 'info',
      text: `O fluxo de caixa está rodando dentro do esperado.`
    });
  }

  return insights;
};

export const generateGoalsInsights = (transactions: Transaction[], goalAmount: number = 20000): Insight[] => {
  const insights: Insight[] = [];
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const income = transactions.filter(t => t.type === 'income' && new Date(t.transaction_date).getMonth() === currentMonth && new Date(t.transaction_date).getFullYear() === currentYear).reduce((sum, t) => sum + Number(t.amount), 0);

  const percent = (income / goalAmount) * 100;
  const dayOfMonth = new Date().getDate();
  const monthProgress = (dayOfMonth / 30) * 100;

  if (percent >= 100) {
    insights.push({
      id: 'g_hit',
      type: 'success',
      category: 'growth',
      text: `Você já bateu a sua meta de faturamento do mês! Todo ganho agora é excedente.`
    });
  } else if (percent > monthProgress + 10) {
    insights.push({
      id: 'g_ahead',
      type: 'success',
      category: 'growth',
      text: `Você está adiantado em relação à sua meta. Ritmo excelente!`
    });
  } else if (percent < monthProgress - 15) {
    insights.push({
      id: 'g_behind',
      type: 'warning',
      category: 'risk',
      text: `Você está um pouco atrasado na meta mensal. Foque em fechar os projetos pendentes.`
    });
  } else {
    insights.push({
      id: 'g_on_track',
      type: 'info',
      category: 'growth',
      text: `O progresso da meta está alinhado com os dias do mês. Mantenha o ritmo.`
    });
  }

  return insights;
};
