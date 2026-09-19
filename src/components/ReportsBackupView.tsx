import React, { useState } from 'react';
import type { DashboardSummary } from '../types/finance.ts';
import {
  Download,
  Database,
  ShieldCheck,
  CheckCircle2,
  HardDrive,
  Clock,
  FileCode,
  FileSpreadsheet,
} from 'lucide-react';

interface ReportsBackupViewProps {
  summary: DashboardSummary | null;
  onDownloadBackup: () => Promise<any>;
}

export const ReportsBackupView: React.FC<ReportsBackupViewProps> = ({
  summary,
  onDownloadBackup,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const handleExportJSON = async () => {
    setIsExporting(true);
    try {
      const data = await onDownloadBackup();
      const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonStr);
      downloadAnchor.setAttribute('download', `silas_finance_backup_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportSQL = async () => {
    setIsExporting(true);
    try {
      const data = await onDownloadBackup();
      let sqlDump = `-- SILAS FINANCE POSTGRESQL BACKUP DUMP\n-- Export Date: ${new Date().toISOString()}\n-- Architecture: Cloud SQL PostgreSQL + Drizzle ORM\n\n`;

      if (data.companies?.length) {
        sqlDump += `-- Companies\n`;
        for (const c of data.companies) {
          sqlDump += `INSERT INTO companies (id, user_id, name, cnpj, description, status) VALUES ('${c.id}', '${c.userId}', '${c.name.replace(/'/g, "''")}', '${c.cnpj || ''}', '${(c.description || '').replace(/'/g, "''")}', '${c.status}');\n`;
        }
        sqlDump += `\n`;
      }

      if (data.accounts?.length) {
        sqlDump += `-- Accounts\n`;
        for (const a of data.accounts) {
          sqlDump += `INSERT INTO accounts (id, user_id, company_id, name, bank, type, initial_balance, current_balance, color) VALUES ('${a.id}', '${a.userId}', ${a.companyId ? `'${a.companyId}'` : 'NULL'}, '${a.name}', '${a.bank || ''}', '${a.type}', ${a.initialBalance}, ${a.currentBalance}, '${a.color || ''}');\n`;
        }
        sqlDump += `\n`;
      }

      if (data.transactions?.length) {
        sqlDump += `-- Transactions\n`;
        for (const t of data.transactions) {
          sqlDump += `INSERT INTO transactions (id, user_id, company_id, account_id, category_id, type, description, amount, transaction_date, due_date, status, client_name, supplier_name, payment_method) VALUES ('${t.id}', '${t.userId}', ${t.companyId ? `'${t.companyId}'` : 'NULL'}, ${t.accountId ? `'${t.accountId}'` : 'NULL'}, ${t.categoryId ? `'${t.categoryId}'` : 'NULL'}, '${t.type}', '${t.description.replace(/'/g, "''")}', ${t.amount}, '${t.transactionDate}', '${t.dueDate}', '${t.status}', '${(t.clientName || '').replace(/'/g, "''")}', '${(t.supplierName || '').replace(/'/g, "''")}', '${t.paymentMethod || 'pix'}');\n`;
        }
        sqlDump += `\n`;
      }

      const sqlStr = 'data:text/sql;charset=utf-8,' + encodeURIComponent(sqlDump);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', sqlStr);
      downloadAnchor.setAttribute('download', `silas_finance_database_dump_${Date.now()}.sql`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Relatórios, Segurança & Backup
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Garantia de integridade de dados na nuvem e exportação de backups persistentes
        </p>
      </div>

      {/* Cloud Security Info Card */}
      <div className="bg-[#0f1422] border border-slate-800/80 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Status da Infraestrutura Oficial</h3>
            <p className="text-xs text-slate-400">
              Conexão ativa com o banco de dados relacional e serviços em nuvem
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-[#0b0e17] p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Banco de Dados</span>
              <Database className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <p className="text-sm font-bold text-white mt-1">PostgreSQL Relacional</p>
            <p className="text-[11px] text-emerald-400 mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Cloud SQL (us-west2)
            </p>
          </div>

          <div className="bg-[#0b0e17] p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Autenticação</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-sm font-bold text-white mt-1">Firebase Auth</p>
            <p className="text-[11px] text-emerald-400 mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              JWT + Bearer Tokens
            </p>
          </div>

          <div className="bg-[#0b0e17] p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Segurança de Dados</span>
              <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <p className="text-sm font-bold text-white mt-1">Row Level Isolation</p>
            <p className="text-[11px] text-emerald-400 mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Isolamento por User ID
            </p>
          </div>

          <div className="bg-[#0b0e17] p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Persistência</span>
              <Clock className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <p className="text-sm font-bold text-white mt-1">100% Permanente</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Não se perde com logout
            </p>
          </div>
        </div>
      </div>

      {/* Backup and Export Controls (PRD Section 31) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-[#0f1422] border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FileCode className="w-5 h-5 text-blue-400" />
              <h4 className="text-base font-bold text-white">Backup Completo (JSON)</h4>
            </div>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Exporta um arquivo estruturado contendo todos os usuários, empresas, contas bancárias, categorias, lançamentos, pagamentos, recebimentos e contatos.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportJSON}
            disabled={isExporting}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Processando backup...' : 'Baixar Arquivo JSON'}</span>
          </button>
        </div>

        <div className="bg-[#0f1422] border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              <h4 className="text-base font-bold text-white">Dump SQL PostgreSQL</h4>
            </div>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Exporta comandos SQL completos (`INSERT INTO`) compatíveis com qualquer instância do PostgreSQL para migração ou auditoria externa independente.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportSQL}
            disabled={isExporting}
            className="w-full bg-[#141b2c] hover:bg-[#1a233a] border border-slate-700/80 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>{isExporting ? 'Gerando dump...' : 'Baixar Script SQL'}</span>
          </button>
        </div>
      </div>

      {/* DRE Simplificada (Demonstrativo Financeiro do Ano) */}
      {summary && (
        <div className="bg-[#0f1422] border border-slate-800/80 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Demonstrativo de Resultado (DRE Simplificado - 2026)
            </h4>
            <span className="text-xs text-blue-400 font-mono">Consolidado Anual</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0b0e17] border border-slate-800">
              <span className="font-semibold text-slate-200">(+) Receita Bruta Total</span>
              <span className="font-bold text-emerald-400 font-mono text-sm">
                {formatCurrency(summary.monthlyTrends.reduce((acc, m) => acc + m.income, 0))}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0b0e17] border border-slate-800">
              <span className="font-semibold text-slate-200">(-) Despesas e Custos Operacionais</span>
              <span className="font-bold text-rose-400 font-mono text-sm">
                {formatCurrency(summary.monthlyTrends.reduce((acc, m) => acc + m.expense, 0))}
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/50">
              <span className="font-bold text-white text-sm">(=) Resultado Líquido Operacional</span>
              <span className="font-bold text-blue-300 font-mono text-base">
                {formatCurrency(
                  summary.monthlyTrends.reduce((acc, m) => acc + m.income, 0) -
                    summary.monthlyTrends.reduce((acc, m) => acc + m.expense, 0)
                )}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
