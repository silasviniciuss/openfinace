import React, { useState } from 'react';
import type { Account, Company, Transaction } from '../types/finance.ts';
import {
  Building2,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  CheckCircle2,
  FileText,
} from 'lucide-react';

interface CompaniesViewProps {
  companies: Company[];
  accounts: Account[];
  transactions: Transaction[];
  onCreateCompany: (company: Partial<Company>) => Promise<void>;
  onSelectCompany: (companyId: string) => void;
}

export const CompaniesView: React.FC<CompaniesViewProps> = ({
  companies,
  accounts,
  transactions,
  onCreateCompany,
  onSelectCompany,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setIsSubmitting(true);
    try {
      await onCreateCompany({ name, cnpj, description, status: 'active' });
      setName('');
      setCnpj('');
      setDescription('');
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Gestão Multi-Empresas
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Controle financeiro isolado e visão consolidada de cada negócio
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Nova Empresa</span>
        </button>
      </div>

      {/* Companies Grid (PRD Section 23) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {companies.map((comp) => {
          const compAccounts = accounts.filter((a) => a.companyId === comp.id);
          const compBalance = compAccounts.reduce((acc, a) => acc + (a.currentBalance || 0), 0);

          const compTx = transactions.filter((t) => t.companyId === comp.id);
          const compIncome = compTx
            .filter((t) => t.type === 'income')
            .reduce((acc, t) => acc + t.amount, 0);
          const compExpense = compTx
            .filter((t) => t.type === 'expense')
            .reduce((acc, t) => acc + t.amount, 0);

          return (
            <div
              key={comp.id}
              className="bg-[#0f1422] border border-slate-800/80 hover:border-slate-700/90 rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{comp.name}</h3>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {comp.cnpj ? `CNPJ: ${comp.cnpj}` : 'Pessoa Física / Gestão'}
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" />
                    Ativa
                  </span>
                </div>

                {comp.description && (
                  <p className="text-xs text-slate-400 mb-4 line-clamp-2">
                    {comp.description}
                  </p>
                )}

                {/* Metrics */}
                <div className="space-y-2 bg-[#0b0e17] p-3.5 rounded-xl border border-slate-800 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5 text-blue-400" />
                      Saldo em Contas
                    </span>
                    <span className="font-bold text-white font-mono">
                      {formatCurrency(compBalance)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-800/60">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
                      Total Entradas
                    </span>
                    <span className="font-bold text-emerald-400 font-mono">
                      {formatCurrency(compIncome)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-800/60">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
                      Total Saídas
                    </span>
                    <span className="font-bold text-rose-400 font-mono">
                      {formatCurrency(compExpense)}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  {compAccounts.length} contas bancárias vinculadas
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/70">
                <button
                  type="button"
                  onClick={() => onSelectCompany(comp.id)}
                  className="w-full py-2 px-3 rounded-xl bg-[#141b2c] hover:bg-blue-600 text-slate-200 hover:text-white text-xs font-semibold transition-all cursor-pointer text-center"
                >
                  Abrir painel da {comp.name}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Company Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-[#121826] border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">
              Cadastrar Nova Empresa
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Crie uma entidade independente para segregar contas e fluxo de caixa
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nome da Empresa / Projeto *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Nova Startup, Consultoria..."
                  className="w-full bg-[#0b0e17] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  CNPJ (opcional)
                </label>
                <input
                  type="text"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  placeholder="00.000.000/0001-00"
                  className="w-full bg-[#0b0e17] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Descrição / Ramo de Atuação
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Finalidade desta empresa ou operação financeira..."
                  className="w-full bg-[#0b0e17] border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl cursor-pointer transition-colors shadow-lg shadow-blue-600/25 disabled:opacity-60"
                >
                  {isSubmitting ? 'Salvando...' : 'Cadastrar Empresa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
