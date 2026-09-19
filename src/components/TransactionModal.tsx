import React, { useState, useEffect } from 'react';
import type { Account, Category, Company, Contact, Transaction } from '../types/finance.ts';
import { X, ArrowDownLeft, ArrowUpRight, Calendar, DollarSign, Building2 } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: 'income' | 'expense';
  companies: Company[];
  accounts: Account[];
  categories: Category[];
  contacts: Contact[];
  onSubmit: (transactionData: Partial<Transaction>) => Promise<void>;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  initialType = 'expense',
  companies,
  accounts,
  categories,
  contacts,
  onSubmit,
}) => {
  const [type, setType] = useState<'income' | 'expense'>(initialType);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [transactionDate, setTransactionDate] = useState('2026-09-19');
  const [dueDate, setDueDate] = useState('2026-09-19');
  const [status, setStatus] = useState<'pending' | 'paid' | 'received'>('pending');
  const [clientOrSupplierName, setClientOrSupplierName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [notes, setNotes] = useState('');
  const [totalInstallments, setTotalInstallments] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setType(initialType);
    setStatus('pending');
  }, [initialType, isOpen]);

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) => c.type === type);
  const relevantContacts = contacts.filter((c) => (type === 'income' ? c.type === 'client' : c.type === 'supplier'));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    setIsSubmitting(true);
    try {
      const finalStatus =
        status === 'paid' || status === 'received'
          ? type === 'income'
            ? 'received'
            : 'paid'
          : 'pending';

      await onSubmit({
        type,
        description,
        amount: parseFloat(amount) || 0,
        companyId: companyId || null,
        accountId: accountId || null,
        categoryId: categoryId || null,
        transactionDate,
        dueDate,
        status: finalStatus as any,
        clientName: type === 'income' ? clientOrSupplierName : null,
        supplierName: type === 'expense' ? clientOrSupplierName : null,
        paymentMethod,
        notes,
        totalInstallments: parseInt(totalInstallments, 10) || 1,
      });

      // Reset
      setDescription('');
      setAmount('');
      setNotes('');
      setTotalInstallments('1');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#101626] border border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                type === 'income' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
              }`}
            >
              {type === 'income' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
            </div>
            <h3 className="text-base font-bold text-white">
              {type === 'income' ? 'Nova Entrada (Recebimento)' : 'Nova Saída (Pagamento)'}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-2 bg-[#0b0e17] p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setType('income');
                if (status === 'paid') setStatus('received');
              }}
              className={`py-2 text-center rounded-lg font-semibold cursor-pointer transition-colors ${
                type === 'income' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Entrada (+ Receita)
            </button>
            <button
              type="button"
              onClick={() => {
                setType('expense');
                if (status === 'received') setStatus('paid');
              }}
              className={`py-2 text-center rounded-lg font-semibold cursor-pointer transition-colors ${
                type === 'expense' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Saída (- Despesa)
            </button>
          </div>

          {/* Description & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-medium mb-1">
                Descrição *
              </label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Consultoria mensal, Servidor AWS..."
                className="w-full bg-[#0b0e17] border border-slate-700/80 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Valor (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                className="w-full bg-[#0b0e17] border border-slate-700/80 rounded-xl px-3 py-2 text-white font-mono font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Company & Account */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Empresa Vinculada
              </label>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full bg-[#0b0e17] border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Geral / Pessoal</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Conta Bancária
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full bg-[#0b0e17] border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Selecione uma conta...</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.bank})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Categoria
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-[#0b0e17] border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Outros / Não categorizado</option>
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                {type === 'income' ? 'Cliente' : 'Fornecedor'}
              </label>
              <input
                type="text"
                value={clientOrSupplierName}
                onChange={(e) => setClientOrSupplierName(e.target.value)}
                placeholder={type === 'income' ? 'Nome do cliente' : 'Nome do fornecedor'}
                className="w-full bg-[#0b0e17] border border-slate-700/80 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Dates & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Competência
              </label>
              <input
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                className="w-full bg-[#0b0e17] border border-slate-700/80 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Vencimento
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-[#0b0e17] border border-slate-700/80 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-[#0b0e17] border border-slate-700/80 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="pending">Pendente</option>
                <option value={type === 'income' ? 'received' : 'paid'}>
                  {type === 'income' ? 'Já Recebido' : 'Já Pago'}
                </option>
              </select>
            </div>
          </div>

          {/* Payment Method & Installments (PRD Section 22) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Forma de Pagamento
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-[#0b0e17] border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="pix">PIX</option>
                <option value="boleto">Boleto Bancário</option>
                <option value="cartao_credito">Cartão de Crédito</option>
                <option value="ted">TED / DOC</option>
                <option value="dinheiro">Dinheiro</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Parcelamento (PRD)
              </label>
              <select
                value={totalInstallments}
                onChange={(e) => setTotalInstallments(e.target.value)}
                className="w-full bg-[#0b0e17] border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
              >
                <option value="1">1x à vista</option>
                <option value="2">2x parcelas</option>
                <option value="3">3x parcelas</option>
                <option value="6">6x parcelas</option>
                <option value="10">10x parcelas</option>
                <option value="12">12x parcelas</option>
                <option value="24">24x parcelas</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Observações
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas adicionais, nota fiscal, observações..."
              className="w-full bg-[#0b0e17] border border-slate-700/80 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2.5 text-xs font-semibold text-white rounded-xl cursor-pointer transition-all shadow-lg disabled:opacity-60 ${
                type === 'income'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/40'
                  : 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/40'
              }`}
            >
              {isSubmitting
                ? 'Registrando...'
                : type === 'income'
                ? 'Registrar Recebimento'
                : 'Registrar Pagamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
