import React, { useState } from 'react';
import type { Account, Company } from '../types/finance.ts';
import { Wallet, Plus, Building2, CheckCircle2 } from 'lucide-react';

interface AccountsViewProps {
  accounts: Account[];
  companies: Company[];
  onCreateAccount: (account: Partial<Account>) => Promise<void>;
}

export const AccountsView: React.FC<AccountsViewProps> = ({
  accounts,
  companies,
  onCreateAccount,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [bank, setBank] = useState('');
  const [type, setType] = useState('corrente');
  const [initialBalance, setInitialBalance] = useState('0');
  const [companyId, setCompanyId] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const companyMap = new Map(companies.map((c) => [c.id, c.name]));
  const totalBalance = accounts.reduce((acc, a) => acc + (a.currentBalance || 0), 0);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setIsSubmitting(true);
    try {
      await onCreateAccount({
        name,
        bank,
        type,
        initialBalance: parseFloat(initialBalance) || 0,
        companyId: companyId || null,
        color,
      });
      setName('');
      setBank('');
      setInitialBalance('0');
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
            Contas Bancárias & Caixas
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Gerencie saldos, bancos parceiros e contas vinculadas a cada empresa
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Nova Conta</span>
        </button>
      </div>

      {/* Global balance header card */}
      <div className="bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-[#0f1422] border border-blue-800/40 rounded-2xl p-6 shadow-xl flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
            Saldo Total Consolidado
          </span>
          <p className="text-3xl font-bold text-white tracking-tight mt-1">
            {formatCurrency(totalBalance)}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Somatório de {accounts.length} contas bancárias cadastradas no sistema
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
          <Wallet className="w-6 h-6" />
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {accounts.map((acc) => {
          const compName = acc.companyId ? companyMap.get(acc.companyId) || 'Empresa' : 'Pessoal / Geral';
          return (
            <div
              key={acc.id}
              className="bg-[#0f1422] border border-slate-800/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: acc.color || '#3b82f6' }}
                    />
                    <div>
                      <h3 className="text-sm font-bold text-white">{acc.name}</h3>
                      <p className="text-[11px] text-slate-400">{acc.bank || 'Instituição Financeira'}</p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {acc.type}
                  </span>
                </div>

                <div className="bg-[#0b0e17] p-3 rounded-xl border border-slate-800/80 my-3">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">
                    Saldo Disponível
                  </p>
                  <p className="text-xl font-bold text-white font-mono mt-0.5">
                    {formatCurrency(acc.currentBalance)}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    {compName}
                  </span>
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Sincronizada
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-[#121826] border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">
              Cadastrar Conta Bancária
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Adicione uma conta corrente, poupança, investimento ou carteira
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nome da Conta *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Nubank PJ, Inter PJ..."
                  className="w-full bg-[#0b0e17] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Banco
                  </label>
                  <input
                    type="text"
                    value={bank}
                    onChange={(e) => setBank(e.target.value)}
                    placeholder="Ex: Nubank, Inter, Itaú"
                    className="w-full bg-[#0b0e17] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Tipo de Conta
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-[#0b0e17] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="corrente">Corrente</option>
                    <option value="poupanca">Poupança</option>
                    <option value="investimento">Investimento</option>
                    <option value="caixa">Caixa Físico</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Saldo Inicial (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(e.target.value)}
                    className="w-full bg-[#0b0e17] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Empresa Vinculada
                  </label>
                  <select
                    value={companyId}
                    onChange={(e) => setCompanyId(e.target.value)}
                    className="w-full bg-[#0b0e17] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Geral / Pessoal</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Cor da Tag
                </label>
                <div className="flex items-center gap-2">
                  {['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded-full cursor-pointer transition-transform ${
                        color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-[#121826]' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
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
                  {isSubmitting ? 'Salvando...' : 'Salvar Conta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
