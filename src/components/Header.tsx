import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import type { Company } from '../types/finance.ts';
import {
  ChevronDown,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Building2,
  Bell,
  LogOut,
  User,
  Check,
} from 'lucide-react';

interface HeaderProps {
  companies: Company[];
  selectedCompanyId: string;
  onSelectCompany: (id: string) => void;
  onOpenTransactionModal: (type: 'income' | 'expense') => void;
  onOpenCompanyModal: () => void;
  alertsCount: number;
  onOpenAlerts: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  companies,
  selectedCompanyId,
  onSelectCompany,
  onOpenTransactionModal,
  onOpenCompanyModal,
  alertsCount,
  onOpenAlerts,
}) => {
  const { profile, logout } = useAuth();
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);
  const displayName = selectedCompany ? selectedCompany.name : 'Todas as empresas';

  return (
    <header className="sticky top-0 z-30 bg-[#0a0e17]/90 backdrop-blur-md border-b border-slate-800/70 px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
      {/* Greeting and Company Filter */}
      <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Olá, {profile?.name?.split(' ')[0] || 'Silas'}
            </h1>
            <span className="text-base">👋</span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            Aqui está o resumo das suas finanças.
          </p>
        </div>

        {/* Company Dropdown (PRD Section 5) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
            className="flex items-center gap-2 bg-[#131926] hover:bg-[#1a2233] border border-slate-700/70 hover:border-slate-600 text-slate-200 text-xs sm:text-sm font-medium py-2 px-3 sm:px-3.5 rounded-xl transition-all cursor-pointer shadow-sm"
          >
            <Building2 className="w-4 h-4 text-blue-400" />
            <span className="font-semibold text-white">{displayName}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isCompanyDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isCompanyDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsCompanyDropdownOpen(false)}
              />
              <div className="absolute left-0 mt-2 w-56 bg-[#121826] border border-slate-800 rounded-xl shadow-2xl py-1.5 z-20 overflow-hidden backdrop-blur-xl">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800/80">
                  Filtrar por Empresa
                </div>

                {/* Option: All */}
                <button
                  type="button"
                  onClick={() => {
                    onSelectCompany('all');
                    setIsCompanyDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-800/60 transition-colors cursor-pointer ${
                    selectedCompanyId === 'all' ? 'text-blue-400 font-semibold bg-blue-950/20' : 'text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Todas (Consolidado)
                  </span>
                  {selectedCompanyId === 'all' && <Check className="w-3.5 h-3.5 text-blue-400" />}
                </button>

                {/* Companies list */}
                {companies.map((comp) => (
                  <button
                    key={comp.id}
                    type="button"
                    onClick={() => {
                      onSelectCompany(comp.id);
                      setIsCompanyDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-800/60 transition-colors cursor-pointer ${
                      selectedCompanyId === comp.id ? 'text-blue-400 font-semibold bg-blue-950/20' : 'text-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-slate-500" />
                      {comp.name}
                    </span>
                    {selectedCompanyId === comp.id && <Check className="w-3.5 h-3.5 text-blue-400" />}
                  </button>
                ))}

                {/* Add new company action */}
                <div className="pt-1.5 mt-1 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCompanyDropdownOpen(false);
                      onOpenCompanyModal();
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-950/30 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    + Nova Empresa
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons & Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3 ml-auto">
        {/* Alerts Pill */}
        <button
          type="button"
          onClick={onOpenAlerts}
          className="relative p-2 rounded-xl bg-[#131926] hover:bg-[#1a2233] border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="Ver alertas do dia"
        >
          <Bell className="w-4 h-4" />
          {alertsCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-md">
              {alertsCount}
            </span>
          )}
        </button>

        {/* Quick Action: Nova Entrada */}
        <button
          type="button"
          onClick={() => onOpenTransactionModal('income')}
          className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-semibold py-2 px-3 sm:px-3.5 rounded-xl transition-all shadow-md shadow-emerald-950/40 flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowDownLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Nova Entrada</span>
          <span className="sm:hidden">+ Entrada</span>
        </button>

        {/* Quick Action: Nova Saída */}
        <button
          type="button"
          onClick={() => onOpenTransactionModal('expense')}
          className="bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white text-xs font-semibold py-2 px-3 sm:px-3.5 rounded-xl transition-all shadow-md shadow-rose-950/40 flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Nova Saída</span>
          <span className="sm:hidden">+ Saída</span>
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl bg-[#131926] hover:bg-[#1a2233] border border-slate-800 text-slate-200 transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
              {profile?.name ? profile.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isProfileOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
              <div className="absolute right-0 mt-2 w-52 bg-[#121826] border border-slate-800 rounded-xl shadow-2xl py-2 z-20 backdrop-blur-xl">
                <div className="px-3.5 py-2 border-b border-slate-800/80">
                  <p className="text-xs font-semibold text-white truncate">{profile?.name || 'Silas Vinícius'}</p>
                  <p className="text-[11px] text-slate-400 truncate">{profile?.email || 'silasvinicius.dev@gmail.com'}</p>
                </div>

                <div className="py-1">
                  <div className="px-3.5 py-1.5 text-[11px] text-emerald-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    PostgreSQL Conectado
                  </div>
                </div>

                <div className="border-t border-slate-800/80 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sair do sistema
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
