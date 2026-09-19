import React, { useState } from 'react';
import type { Account, Category, Company, Transaction } from '../types/finance.ts';
import {
  Search,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Trash2,
  Building2,
  Download,
} from 'lucide-react';

interface TransactionsViewProps {
  transactions: Transaction[];
  companies: Company[];
  accounts: Account[];
  categories: Category[];
  onOpenModal: (type?: 'income' | 'expense') => void;
  onDeleteTransaction: (id: string) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  companies,
  accounts,
  categories,
  onOpenModal,
  onDeleteTransaction,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCompany, setFilterCompany] = useState<string>('all');
  const [search, setSearch] = useState('');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const companyMap = new Map(companies.map((c) => [c.id, c.name]));
  const catMap = new Map(categories.map((c) => [c.id, c]));

  const filtered = transactions.filter((t) => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (filterCompany !== 'all' && t.companyId !== filterCompany) return false;
    if (
      search &&
      !t.description.toLowerCase().includes(search.toLowerCase()) &&
      !(t.clientName && t.clientName.toLowerCase().includes(search.toLowerCase())) &&
      !(t.supplierName && t.supplierName.toLowerCase().includes(search.toLowerCase()))
    ) {
      return false;
    }
    return true;
  });

  const exportCSV = () => {
    const headers = ['Data', 'Vencimento', 'Tipo', 'Descrição', 'Empresa', 'Valor', 'Status', 'Forma'];
    const rows = filtered.map((t) => [
      t.transactionDate,
      t.dueDate,
      t.type === 'income' ? 'Entrada' : 'Saída',
      `"${t.description.replace(/"/g, '""')}"`,
      t.companyId ? companyMap.get(t.companyId) || '' : '',
      t.amount.toFixed(2),
      t.status,
      t.paymentMethod || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `extrato_silas_finance_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Extrato de Lançamentos
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Registro detalhado de todas as transações financeiras
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={exportCSV}
            className="bg-[#141b2c] hover:bg-[#1b243b] border border-slate-700/70 text-slate-200 text-xs font-semibold py-2.5 px-3.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Exportar CSV</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenModal('income')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2.5 px-3.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-950/40"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Entrada</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenModal('expense')}
            className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold py-2.5 px-3.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-rose-950/40"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Saída</span>
          </button>
        </div>
      </div>

      {/* Filter and search bar */}
      <div className="bg-[#0f1422] border border-slate-800/80 rounded-2xl p-4 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <div className="flex bg-[#0b0e17] p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                  filterType === 'all' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setFilterType('income')}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                  filterType === 'income' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Entradas
              </button>
              <button
                type="button"
                onClick={() => setFilterType('expense')}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                  filterType === 'expense' ? 'bg-rose-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Saídas
              </button>
            </div>

            {/* Company Filter */}
            <select
              value={filterCompany}
              onChange={(e) => setFilterCompany(e.target.value)}
              className="bg-[#0b0e17] border border-slate-800 text-slate-200 text-xs py-2 px-3 rounded-xl focus:outline-none focus:border-blue-500"
            >
              <option value="all">Todas as empresas</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative min-w-[260px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              placeholder="Buscar lançamento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#131826] border border-slate-700/60 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="py-3 px-3">Data</th>
                <th className="py-3 px-3">Vencimento</th>
                <th className="py-3 px-3">Descrição / Contato</th>
                <th className="py-3 px-3">Empresa</th>
                <th className="py-3 px-3">Categoria</th>
                <th className="py-3 px-3 text-right">Valor</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                    Nenhum lançamento encontrado.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const isIncome = t.type === 'income';
                  const compName = t.companyId ? companyMap.get(t.companyId) || 'Empresa' : 'Geral';
                  const cat = t.categoryId ? catMap.get(t.categoryId) : null;

                  return (
                    <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3 text-slate-400 font-mono">{t.transactionDate}</td>
                      <td className="py-3 px-3 text-slate-300 font-mono font-medium">{t.dueDate}</td>
                      <td className="py-3 px-3 font-medium text-white">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-xs ${
                              isIncome ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                            }`}
                          >
                            {isIncome ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          </span>
                          <div>
                            <p>{t.description}</p>
                            {(t.clientName || t.supplierName) && (
                              <p className="text-[10px] text-slate-400">
                                {t.clientName || t.supplierName} • {t.paymentMethod?.toUpperCase()}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-800/60 text-slate-300">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          {compName}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {cat ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px]">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                            {cat.name}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">—</span>
                        )}
                      </td>
                      <td className={`py-3 px-3 text-right font-mono font-bold text-sm ${
                        isIncome ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {isIncome ? `+ ${formatCurrency(t.amount)}` : `- ${formatCurrency(t.amount)}`}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            t.status === 'paid' || t.status === 'received'
                              ? 'bg-emerald-950/60 border border-emerald-800/50 text-emerald-400'
                              : t.status === 'overdue'
                              ? 'bg-rose-950/60 border border-rose-800/50 text-rose-300'
                              : 'bg-amber-950/60 border border-amber-800/50 text-amber-300'
                          }`}
                        >
                          {t.status === 'paid'
                            ? 'Pago'
                            : t.status === 'received'
                            ? 'Recebido'
                            : t.status === 'overdue'
                            ? 'Atrasado'
                            : 'Pendente'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => onDeleteTransaction(t.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
