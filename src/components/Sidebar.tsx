import React from 'react';
import {
  LayoutDashboard,
  CreditCard,
  ArrowDownRight,
  ArrowUpRight,
  Receipt,
  Building2,
  Wallet,
  Tags,
  Users,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export type TabType =
  | 'dashboard'
  | 'payments'
  | 'receipts'
  | 'transactions'
  | 'companies'
  | 'accounts'
  | 'categories'
  | 'contacts'
  | 'reports';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  todayPaymentsCount: number;
  todayReceiptsCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  todayPaymentsCount,
  todayReceiptsCount,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { profile, logout } = useAuth();

  const navItems: Array<{
    id: TabType;
    label: string;
    icon: React.ElementType;
    badge?: number;
    badgeColor?: string;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'payments',
      label: 'Pagamentos',
      icon: ArrowUpRight,
      badge: todayPaymentsCount > 0 ? todayPaymentsCount : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
    },
    {
      id: 'receipts',
      label: 'Recebimentos',
      icon: ArrowDownRight,
      badge: todayReceiptsCount > 0 ? todayReceiptsCount : undefined,
      badgeColor: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    },
    { id: 'transactions', label: 'Transações', icon: Receipt },
    { id: 'companies', label: 'Empresas', icon: Building2 },
    { id: 'accounts', label: 'Contas Bancárias', icon: Wallet },
    { id: 'categories', label: 'Categorias', icon: Tags },
    { id: 'contacts', label: 'Clientes & Fornecedores', icon: Users },
    { id: 'reports', label: 'Relatórios & Backup', icon: ShieldCheck },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#080c14] border-r border-slate-800/80 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-800 flex items-center justify-center shadow-lg shadow-blue-600/30 border border-blue-400/20">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-wide text-white">SILAS FINANCE</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Controle Integrado</p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-950/70 border border-blue-800/40 text-blue-400">
            PRO
          </span>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Menu Principal
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-[#111726]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-slate-800/80 bg-[#060910]">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0f1422] border border-slate-800/60">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shrink-0">
                {profile?.name ? profile.name.charAt(0) : 'S'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {profile?.name || 'Silas Vinícius'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {profile?.email || 'silasvinicius.dev@gmail.com'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
