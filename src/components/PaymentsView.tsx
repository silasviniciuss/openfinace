import React, { useState } from 'react';
import type { Account, Company, Transaction } from '../types/finance.ts';
import {
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Calendar,
  CreditCard,
  Building2,
  Plus,
} from 'lucide-react';

interface PaymentsViewProps {
  transactions: Transaction[];
  companies: Company[];
  accounts: Account[];
  onConfirmPayment: (txId: string, accountId?: string) => void;
  onDeleteTransaction: (txId: string) => void;
  onOpenNewPayment: () => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  transactions,
  companies,
  accounts,
  onConfirmPayment,
  onDeleteTransaction,
  onOpenNewPayment,
}) => {
  const [filterPeriod, setFilterPeriod] = useState<
    'today' | 'tomorrow' | '7days' | 'month' | 'overdue' | 'paid' | 'all'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [confirmingTxId, setConfirmingTxId] = useState<string | null>(null);

  const todayStr = '2026-09-19';
  const tomorrowStr = '2026-09-20';
  const next7DaysStr = '2026-09-26';
  const currentMonthStr = '2026-09';

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const companyMap = new Map(companies.map((c) => [c.id, c.name]));

  // Only consider expense transactions
  const allPayments = transactions.filter((t) => t.type === 'expense');

  // Filter logic (PRD Section 29)
  const filteredPayments = allPayments.filter((t) => {
    // Search text
    const matchesSearch =
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.supplierName && t.supplierName.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterPeriod === 'today') {
      return t.dueDate === todayStr && t.status !== 'paid';
    }
    if (filterPeriod === 'tomorrow') {
      return t.dueDate === tomorrowStr && t.status !== 'paid';
    }
    if (filterPeriod === '7days') {
      return t.dueDate >= todayStr && t.dueDate <= next7DaysStr && t.status !== 'paid';
    }
    if (filterPeriod === 'month') {
      return t.dueDate.startsWith(currentMonthStr);
    }
    if (filterPeriod === 'overdue') {
      return (t.dueDate < todayStr && t.status !== 'paid') || t.status === 'overdue';
    }
    if (filterPeriod === 'paid') {
      return t.status === 'paid';
    }
    return true;
  });

  // Totals
  const todayTotal = allPayments
    .filter((t) => t.dueDate === todayStr && t.status !== 'paid')
    .reduce((acc, t) => acc + t.amount, 0);

  const monthTotal = allPayments
    .filter((t) => t.dueDate.startsWith(currentMonthStr))
    .reduce((acc, t) => acc + t.amount, 0);

  const overdueTotal = allPayments
    .filter((t) => (t.dueDate < todayStr && t.status !== 'paid') || t.status === 'overdue')
    .reduce((acc, t) => acc + t.amount, 0);

  const handleConfirm = (txId: string) => {
    onConfirmPayment(txId, selectedAccountId || undefined);
    setConfirmingTxId(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Controle de Pagamentos
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Gerencie todas as contas a pagar, vencimentos e liquidações
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenNewPayment}
          className="bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Pagamento</span>
        </button>
      </div>

      {/* KPI Cards (PRD Section 29) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0f1422] border border-slate-800/80 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider">A Pagar Hoje</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400 tracking-tight">
            {formatCurrency(todayTotal)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">19 de setembro de 2026</p>
        </div>

        <div className="bg-[#0f1422] border border-slate-800/80 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider">Total do Mês</span>
            <Calendar className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-rose-400 tracking-tight">
            {formatCurrency(monthTotal)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Setembro / 2026</p>
        </div>

        <div className="bg-[#0f1422] border border-slate-800/80 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider">Pagamentos Vencidos</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-rose-500 tracking-tight">
            {formatCurrency(overdueTotal)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Contas em atraso</p>
        </div>
      </div>

      {/* Filters Bar (PRD Section 29) */}
      <div className="bg-[#0f1422] border border-slate-800/80 rounded-2xl p-4 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'today', label: 'Hoje' },
              { id: 'tomorrow', label: 'Amanhã' },
              { id: '7days', label: 'Próximos 7 dias' },
              { id: 'month', label: 'Este mês' },
              { id: 'overdue', label: 'Atrasados' },
              { id: 'paid', label: 'Pagos' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterPeriod(f.id as any)}
                className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  filterPeriod === f.id
                    ? 'bg-rose-600 text-white font-semibold'
                    : 'bg-[#131826] text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search input */}
          <div className="relative min-w-[240px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              placeholder="Buscar descrição ou fornecedor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#131826] border border-slate-700/60 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        {/* Payments Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="py-3 px-3">Vencimento</th>
                <th className="py-3 px-3">Descrição / Fornecedor</th>
                <th className="py-3 px-3">Empresa</th>
                <th className="py-3 px-3">Forma</th>
                <th className="py-3 px-3 text-right">Valor</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                    Nenhum pagamento encontrado para o filtro selecionado.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((t) => {
                  const isToday = t.dueDate === todayStr;
                  const isTomorrow = t.dueDate === tomorrowStr;
                  const isOverdue = (t.dueDate < todayStr && t.status !== 'paid') || t.status === 'overdue';
                  const isPaid = t.status === 'paid';
                  const companyName = t.companyId ? companyMap.get(t.companyId) || 'Empresa' : 'Geral';

                  return (
                    <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3 font-mono text-slate-300">
                        {t.dueDate}
                      </td>
                      <td className="py-3 px-3 font-medium text-white">
                        <div>{t.supplierName || t.description}</div>
                        {t.supplierName && (
                          <div className="text-[10px] text-slate-400">{t.description}</div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-800/60 text-slate-300">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          {companyName}
                        </span>
                      </td>
                      <td className="py-3 px-3 uppercase text-slate-400 text-[10px]">
                        {t.paymentMethod || 'PIX'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-rose-400 text-sm">
                        {formatCurrency(t.amount)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isPaid
                              ? 'bg-emerald-950/60 border border-emerald-800/50 text-emerald-400'
                              : isOverdue
                              ? 'bg-rose-950/80 border border-rose-800/60 text-rose-300'
                              : isToday
                              ? 'bg-amber-950/80 border border-amber-800/60 text-amber-300'
                              : isTomorrow
                              ? 'bg-blue-950/60 border border-blue-800/50 text-blue-300'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {isPaid
                            ? 'Pago'
                            : isOverdue
                            ? 'Vencido'
                            : isToday
                            ? 'Hoje'
                            : isTomorrow
                            ? 'Amanhã'
                            : 'Futuro'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isPaid && (
                            <button
                              type="button"
                              onClick={() => setConfirmingTxId(t.id)}
                              className="px-2.5 py-1 text-xs font-semibold bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800/60 text-emerald-200 rounded-lg cursor-pointer transition-colors"
                            >
                              Confirmar Pagamento
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onDeleteTransaction(t.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 rounded-md transition-colors cursor-pointer"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Payment Modal */}
      {confirmingTxId && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-[#121826] border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">
              Confirmar Pagamento
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Selecione a conta bancária para débito do saldo financeiro:
            </p>

            <div className="space-y-3 mb-5">
              <label className="block text-xs font-medium text-slate-300">
                Conta de Saída
              </label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full bg-[#0b0e17] border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              >
                <option value="">Selecione uma conta...</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.bank}) - Saldo: {formatCurrency(acc.currentBalance)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmingTxId(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleConfirm(confirmingTxId)}
                className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl cursor-pointer transition-colors shadow-lg shadow-emerald-950/40"
              >
                Efetivar Pagamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
