import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { LoginScreen } from './components/LoginScreen.tsx';
import { Sidebar, type TabType } from './components/Sidebar.tsx';
import { Header } from './components/Header.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { PaymentsView } from './components/PaymentsView.tsx';
import { ReceiptsView } from './components/ReceiptsView.tsx';
import { TransactionsView } from './components/TransactionsView.tsx';
import { CompaniesView } from './components/CompaniesView.tsx';
import { AccountsView } from './components/AccountsView.tsx';
import { CategoriesView } from './components/CategoriesView.tsx';
import { ContactsView } from './components/ContactsView.tsx';
import { ReportsBackupView } from './components/ReportsBackupView.tsx';
import { TransactionModal } from './components/TransactionModal.tsx';
import { api } from './lib/api.ts';
import type {
  Account,
  Category,
  Company,
  Contact,
  DashboardSummary,
  Transaction,
} from './types/finance.ts';
import { Menu, CheckCircle2, AlertCircle } from 'lucide-react';

const SilasFinanceApp: React.FC = () => {
  const { user, loading, token } = useAuth();

  // Navigation & Filter State
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Financial Data State
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Modals & UI States
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionModalType, setTransactionModalType] = useState<'income' | 'expense'>('income');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load all finance data from PostgreSQL
  const loadFinanceData = useCallback(async () => {
    if (!token) return;
    try {
      const [sumRes, compRes, accRes, catRes, contRes, txRes] = await Promise.all([
        api.getSummary(token, selectedCompanyId, selectedYear),
        api.getCompanies(token),
        api.getAccounts(token, selectedCompanyId),
        api.getCategories(token),
        api.getContacts(token),
        api.getTransactions(token, { companyId: selectedCompanyId }),
      ]);

      setSummary(sumRes);
      setCompanies(compRes);
      setAccounts(accRes);
      setCategories(catRes);
      setContacts(contRes);
      setTransactions(txRes);
    } catch (err: any) {
      console.error('Error fetching finance data:', err);
    }
  }, [token, selectedCompanyId, selectedYear]);

  useEffect(() => {
    if (user && token) {
      loadFinanceData();
    }
  }, [user, token, loadFinanceData]);

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#070a10] flex flex-col items-center justify-center text-slate-300">
        <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wide text-slate-200">SILAS FINANCE</p>
        <p className="text-xs text-slate-500 mt-1">Carregando painel seguro...</p>
      </div>
    );
  }

  // Not logged in -> Show Login Screen (PRD Section 4)
  if (!user) {
    return <LoginScreen />;
  }

  // Actions
  const handleOpenTransactionModal = (type: 'income' | 'expense' = 'income') => {
    setTransactionModalType(type);
    setIsTransactionModalOpen(true);
  };

  const handleCreateTransaction = async (data: Partial<Transaction>) => {
    try {
      await api.createTransaction(token, data);
      showToast('Lançamento registrado com sucesso no PostgreSQL!');
      await loadFinanceData();
    } catch (err: any) {
      showToast(err.message || 'Erro ao registrar lançamento', 'error');
    }
  };

  const handleConfirmPayment = async (txId: string, accountId?: string) => {
    try {
      await api.confirmPayment(token, txId, accountId);
      showToast('Pagamento confirmado e liquidado!');
      await loadFinanceData();
    } catch (err: any) {
      showToast(err.message || 'Erro ao confirmar pagamento', 'error');
    }
  };

  const handleConfirmReceipt = async (txId: string, accountId?: string) => {
    try {
      await api.confirmReceipt(token, txId, accountId);
      showToast('Recebimento confirmado e adicionado ao saldo!');
      await loadFinanceData();
    } catch (err: any) {
      showToast(err.message || 'Erro ao confirmar recebimento', 'error');
    }
  };

  const handleDeleteTransaction = async (txId: string) => {
    if (!confirm('Deseja realmente excluir este lançamento?')) return;
    try {
      await api.deleteTransaction(token, txId);
      showToast('Lançamento excluído com sucesso.');
      await loadFinanceData();
    } catch (err: any) {
      showToast('Erro ao excluir lançamento', 'error');
    }
  };

  const handleCreateCompany = async (companyData: Partial<Company>) => {
    try {
      await api.createCompany(token, companyData);
      showToast('Empresa cadastrada com sucesso!');
      await loadFinanceData();
    } catch (err: any) {
      showToast('Erro ao cadastrar empresa', 'error');
    }
  };

  const handleCreateAccount = async (accountData: Partial<Account>) => {
    try {
      await api.createAccount(token, accountData);
      showToast('Conta bancária cadastrada com sucesso!');
      await loadFinanceData();
    } catch (err: any) {
      showToast('Erro ao cadastrar conta', 'error');
    }
  };

  const handleCreateCategory = async (catData: Partial<Category>) => {
    try {
      await api.createCategory(token, catData);
      showToast('Categoria adicionada com sucesso!');
      await loadFinanceData();
    } catch (err: any) {
      showToast('Erro ao criar categoria', 'error');
    }
  };

  const handleCreateContact = async (contData: Partial<Contact>) => {
    try {
      await api.createContact(token, contData);
      showToast('Contato salvo com sucesso!');
      await loadFinanceData();
    } catch (err: any) {
      showToast('Erro ao cadastrar contato', 'error');
    }
  };

  const handleDownloadBackup = async () => {
    return api.getBackup(token);
  };

  const todayPaymentsCount = summary?.todaySummary.paymentsCount || 0;
  const todayReceiptsCount = summary?.todaySummary.receiptsCount || 0;
  const totalAlertsCount =
    (summary?.alerts.overdueCount || 0) +
    (summary?.alerts.todayCount || 0) +
    (summary?.alerts.tomorrowCount || 0);

  return (
    <div className="min-h-screen bg-[#070a10] text-slate-100 flex selection:bg-blue-500 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        todayPaymentsCount={todayPaymentsCount}
        todayReceiptsCount={todayReceiptsCount}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Mobile top bar toggle */}
        <div className="lg:hidden flex items-center justify-between p-3.5 bg-[#0a0e17] border-b border-slate-800">
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 text-slate-300 hover:text-white rounded-lg bg-slate-900 border border-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-sm tracking-wide text-white">SILAS FINANCE</span>
          <div className="w-9" />
        </div>

        {/* Global Header (Company switcher + quick action buttons) */}
        <Header
          companies={companies}
          selectedCompanyId={selectedCompanyId}
          onSelectCompany={(id) => setSelectedCompanyId(id)}
          onOpenTransactionModal={handleOpenTransactionModal}
          onOpenCompanyModal={() => setCurrentTab('companies')}
          alertsCount={totalAlertsCount}
          onOpenAlerts={() => setCurrentTab('payments')}
        />

        {/* Dynamic Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              summary={summary}
              selectedYear={selectedYear}
              onChangeYear={(y) => setSelectedYear(y)}
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onConfirmPayment={handleConfirmPayment}
              onConfirmReceipt={handleConfirmReceipt}
            />
          )}

          {currentTab === 'payments' && (
            <PaymentsView
              transactions={transactions}
              companies={companies}
              accounts={accounts}
              onConfirmPayment={handleConfirmPayment}
              onDeleteTransaction={handleDeleteTransaction}
              onOpenNewPayment={() => handleOpenTransactionModal('expense')}
            />
          )}

          {currentTab === 'receipts' && (
            <ReceiptsView
              transactions={transactions}
              companies={companies}
              accounts={accounts}
              onConfirmReceipt={handleConfirmReceipt}
              onDeleteTransaction={handleDeleteTransaction}
              onOpenNewReceipt={() => handleOpenTransactionModal('income')}
            />
          )}

          {currentTab === 'transactions' && (
            <TransactionsView
              transactions={transactions}
              companies={companies}
              accounts={accounts}
              categories={categories}
              onOpenModal={handleOpenTransactionModal}
              onDeleteTransaction={handleDeleteTransaction}
            />
          )}

          {currentTab === 'companies' && (
            <CompaniesView
              companies={companies}
              accounts={accounts}
              transactions={transactions}
              onCreateCompany={handleCreateCompany}
              onSelectCompany={(comp) => {
                setSelectedCompanyId(comp);
                setCurrentTab('dashboard');
              }}
            />
          )}

          {currentTab === 'accounts' && (
            <AccountsView
              accounts={accounts}
              companies={companies}
              onCreateAccount={handleCreateAccount}
            />
          )}

          {currentTab === 'categories' && (
            <CategoriesView
              categories={categories}
              onCreateCategory={handleCreateCategory}
            />
          )}

          {currentTab === 'contacts' && (
            <ContactsView
              contacts={contacts}
              companies={companies}
              onCreateContact={handleCreateContact}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsBackupView
              summary={summary}
              onDownloadBackup={handleDownloadBackup}
            />
          )}
        </main>
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        initialType={transactionModalType}
        companies={companies}
        accounts={accounts}
        categories={categories}
        contacts={contacts}
        onSubmit={handleCreateTransaction}
      />

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-2xl text-xs font-semibold backdrop-blur-md transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-700/80 text-emerald-200'
              : 'bg-rose-950/90 border-rose-700/80 text-rose-200'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SilasFinanceApp />
    </AuthProvider>
  );
}
