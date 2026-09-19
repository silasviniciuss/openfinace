import React, { useState } from 'react';
import type { Category } from '../types/finance.ts';
import { Tags, Plus, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface CategoriesViewProps {
  categories: Category[];
  onCreateCategory: (cat: Partial<Category>) => Promise<void>;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  onCreateCategory,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [color, setColor] = useState('#ef4444');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const incomeCats = categories.filter((c) => c.type === 'income');
  const expenseCats = categories.filter((c) => c.type === 'expense');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setIsSubmitting(true);
    try {
      await onCreateCategory({ name, type, color });
      setName('');
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
            Categorias Financeiras
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Classifique receitas e despesas para relatórios e gráficos precisos
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Categoria</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Despesas */}
        <div className="bg-[#0f1422] border border-slate-800/80 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/70 mb-4">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm uppercase tracking-wider">
              <ArrowUpRight className="w-4 h-4" />
              <span>Categorias de Despesa ({expenseCats.length})</span>
            </div>
          </div>

          <div className="space-y-2">
            {expenseCats.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-3 rounded-xl bg-[#0b0e17] border border-slate-800/60"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-3.5 h-3.5 rounded-md shrink-0"
                    style={{ backgroundColor: cat.color || '#ef4444' }}
                  />
                  <span className="text-xs font-semibold text-white">{cat.name}</span>
                </div>
                <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider bg-rose-950/40 px-2 py-0.5 rounded border border-rose-900/40">
                  Saída
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Receitas */}
        <div className="bg-[#0f1422] border border-slate-800/80 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/70 mb-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase tracking-wider">
              <ArrowDownLeft className="w-4 h-4" />
              <span>Categorias de Receita ({incomeCats.length})</span>
            </div>
          </div>

          <div className="space-y-2">
            {incomeCats.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-3 rounded-xl bg-[#0b0e17] border border-slate-800/60"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-3.5 h-3.5 rounded-md shrink-0"
                    style={{ backgroundColor: cat.color || '#10b981' }}
                  />
                  <span className="text-xs font-semibold text-white">{cat.name}</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/40">
                  Entrada
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-[#121826] border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">
              Cadastrar Nova Categoria
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Defina o nome e o tipo da classificação
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nome da Categoria *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Assinaturas, Marketing..."
                  className="w-full bg-[#0b0e17] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Tipo de Lançamento
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setType('expense');
                      setColor('#ef4444');
                    }}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border cursor-pointer ${
                      type === 'expense'
                        ? 'bg-rose-950/80 border-rose-600 text-rose-300'
                        : 'bg-[#0b0e17] border-slate-800 text-slate-400'
                    }`}
                  >
                    Despesa (Saída)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setType('income');
                      setColor('#10b981');
                    }}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border cursor-pointer ${
                      type === 'income'
                        ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                        : 'bg-[#0b0e17] border-slate-800 text-slate-400'
                    }`}
                  >
                    Receita (Entrada)
                  </button>
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
                  {isSubmitting ? 'Salvando...' : 'Salvar Categoria'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
