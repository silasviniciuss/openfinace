import React, { useState } from 'react';
import type { DashboardSummary, Transaction } from '../types/finance.ts';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  PieChart as PieIcon,
  BarChart3,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';

interface DashboardViewProps {
  summary: DashboardSummary | null;
  selectedYear: string;
  onChangeYear: (year: string) => void;
  onNavigateTab: (tab: 'payments' | 'receipts' | 'transactions') => void;
  onConfirmPayment: (txId: string) => void;
  onConfirmReceipt: (txId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  summary,
  selectedYear,
  onChangeYear,
  onNavigateTab,
  onConfirmPayment,
  onConfirmReceipt,
}) => {
  const [activeChartTab, setActiveChartTab] = useState<'flow' | 'income' | 'expense' | 'category'>('flow');

  if (!summary) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs">Carregando métricas financeiras...</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const {
    totalBalance,
    monthlyIncome,
    monthlyExpense,
    monthlyResult,
    todaySummary,
    todayPayments,
    todayReceipts,
    alerts,
    monthlyTrends,
    categoriesBreakdown,
    comparativeMonths,
    recentTransactions,
  } = summary;

  // Pie chart colors
  const PIE_COLORS = ['#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#ef4444', '#8b5cf6', '#64748b'];

  return (
    <div className="space-y-6 pb-12">
      {/* Alertas de Vencimento Banner (PRD Section 28) */}
      {(alerts.overdueCount > 0 || alerts.todayCount > 0 || alerts.next7DaysCount > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {alerts.overdueCount > 0 && (
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <div className="flex-1">
                <span className="font-bold">{alerts.overdueCount} pagamentos vencidos</span>
                <p className="text-[11px] text-rose-300/80">Regularize para evitar juros</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('payments')}
                className="text-xs text-rose-300 font-semibold hover:underline cursor-pointer"
              >
                Ver
              </button>
            </div>
          )}

          {alerts.todayCount > 0 && (
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="flex-1">
                <span className="font-bold">{alerts.todayCount} pagamentos vencem hoje</span>
                <p className="text-[11px] text-amber-300/80">Programados para 19/09</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('payments')}
                className="text-xs text-amber-300 font-semibold hover:underline cursor-pointer"
              >
                Ver
              </button>
            </div>
          )}

          {alerts.next7DaysCount > 0 && (
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/60 text-blue-200 text-xs">
              <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
              <div className="flex-1">
                <span className="font-bold">{alerts.next7DaysCount} pagamentos nos próximos 7 dias</span>
                <p className="text-[11px] text-blue-300/80">Previsão de saídas futuras</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('payments')}
                className="text-xs text-blue-300 font-semibold hover:underline cursor-pointer"
              >
                Ver
              </button>
            </div>
          )}
        </div>
      )}

      {/* 4 Cards Principais (PRD Section 6) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Saldo Atual */}
        <div className="bg-[#0f1422] border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Saldo Atual</span>
            <div className="w-8 h-8 rounded-lg bg-blue-950/80 border border-blue-800/50 flex items-center justify-center text-blue-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {formatCurrency(totalBalance)}
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Consolidado em contas bancárias
          </p>
        </div>

        {/* Entradas do Mês */}
        <div className="bg-[#0f1422] border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Entradas</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-400 tracking-tight">
            {formatCurrency(monthlyIncome)}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Recebimentos no mês corrente</p>
        </div>

        {/* Saídas do Mês */}
        <div className="bg-[#0f1422] border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Saídas</span>
            <div className="w-8 h-8 rounded-lg bg-rose-950/80 border border-rose-800/50 flex items-center justify-center text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-rose-400 tracking-tight">
            {formatCurrency(monthlyExpense)}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Pagamentos e despesas no mês</p>
        </div>

        {/* Resultado */}
        <div className="bg-[#0f1422] border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Resultado</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
              monthlyResult >= 0
                ? 'bg-emerald-950/80 border-emerald-800/50 text-emerald-400'
                : 'bg-rose-950/80 border-rose-800/50 text-rose-400'
            }`}>
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-bold tracking-tight ${
            monthlyResult >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {monthlyResult >= 0 ? `+ ${formatCurrency(monthlyResult)}` : formatCurrency(monthlyResult)}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Líquido de entradas menos saídas</p>
        </div>
      </div>

      {/* ALERTA — PAGAMENTOS E RECEBIMENTOS DO DIA (PRD Section 7 & 8) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Pagamentos de Hoje */}
        <div className="bg-[#0f1422] border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-rose-400">
                  PAGAMENTOS DE HOJE
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-mono">19 de setembro</span>
            </div>

            {todayPayments.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-300 font-medium">
                  Você possui <span className="font-bold text-white">{todayPayments.length} pagamentos</span> hoje:
                </p>
                <div className="space-y-2 bg-[#0a0d16] p-3 rounded-xl border border-slate-800/80">
                  {todayPayments.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/60 last:border-0"
                    >
                      <div>
                        <span className="font-semibold text-white">{p.supplierName || p.description}</span>
                        <span className="text-[10px] text-slate-400 ml-2">({p.paymentMethod?.toUpperCase() || 'PIX'})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-rose-400">{formatCurrency(p.amount)}</span>
                        <button
                          type="button"
                          onClick={() => onConfirmPayment(p.id)}
                          className="px-2 py-0.5 text-[10px] font-semibold bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-200 rounded-md cursor-pointer transition-colors"
                        >
                          Pagar
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-700/80">
                    <span className="font-bold uppercase text-slate-300">TOTAL</span>
                    <span className="font-bold text-sm text-rose-400">
                      {formatCurrency(todaySummary.paymentsTotal)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-emerald-300 text-xs flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="font-bold text-emerald-400">Tudo certo!</p>
                  <p className="text-[11px] text-slate-400">Você não possui pagamentos programados para hoje.</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => onNavigateTab('payments')}
              className="w-full py-2 px-3 rounded-xl bg-[#141b2c] hover:bg-[#1a233a] border border-slate-700/70 text-xs font-semibold text-slate-200 hover:text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Ver todos os pagamentos</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Recebimentos de Hoje */}
        <div className="bg-[#0f1422] border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-blue-400">
                  RECEBIMENTOS DE HOJE
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-mono">19 de setembro</span>
            </div>

            {todayReceipts.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-300 font-medium">
                  Você possui <span className="font-bold text-white">{todayReceipts.length} recebimentos</span> hoje:
                </p>
                <div className="space-y-2 bg-[#0a0d16] p-3 rounded-xl border border-slate-800/80">
                  {todayReceipts.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/60 last:border-0"
                    >
                      <div>
                        <span className="font-semibold text-white">{r.clientName || r.description}</span>
                        <span className="text-[10px] text-slate-400 ml-2">({r.paymentMethod?.toUpperCase() || 'PIX'})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-400">{formatCurrency(r.amount)}</span>
                        <button
                          type="button"
                          onClick={() => onConfirmReceipt(r.id)}
                          className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800/60 text-emerald-200 rounded-md cursor-pointer transition-colors"
                        >
                          Receber
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-700/80">
                    <span className="font-bold uppercase text-slate-300">TOTAL</span>
                    <span className="font-bold text-sm text-emerald-400">
                      {formatCurrency(todaySummary.receiptsTotal)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-300 text-xs flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-slate-400 shrink-0" />
                <div>
                  <p className="font-medium text-slate-200">Nenhum recebimento previsto para hoje.</p>
                  <p className="text-[11px] text-slate-500">Seus clientes estão em dia.</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => onNavigateTab('receipts')}
              className="w-full py-2 px-3 rounded-xl bg-[#141b2c] hover:bg-[#1a233a] border border-slate-700/70 text-xs font-semibold text-slate-200 hover:text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Ver todos os recebimentos</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Resumo do Dia (PRD Section 9) */}
      <div className="bg-[#0d121f] border border-slate-800/70 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-200">
              Hoje — 19 de setembro
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Balanço do dia atual</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Pagamentos */}
          <div className="bg-[#121828] border border-slate-800 rounded-xl p-4">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              PAGAMENTOS
            </p>
            <p className="text-xl font-bold text-rose-400 mt-1">
              {formatCurrency(todaySummary.paymentsTotal)}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {todaySummary.paymentsCount} lançamentos
            </p>
          </div>

          {/* Recebimentos */}
          <div className="bg-[#121828] border border-slate-800 rounded-xl p-4">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              RECEBIMENTOS
            </p>
            <p className="text-xl font-bold text-emerald-400 mt-1">
              {formatCurrency(todaySummary.receiptsTotal)}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {todaySummary.receiptsCount} lançamentos
            </p>
          </div>

          {/* Resultado */}
          <div className="bg-[#121828] border border-slate-800 rounded-xl p-4">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              RESULTADO DO DIA
            </p>
            <p className={`text-xl font-bold mt-1 ${todaySummary.result >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {todaySummary.result >= 0 ? `+ ${formatCurrency(todaySummary.result)}` : formatCurrency(todaySummary.result)}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Líquido estimado hoje</p>
          </div>
        </div>
      </div>

      {/* Gráficos e Análise Financeira (PRD Sections 10, 11, 12, 13, 14) */}
      <div className="bg-[#0f1422] border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800/70">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Análise Financeira
            </h3>
            <p className="text-xs text-slate-400">
              Fluxo financeiro mensal, receitas, despesas e distribuição por categorias
            </p>
          </div>

          {/* Chart Tabs & Period Selector (PRD Section 11) */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex bg-[#0b0e17] p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setActiveChartTab('flow')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-medium ${
                  activeChartTab === 'flow' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Fluxo Mensal
              </button>
              <button
                type="button"
                onClick={() => setActiveChartTab('income')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-medium ${
                  activeChartTab === 'income' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Entradas
              </button>
              <button
                type="button"
                onClick={() => setActiveChartTab('expense')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-medium ${
                  activeChartTab === 'expense' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Saídas
              </button>
              <button
                type="button"
                onClick={() => setActiveChartTab('category')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-medium ${
                  activeChartTab === 'category' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Categorias
              </button>
            </div>

            {/* Year Selector */}
            <select
              value={selectedYear}
              onChange={(e) => onChangeYear(e.target.value)}
              className="bg-[#0b0e17] border border-slate-800 text-slate-200 text-xs font-semibold py-2 px-3 rounded-xl focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>
        </div>

        {/* Tab 1: Fluxo Mensal (PRD Section 10) */}
        {activeChartTab === 'flow' && (
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-4 px-2">
              <span className="font-semibold text-slate-300">ENTRADAS x SAÍDAS ({selectedYear})</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Entradas
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  Saídas
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  Resultado
                </span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                      color: '#f8fafc',
                    }}
                    formatter={(val: any) => formatCurrency(Number(val) || 0)}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    name="Entradas"
                    fill="#10b981"
                    fillOpacity={0.15}
                    stroke="#10b981"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    name="Saídas"
                    fill="#ef4444"
                    fillOpacity={0.15}
                    stroke="#ef4444"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="result"
                    name="Resultado"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#3b82f6' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab 2: Entradas por Mês (PRD Section 12) */}
        {activeChartTab === 'income' && (
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-4 px-2">
              <span className="font-semibold text-emerald-400">ENTRADAS POR MÊS ({selectedYear})</span>
              <span className="text-[11px] text-slate-400">Passe o mouse para ver o valor exato</span>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                      color: '#f8fafc',
                    }}
                    formatter={(val: any) => formatCurrency(Number(val) || 0)}
                  />
                  <Bar dataKey="income" name="Entradas" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab 3: Saídas por Mês (PRD Section 13) */}
        {activeChartTab === 'expense' && (
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-4 px-2">
              <span className="font-semibold text-rose-400">SAÍDAS POR MÊS ({selectedYear})</span>
              <span className="text-[11px] text-slate-400">Passe o mouse para ver o valor exato</span>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                      color: '#f8fafc',
                    }}
                    formatter={(val: any) => formatCurrency(Number(val) || 0)}
                  />
                  <Bar dataKey="expense" name="Saídas" fill="#ef4444" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab 4: Despesas por Categoria (PRD Section 14) */}
        {activeChartTab === 'category' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                      color: '#f8fafc',
                    }}
                    formatter={(val: any) => formatCurrency(Number(val) || 0)}
                  />
                  <Pie
                    data={categoriesBreakdown}
                    dataKey="amount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    {categoriesBreakdown.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Breakdown List */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Distribuição de Despesas
              </h4>
              {categoriesBreakdown.map((cat, idx) => {
                const totalExpenses = categoriesBreakdown.reduce((acc, c) => acc + c.amount, 0) || 1;
                const percent = ((cat.amount / totalExpenses) * 100).toFixed(0);
                return (
                  <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/60">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-md shrink-0"
                        style={{ backgroundColor: cat.color || PIE_COLORS[idx % PIE_COLORS.length] }}
                      />
                      <span className="text-slate-200 font-medium">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono">
                      <span className="text-slate-400 text-[11px]">{percent}%</span>
                      <span className="font-semibold text-white">{formatCurrency(cat.amount)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Grid: Comparativo Mensal & Últimas Movimentações (PRD Section 15 & 16) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Comparativo Mensal (PRD Section 15) */}
        <div className="bg-[#0f1422] border border-slate-800/80 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Comparativo Mensal
              </h3>
              <p className="text-xs text-slate-400">Entradas versus saídas por mês</p>
            </div>
            <span className="text-xs text-blue-400 font-semibold">{selectedYear}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Mês</th>
                  <th className="py-2.5 px-3 text-right">Entradas</th>
                  <th className="py-2.5 px-3 text-right">Saídas</th>
                  <th className="py-2.5 px-3 text-right">Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {comparativeMonths.map((row, idx) => {
                  const saldo = row.income - row.expense;
                  return (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2 px-3 font-medium text-slate-200">{row.month}</td>
                      <td className="py-2 px-3 text-right text-emerald-400 font-mono">
                        {formatCurrency(row.income)}
                      </td>
                      <td className="py-2 px-3 text-right text-rose-400 font-mono">
                        {formatCurrency(row.expense)}
                      </td>
                      <td className={`py-2 px-3 text-right font-mono font-semibold ${
                        saldo >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {saldo >= 0 ? `+ ${formatCurrency(saldo)}` : formatCurrency(saldo)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Últimas Movimentações (PRD Section 16) */}
        <div className="bg-[#0f1422] border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  Últimas Movimentações
                </h3>
                <p className="text-xs text-slate-400">Extrato recente de receitas e despesas</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('transactions')}
                className="text-xs text-blue-400 font-semibold hover:underline cursor-pointer"
              >
                Ver todas
              </button>
            </div>

            <div className="space-y-2.5">
              {recentTransactions.map((tx) => {
                const isIncome = tx.type === 'income';
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#0b0e17] border border-slate-800/70 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isIncome
                          ? 'bg-emerald-950/80 border border-emerald-800/60 text-emerald-400'
                          : 'bg-rose-950/80 border border-rose-800/60 text-rose-400'
                      }`}>
                        {isIncome ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">
                          {tx.clientName || tx.supplierName || tx.description}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {tx.description} • {tx.dueDate}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`text-xs font-bold font-mono ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isIncome ? `+ ${formatCurrency(tx.amount)}` : `- ${formatCurrency(tx.amount)}`}
                      </p>
                      <span className={`inline-block text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                        tx.status === 'paid' || tx.status === 'received'
                          ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/30'
                          : tx.status === 'overdue'
                          ? 'bg-rose-950/50 text-rose-400 border border-rose-800/30'
                          : 'bg-amber-950/50 text-amber-400 border border-amber-800/30'
                      }`}>
                        {tx.status === 'paid'
                          ? 'Pago'
                          : tx.status === 'received'
                          ? 'Recebido'
                          : tx.status === 'overdue'
                          ? 'Atrasado'
                          : 'Pendente'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => onNavigateTab('transactions')}
              className="w-full py-2 px-3 rounded-xl bg-[#141b2c] hover:bg-[#1a233a] border border-slate-700/70 text-xs font-semibold text-slate-200 hover:text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Ver histórico completo</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
