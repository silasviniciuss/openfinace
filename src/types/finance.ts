export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface Company {
  id: string;
  userId: string;
  name: string;
  cnpj?: string;
  description?: string;
  logo?: string;
  status: 'active' | 'inactive';
  createdAt?: string;
}

export interface Account {
  id: string;
  userId: string;
  companyId?: string | null;
  name: string;
  bank?: string;
  type: string;
  initialBalance: number;
  currentBalance: number;
  color?: string;
}

export interface Category {
  id: string;
  userId: string;
  companyId?: string | null;
  name: string;
  type: 'income' | 'expense';
  color?: string;
  icon?: string;
}

export interface Contact {
  id: string;
  userId: string;
  companyId?: string | null;
  name: string;
  type: 'client' | 'supplier';
  document?: string;
  email?: string;
  phone?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  companyId?: string | null;
  accountId?: string | null;
  categoryId?: string | null;
  type: 'income' | 'expense' | 'transfer';
  description: string;
  amount: number;
  transactionDate: string;
  dueDate: string;
  status: 'pending' | 'paid' | 'received' | 'cancelled' | 'overdue' | 'partial';
  clientId?: string | null;
  clientName?: string | null;
  supplierId?: string | null;
  supplierName?: string | null;
  paymentMethod?: string;
  notes?: string;
  installmentNumber?: number;
  totalInstallments?: number;
  createdAt?: string;
}

export interface Installment {
  id: string;
  transactionId: string;
  installmentNumber: number;
  totalInstallments: number;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  paidAt?: string | null;
}

export interface TodaySummary {
  date: string;
  paymentsCount: number;
  paymentsTotal: number;
  receiptsCount: number;
  receiptsTotal: number;
  result: number;
}

export interface DashboardSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyResult: number;
  todaySummary: TodaySummary;
  todayPayments: Transaction[];
  todayReceipts: Transaction[];
  alerts: {
    overdueCount: number;
    overdueAmount: number;
    todayCount: number;
    tomorrowCount: number;
    next7DaysCount: number;
  };
  monthlyTrends: Array<{
    month: string;
    income: number;
    expense: number;
    result: number;
  }>;
  categoriesBreakdown: Array<{
    name: string;
    amount: number;
    color: string;
  }>;
  comparativeMonths: Array<{
    month: string;
    monthNum: string;
    income: number;
    expense: number;
  }>;
  recentTransactions: Transaction[];
}
