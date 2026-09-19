import { relations } from 'drizzle-orm';
import {
  doublePrecision,
  integer,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

// Users table (keyed by Firebase Auth UID)
export const users = pgTable('users', {
  id: text('id').primaryKey(), // Firebase Auth UID
  name: text('name'),
  email: text('email').notNull(),
  avatar: text('avatar'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Companies table
export const companies = pgTable('companies', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  cnpj: text('cnpj'),
  description: text('description'),
  logo: text('logo'),
  status: text('status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Bank Accounts table
export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  companyId: text('company_id').references(() => companies.id, {
    onDelete: 'set null',
  }),
  name: text('name').notNull(),
  bank: text('bank'),
  type: text('type').default('corrente').notNull(), // 'corrente' | 'poupanca' | 'investimento' | 'carteira'
  initialBalance: doublePrecision('initial_balance').default(0).notNull(),
  currentBalance: doublePrecision('current_balance').default(0).notNull(),
  color: text('color').default('#3b82f6'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Categories table
export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  companyId: text('company_id').references(() => companies.id, {
    onDelete: 'set null',
  }),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'income' | 'expense'
  color: text('color').default('#3b82f6'),
  icon: text('icon').default('Tag'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Transactions table
export const transactions = pgTable('transactions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  companyId: text('company_id').references(() => companies.id, {
    onDelete: 'set null',
  }),
  accountId: text('account_id').references(() => accounts.id, {
    onDelete: 'set null',
  }),
  categoryId: text('category_id').references(() => categories.id, {
    onDelete: 'set null',
  }),
  type: text('type').notNull(), // 'income' | 'expense' | 'transfer'
  description: text('description').notNull(),
  amount: doublePrecision('amount').notNull(),
  transactionDate: text('transaction_date').notNull(), // YYYY-MM-DD
  dueDate: text('due_date').notNull(), // YYYY-MM-DD
  status: text('status').default('pending').notNull(), // 'pending' | 'paid' | 'received' | 'cancelled' | 'overdue' | 'partial'
  clientId: text('client_id'),
  clientName: text('client_name'),
  supplierId: text('supplier_id'),
  supplierName: text('supplier_name'),
  paymentMethod: text('payment_method').default('pix'), // 'pix' | 'boleto' | 'cartao' | 'ted' | 'dinheiro'
  notes: text('notes'),
  installmentNumber: integer('installment_number').default(1),
  totalInstallments: integer('total_installments').default(1),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Payments table
export const payments = pgTable('payments', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  transactionId: text('transaction_id').references(() => transactions.id, {
    onDelete: 'cascade',
  }),
  accountId: text('account_id').references(() => accounts.id, {
    onDelete: 'set null',
  }),
  amount: doublePrecision('amount').notNull(),
  paymentDate: text('payment_date').notNull(),
  paymentMethod: text('payment_method'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Receipts table
export const receipts = pgTable('receipts', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  transactionId: text('transaction_id').references(() => transactions.id, {
    onDelete: 'cascade',
  }),
  accountId: text('account_id').references(() => accounts.id, {
    onDelete: 'set null',
  }),
  amount: doublePrecision('amount').notNull(),
  receiptDate: text('receipt_date').notNull(),
  paymentMethod: text('payment_method'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Installments table
export const installments = pgTable('installments', {
  id: text('id').primaryKey(),
  transactionId: text('transaction_id')
    .references(() => transactions.id, { onDelete: 'cascade' })
    .notNull(),
  installmentNumber: integer('installment_number').notNull(),
  totalInstallments: integer('total_installments').notNull(),
  amount: doublePrecision('amount').notNull(),
  dueDate: text('due_date').notNull(),
  status: text('status').default('pending').notNull(), // 'pending' | 'paid' | 'overdue'
  paidAt: text('paid_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Contacts (Clients & Suppliers) table
export const contacts = pgTable('contacts', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  companyId: text('company_id'),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'client' | 'supplier'
  document: text('document'),
  email: text('email'),
  phone: text('phone'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  companies: many(companies),
  accounts: many(accounts),
  categories: many(categories),
  transactions: many(transactions),
  contacts: many(contacts),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  user: one(users, {
    fields: [companies.userId],
    references: [users.id],
  }),
  accounts: many(accounts),
  transactions: many(transactions),
}));

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
  company: one(companies, {
    fields: [accounts.companyId],
    references: [companies.id],
  }),
  transactions: many(transactions),
  payments: many(payments),
  receipts: many(receipts),
}));

export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  company: one(companies, {
    fields: [transactions.companyId],
    references: [companies.id],
  }),
  account: one(accounts, {
    fields: [transactions.accountId],
    references: [accounts.id],
  }),
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
  payments: many(payments),
  receipts: many(receipts),
  installments: many(installments),
}));
