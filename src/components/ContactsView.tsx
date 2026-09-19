import React, { useState } from 'react';
import type { Company, Contact } from '../types/finance.ts';
import { Users, Plus, Mail, Phone, Building2, FileText } from 'lucide-react';

interface ContactsViewProps {
  contacts: Contact[];
  companies: Company[];
  onCreateContact: (contact: Partial<Contact>) => Promise<void>;
}

export const ContactsView: React.FC<ContactsViewProps> = ({
  contacts,
  companies,
  onCreateContact,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'client' | 'supplier'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'client' | 'supplier'>('client');
  const [document, setDocument] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const companyMap = new Map(companies.map((c) => [c.id, c.name]));

  const filtered = contacts.filter((c) => {
    if (filterType !== 'all' && c.type !== filterType) return false;
    return true;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setIsSubmitting(true);
    try {
      await onCreateContact({
        name,
        type,
        document,
        email,
        phone,
        companyId: companyId || null,
      });
      setName('');
      setDocument('');
      setEmail('');
      setPhone('');
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
            Clientes & Fornecedores
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Cadastro unificado de parceiros comerciais e tomadores de serviço
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Contato</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer ${
            filterType === 'all'
              ? 'bg-blue-600 text-white font-semibold'
              : 'bg-[#0f1422] text-slate-300 border border-slate-800'
          }`}
        >
          Todos ({contacts.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterType('client')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer ${
            filterType === 'client'
              ? 'bg-emerald-600 text-white font-semibold'
              : 'bg-[#0f1422] text-slate-300 border border-slate-800'
          }`}
        >
          Clientes ({contacts.filter((c) => c.type === 'client').length})
        </button>
        <button
          type="button"
          onClick={() => setFilterType('supplier')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer ${
            filterType === 'supplier'
              ? 'bg-rose-600 text-white font-semibold'
              : 'bg-[#0f1422] text-slate-300 border border-slate-800'
          }`}
        >
          Fornecedores ({contacts.filter((c) => c.type === 'supplier').length})
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => {
          const isClient = c.type === 'client';
          const compName = c.companyId ? companyMap.get(c.companyId) : null;

          return (
            <div
              key={c.id}
              className="bg-[#0f1422] border border-slate-800/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">{c.name}</h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {c.document ? `Doc: ${c.document}` : 'Sem documento'}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      isClient
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                        : 'bg-rose-950/60 text-rose-400 border border-rose-800/50'
                    }`}
                  >
                    {isClient ? 'Cliente' : 'Fornecedor'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                  {c.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate">{c.email}</span>
                    </div>
                  )}
                  {c.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>{c.phone}</span>
                    </div>
                  )}
                  {compName && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <Building2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>{compName}</span>
                    </div>
                  )}
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
              Cadastrar Contato
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Adicione um cliente ou fornecedor aos seus cadastros
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nome do Contato / Razão Social *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Empresa ABC, João da Silva..."
                  className="w-full bg-[#0b0e17] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Tipo de Vínculo
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-[#0b0e17] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="client">Cliente</option>
                    <option value="supplier">Fornecedor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    CPF / CNPJ
                  </label>
                  <input
                    type="text"
                    value={document}
                    onChange={(e) => setDocument(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full bg-[#0b0e17] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contato@empresa.com"
                    className="w-full bg-[#0b0e17] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full bg-[#0b0e17] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
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
                  {isSubmitting ? 'Salvando...' : 'Salvar Contato'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
