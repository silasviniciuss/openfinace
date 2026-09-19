import type {
  Account,
  Category,
  Company,
  Contact,
  DashboardSummary,
  Transaction,
} from '../types/finance.ts';

export async function fetchApi<T>(
  endpoint: string,
  token: string | null,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Erro na requisição: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  getSummary: (token: string | null, companyId?: string, year?: string) => {
    const query = new URLSearchParams();
    if (companyId && companyId !== 'all') query.set('companyId', companyId);
    if (year) query.set('year', year);
    return fetchApi<DashboardSummary>(`/api/dashboard/summary?${query.toString()}`, token);
  },

  getCompanies: (token: string | null) => {
    return fetchApi<Company[]>('/api/companies', token);
  },

  createCompany: (token: string | null, data: Partial<Company>) => {
    return fetchApi<Company>('/api/companies', token, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getAccounts: (token: string | null, companyId?: string) => {
    const query = new URLSearchParams();
    if (companyId && companyId !== 'all') query.set('companyId', companyId);
    return fetchApi<Account[]>(`/api/accounts?${query.toString()}`, token);
  },

  createAccount: (token: string | null, data: Partial<Account>) => {
    return fetchApi<Account>('/api/accounts', token, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getCategories: (token: string | null) => {
    return fetchApi<Category[]>('/api/categories', token);
  },

  createCategory: (token: string | null, data: Partial<Category>) => {
    return fetchApi<Category>('/api/categories', token, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getContacts: (token: string | null, type?: string) => {
    const query = new URLSearchParams();
    if (type) query.set('type', type);
    return fetchApi<Contact[]>(`/api/contacts?${query.toString()}`, token);
  },

  createContact: (token: string | null, data: Partial<Contact>) => {
    return fetchApi<Contact>('/api/contacts', token, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getTransactions: (token: string | null, params?: { companyId?: string; type?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.companyId && params.companyId !== 'all') query.set('companyId', params.companyId);
    if (params?.type) query.set('type', params.type);
    if (params?.status) query.set('status', params.status);
    return fetchApi<Transaction[]>(`/api/transactions?${query.toString()}`, token);
  },

  createTransaction: (token: string | null, data: Partial<Transaction>) => {
    return fetchApi<Transaction>('/api/transactions', token, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  confirmPayment: (token: string | null, id: string, accountId?: string) => {
    return fetchApi<Transaction>(`/api/transactions/${id}/confirm-payment`, token, {
      method: 'POST',
      body: JSON.stringify({ accountId }),
    });
  },

  confirmReceipt: (token: string | null, id: string, accountId?: string) => {
    return fetchApi<Transaction>(`/api/transactions/${id}/confirm-receipt`, token, {
      method: 'POST',
      body: JSON.stringify({ accountId }),
    });
  },

  deleteTransaction: (token: string | null, id: string) => {
    return fetchApi<{ success: boolean }>(`/api/transactions/${id}`, token, {
      method: 'DELETE',
    });
  },

  getBackup: (token: string | null) => {
    return fetchApi<any>('/api/backup/export', token);
  },
};
