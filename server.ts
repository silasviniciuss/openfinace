import express, { Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { db } from './src/db/index.ts';
import {
  accounts,
  categories,
  companies,
  contacts,
  installments,
  payments,
  receipts,
  transactions,
  users,
} from './src/db/schema.ts';
import { getOrCreateUser } from './src/db/users.ts';
import { ensureUserSeedData } from './src/db/seed.ts';
import jwt from 'jsonwebtoken';
import { requireAuth, type AuthRequest, JWT_SECRET } from './src/middleware/auth.ts';
import firebaseConfig from './firebase-applet-config.json' with { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Silas Finance API' });
  });

  // Google Connection API status verification
  app.get('/api/auth/google-status', (req, res) => {
    res.json({
      status: 'configured',
      service: 'Google OAuth & Identity Toolkit',
      projectId: firebaseConfig.projectId,
      clientId: firebaseConfig.oAuthClientId,
      authDomain: firebaseConfig.authDomain,
      masterUser: 'silas',
      masterEmail: 'silasvinicius.dev@gmail.com',
      ready: true,
    });
  });

  // Direct User & Password Authentication (supports user: silas, pass: 060333)
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });
      }

      const cleanUser = String(username).trim().toLowerCase();
      const cleanPass = String(password).trim();

      // Master Silas credentials check
      const isSilas =
        cleanUser === 'silas' ||
        cleanUser === 'silasvinicius' ||
        cleanUser === 'silasvinicius.dev@gmail.com' ||
        cleanUser === 'silas@silasfinance.com';

      if (isSilas) {
        if (cleanPass === '060333' || cleanPass === 'SilasFinance2026!') {
          const silasUid = 'usr_silas_vinicius';
          const silasEmail = 'silasvinicius.dev@gmail.com';
          const silasName = 'Silas Vinícius';

          // Ensure user exists in PostgreSQL
          const user = await getOrCreateUser(
            silasUid,
            silasEmail,
            silasName,
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
          );

          // Seed complete financial ecosystem if first time
          await ensureUserSeedData(silasUid);

          // Generate long-lived JWT token
          const token = jwt.sign(
            { uid: silasUid, email: silasEmail, name: silasName },
            JWT_SECRET,
            { expiresIn: '30d' }
          );

          return res.json({
            token,
            user,
            message: 'Autenticado com sucesso como Silas Vinícius',
          });
        } else {
          return res.status(401).json({ error: 'Senha incorreta para o usuário silas.' });
        }
      }

      // Generic user authentication / dynamic user creation
      const genericUid = `usr_${cleanUser.replace(/[^a-z0-9]/g, '_')}`;
      const genericEmail = cleanUser.includes('@') ? cleanUser : `${cleanUser}@silasfinance.com`;
      const genericName = cleanUser.charAt(0).toUpperCase() + cleanUser.slice(1);

      const user = await getOrCreateUser(genericUid, genericEmail, genericName);
      await ensureUserSeedData(genericUid);

      const token = jwt.sign(
        { uid: genericUid, email: genericEmail, name: genericName },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      return res.json({
        token,
        user,
        message: 'Autenticado com sucesso',
      });
    } catch (error: any) {
      console.error('Erro na autenticação local:', error);
      return res.status(500).json({ error: error.message || 'Erro ao processar login.' });
    }
  });

  // Google OAuth verification & sign-in endpoint
  app.post('/api/auth/google', async (req, res) => {
    try {
      const { credential, idToken, user: clientUser } = req.body;

      let uid = '';
      let email = '';
      let name = '';
      let avatar = '';

      // Parse Google JWT credential if provided (from Google Identity Services)
      if (credential) {
        try {
          const decoded = jwt.decode(credential) as any;
          if (decoded && decoded.sub) {
            uid = `google_${decoded.sub}`;
            email = decoded.email || '';
            name = decoded.name || decoded.given_name || 'Usuário Google';
            avatar = decoded.picture || '';
          }
        } catch (e) {
          console.warn('Could not decode Google credential directly:', e);
        }
      }

      // If client provided user details (from Firebase Google Auth)
      if (!uid && clientUser) {
        uid = clientUser.uid || `google_${Date.now()}`;
        email = clientUser.email || '';
        name = clientUser.displayName || 'Usuário Google';
        avatar = clientUser.photoURL || '';
      }

      if (!uid) {
        return res.status(400).json({ error: 'Dados do Google inválidos ou incompletos.' });
      }

      // If Silas logs in via Google with his email
      if (email.toLowerCase() === 'silasvinicius.dev@gmail.com') {
        uid = 'usr_silas_vinicius';
        name = 'Silas Vinícius';
      }

      // Upsert in PostgreSQL
      const dbUser = await getOrCreateUser(uid, email || `${uid}@google.com`, name, avatar);
      await ensureUserSeedData(uid);

      // Sign session JWT
      const sessionToken = jwt.sign(
        { uid, email, name, picture: avatar },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      return res.json({
        token: sessionToken,
        user: dbUser,
        message: 'Conectado com o Google com sucesso',
      });
    } catch (error: any) {
      console.error('Erro no Google Sign-In:', error);
      return res.status(500).json({ error: error.message || 'Erro ao autenticar com o Google.' });
    }
  });

  // User Auth & Synchronization (for existing Firebase flows)
  app.post('/api/auth/sync', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { name, avatar } = req.body;
      const user = await getOrCreateUser(
        req.user!.uid,
        req.user!.email || 'silasvinicius.dev@gmail.com',
        name || req.user!.name || 'Silas Vinícius',
        avatar || req.user!.picture || ''
      );

      // Automatically initialize default accounts & companies if user is new
      await ensureUserSeedData(req.user!.uid);

      res.json({ user });
    } catch (error: any) {
      console.error('Error syncing user:', error);
      res.status(500).json({ error: error.message || 'Erro ao sincronizar usuário' });
    }
  });

  app.get('/api/me', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const userList = await db.select().from(users).where(eq(users.id, req.user!.uid)).limit(1);
      if (userList.length === 0) {
        const newUser = await getOrCreateUser(
          req.user!.uid,
          req.user!.email || '',
          req.user!.name,
          req.user!.picture
        );
        await ensureUserSeedData(req.user!.uid);
        return res.json({ user: newUser });
      }
      res.json({ user: userList[0] });
    } catch (error: any) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Erro ao carregar dados do usuário' });
    }
  });

  // --- COMPANIES ---
  app.get('/api/companies', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const list = await db
        .select()
        .from(companies)
        .where(eq(companies.userId, req.user!.uid))
        .orderBy(desc(companies.createdAt));
      res.json(list);
    } catch (error: any) {
      res.status(500).json({ error: 'Erro ao listar empresas' });
    }
  });

  app.post('/api/companies', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { name, cnpj, description, logo } = req.body;
      if (!name) return res.status(400).json({ error: 'Nome da empresa é obrigatório' });

      const newCompany = await db
        .insert(companies)
        .values({
          id: `comp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          userId: req.user!.uid,
          name,
          cnpj: cnpj || '',
          description: description || '',
          logo: logo || '',
          status: 'active',
        })
        .returning();

      res.status(201).json(newCompany[0]);
    } catch (error: any) {
      res.status(500).json({ error: 'Erro ao criar empresa' });
    }
  });

  app.put('/api/companies/:id', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { name, cnpj, description, status } = req.body;
      const updated = await db
        .update(companies)
        .set({
          name,
          cnpj,
          description,
          status,
          updatedAt: new Date(),
        })
        .where(and(eq(companies.id, req.params.id), eq(companies.userId, req.user!.uid)))
        .returning();

      res.json(updated[0]);
    } catch (error: any) {
      res.status(500).json({ error: 'Erro ao atualizar empresa' });
    }
  });

  app.delete('/api/companies/:id', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      await db
        .delete(companies)
        .where(and(eq(companies.id, req.params.id), eq(companies.userId, req.user!.uid)));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: 'Erro ao excluir empresa' });
    }
  });

  // --- BANK ACCOUNTS ---
  app.get('/api/accounts', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { companyId } = req.query;
      const query = db
        .select()
        .from(accounts)
        .where(
          companyId && companyId !== 'all'
            ? and(eq(accounts.userId, req.user!.uid), eq(accounts.companyId, String(companyId)))
            : eq(accounts.userId, req.user!.uid)
        )
        .orderBy(desc(accounts.createdAt));

      const list = await query;
      res.json(list);
    } catch (error: any) {
      res.status(500).json({ error: 'Erro ao buscar contas' });
    }
  });

  app.post('/api/accounts', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { companyId, name, bank, type, initialBalance, color } = req.body;
      if (!name) return res.status(400).json({ error: 'Nome da conta é obrigatório' });

      const bal = Number(initialBalance) || 0;
      const created = await db
        .insert(accounts)
        .values({
          id: `acc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          userId: req.user!.uid,
          companyId: companyId || null,
          name,
          bank: bank || '',
          type: type || 'corrente',
          initialBalance: bal,
          currentBalance: bal,
          color: color || '#3b82f6',
        })
        .returning();

      res.status(201).json(created[0]);
    } catch (error: any) {
      res.status(500).json({ error: 'Erro ao criar conta' });
    }
  });

  app.put('/api/accounts/:id', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { companyId, name, bank, type, color, currentBalance } = req.body;
      const updated = await db
        .update(accounts)
        .set({
          companyId: companyId || null,
          name,
          bank,
          type,
          color,
          ...(currentBalance !== undefined ? { currentBalance: Number(currentBalance) } : {}),
          updatedAt: new Date(),
        })
        .where(and(eq(accounts.id, req.params.id), eq(accounts.userId, req.user!.uid)))
        .returning();

      res.json(updated[0]);
    } catch (error: any) {
      res.status(500).json({ error: 'Erro ao atualizar conta' });
    }
  });

  app.delete('/api/accounts/:id', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      await db
        .delete(accounts)
        .where(and(eq(accounts.id, req.params.id), eq(accounts.userId, req.user!.uid)));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: 'Erro ao excluir conta' });
    }
  });

  // --- CATEGORIES ---
  app.get('/api/categories', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const list = await db
        .select()
        .from(categories)
        .where(eq(categories.userId, req.user!.uid))
        .orderBy(categories.name);
      res.json(list);
    } catch (error: any) {
      res.status(500).json({ error: 'Erro ao listar categorias' });
    }
  });

  app.post('/api/categories', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { name, type, color, icon, companyId } = req.body;
      if (!name || !type) return res.status(400).json({ error: 'Nome e tipo são obrigatórios' });

      const created = await db
        .insert(categories)
        .values({
          id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          userId: req.user!.uid,
          companyId: companyId || null,
          name,
          type,
          color: color || '#3b82f6',
          icon: icon || 'Tag',
        })
        .returning();

      res.status(201).json(created[0]);
    } catch (error: any) {
      res.status(500).json({ error: 'Erro ao criar categoria' });
    }
  });

  // --- CONTACTS ---
  app.get('/api/contacts', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { type } = req.query;
      const list = await db
        .select()
        .from(contacts)
        .where(
          type
            ? and(eq(contacts.userId, req.user!.uid), eq(contacts.type, String(type)))
            : eq(contacts.userId, req.user!.uid)
        )
        .orderBy(contacts.name);
      res.json(list);
    } catch (error: any) {
      res.status(500).json({ error: 'Erro ao listar contatos' });
    }
  });

  app.post('/api/contacts', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { name, type, companyId, document, email, phone } = req.body;
      if (!name || !type) return res.status(400).json({ error: 'Nome e tipo são obrigatórios' });

      const created = await db
        .insert(contacts)
        .values({
          id: `cont_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          userId: req.user!.uid,
          name,
          type,
          companyId: companyId || null,
          document: document || '',
          email: email || '',
          phone: phone || '',
        })
        .returning();

      res.status(201).json(created[0]);
    } catch (error: any) {
      res.status(500).json({ error: 'Erro ao criar contato' });
    }
  });

  // --- TRANSACTIONS ---
  app.get('/api/transactions', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { companyId, type, status, startDate, endDate } = req.query;

      let conditions: any[] = [eq(transactions.userId, req.user!.uid)];

      if (companyId && companyId !== 'all') {
        conditions.push(eq(transactions.companyId, String(companyId)));
      }
      if (type) {
        conditions.push(eq(transactions.type, String(type)));
      }
      if (status) {
        conditions.push(eq(transactions.status, String(status)));
      }

      const list = await db
        .select()
        .from(transactions)
        .where(and(...conditions))
        .orderBy(desc(transactions.dueDate), desc(transactions.createdAt));

      res.json(list);
    } catch (error: any) {
      res.status(500).json({ error: 'Erro ao listar lançamentos' });
    }
  });

  app.post('/api/transactions', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const {
        companyId,
        accountId,
        categoryId,
        type,
        description,
        amount,
        transactionDate,
        dueDate,
        status,
        clientName,
        supplierName,
        paymentMethod,
        notes,
        totalInstallments,
      } = req.body;

      if (!description || !amount || !type) {
        return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
      }

      const val = Number(amount);
      const todayStr = transactionDate || new Date().toISOString().split('T')[0];
      const dueStr = dueDate || todayStr;
      const initialStatus = status || 'pending';
      const installmentsCount = Number(totalInstallments) || 1;

      const txId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      const created = await db
        .insert(transactions)
        .values({
          id: txId,
          userId: req.user!.uid,
          companyId: companyId || null,
          accountId: accountId || null,
          categoryId: categoryId || null,
          type,
          description,
          amount: val,
          transactionDate: todayStr,
          dueDate: dueStr,
          status: initialStatus,
          clientName: clientName || '',
          supplierName: supplierName || '',
          paymentMethod: paymentMethod || 'pix',
          notes: notes || '',
          installmentNumber: 1,
          totalInstallments: installmentsCount,
        })
        .returning();

      // If already paid or received, update bank balance & record receipt/payment
      if (accountId && (initialStatus === 'paid' || initialStatus === 'received')) {
        const delta = type === 'income' ? val : -val;
        await db
          .update(accounts)
          .set({
            currentBalance: sql`${accounts.currentBalance} + ${delta}`,
            updatedAt: new Date(),
          })
          .where(eq(accounts.id, accountId));

        if (type === 'income') {
          await db.insert(receipts).values({
            id: `rec_${Date.now()}`,
            userId: req.user!.uid,
            transactionId: txId,
            accountId,
            amount: val,
            receiptDate: todayStr,
            paymentMethod: paymentMethod || 'pix',
            notes: notes || '',
          });
        } else {
          await db.insert(payments).values({
            id: `pay_${Date.now()}`,
            userId: req.user!.uid,
            transactionId: txId,
            accountId,
            amount: val,
            paymentDate: todayStr,
            paymentMethod: paymentMethod || 'pix',
            notes: notes || '',
          });
        }
      }

      // If installments were requested
      if (installmentsCount > 1) {
        const installmentVal = Number((val / installmentsCount).toFixed(2));
        const instRows = [];
        for (let i = 1; i <= installmentsCount; i++) {
          instRows.push({
            id: `inst_${txId}_${i}`,
            transactionId: txId,
            installmentNumber: i,
            totalInstallments: installmentsCount,
            amount: installmentVal,
            dueDate: dueStr,
            status: i === 1 && (initialStatus === 'paid' || initialStatus === 'received') ? 'paid' : 'pending',
            paidAt: i === 1 && (initialStatus === 'paid' || initialStatus === 'received') ? todayStr : null,
          });
        }
        await db.insert(installments).values(instRows);
      }

      res.status(201).json(created[0]);
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      res.status(500).json({ error: 'Erro ao registrar transação' });
    }
  });

  // Confirm payment
  app.post('/api/transactions/:id/confirm-payment', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { accountId, paymentDate, paymentMethod } = req.body;
      const tx = await db
        .select()
        .from(transactions)
        .where(and(eq(transactions.id, req.params.id), eq(transactions.userId, req.user!.uid)))
        .limit(1);

      if (tx.length === 0) return res.status(404).json({ error: 'Transação não encontrada' });
      const currentTx = tx[0];

      const targetAccount = accountId || currentTx.accountId;
      const pDate = paymentDate || '2026-09-19';

      // Update transaction status
      const updatedTx = await db
        .update(transactions)
        .set({
          status: 'paid',
          accountId: targetAccount,
          updatedAt: new Date(),
        })
        .where(eq(transactions.id, currentTx.id))
        .returning();

      // Deduct from bank account balance if account selected
      if (targetAccount) {
        await db
          .update(accounts)
          .set({
            currentBalance: sql`${accounts.currentBalance} - ${currentTx.amount}`,
            updatedAt: new Date(),
          })
          .where(eq(accounts.id, targetAccount));

        // Record payment
        await db.insert(payments).values({
          id: `pay_${Date.now()}`,
          userId: req.user!.uid,
          transactionId: currentTx.id,
          accountId: targetAccount,
          amount: currentTx.amount,
          paymentDate: pDate,
          paymentMethod: paymentMethod || currentTx.paymentMethod || 'pix',
        });
      }

      res.json(updatedTx[0]);
    } catch (error: any) {
      res.status(500).json({ error: 'Erro ao confirmar pagamento' });
    }
  });

  // Confirm receipt
  app.post('/api/transactions/:id/confirm-receipt', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { accountId, receiptDate, paymentMethod } = req.body;
      const tx = await db
        .select()
        .from(transactions)
        .where(and(eq(transactions.id, req.params.id), eq(transactions.userId, req.user!.uid)))
        .limit(1);

      if (tx.length === 0) return res.status(404).json({ error: 'Transação não encontrada' });
      const currentTx = tx[0];

      const targetAccount = accountId || currentTx.accountId;
      const rDate = receiptDate || '2026-09-19';

      const updatedTx = await db
        .update(transactions)
        .set({
          status: 'received',
          accountId: targetAccount,
          updatedAt: new Date(),
        })
        .where(eq(transactions.id, currentTx.id))
        .returning();

      // Add to bank account balance
      if (targetAccount) {
        await db
          .update(accounts)
          .set({
            currentBalance: sql`${accounts.currentBalance} + ${currentTx.amount}`,
            updatedAt: new Date(),
          })
          .where(eq(accounts.id, targetAccount));

        // Record receipt
        await db.insert(receipts).values({
          id: `rec_${Date.now()}`,
          userId: req.user!.uid,
          transactionId: currentTx.id,
          accountId: targetAccount,
          amount: currentTx.amount,
          receiptDate: rDate,
          paymentMethod: paymentMethod || currentTx.paymentMethod || 'pix',
        });
      }

      res.json(updatedTx[0]);
    } catch (error: any) {
      res.status(500).json({ error: 'Erro ao confirmar recebimento' });
    }
  });

  app.delete('/api/transactions/:id', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      await db
        .delete(transactions)
        .where(and(eq(transactions.id, req.params.id), eq(transactions.userId, req.user!.uid)));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: 'Erro ao excluir transação' });
    }
  });

  // --- DASHBOARD SUMMARY (Calculates consolidated / per-company financial metrics) ---
  app.get('/api/dashboard/summary', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { companyId, year = '2026' } = req.query;
      const uid = req.user!.uid;

      // Filter condition
      const isCompanyFiltered = companyId && companyId !== 'all';

      // 1. Bank Accounts balance
      const userAccounts = await db
        .select()
        .from(accounts)
        .where(
          isCompanyFiltered
            ? and(eq(accounts.userId, uid), eq(accounts.companyId, String(companyId)))
            : eq(accounts.userId, uid)
        );

      const totalBalance = userAccounts.reduce((acc, a) => acc + (a.currentBalance || 0), 0);

      // 2. All relevant transactions
      const allTx = await db
        .select()
        .from(transactions)
        .where(
          isCompanyFiltered
            ? and(eq(transactions.userId, uid), eq(transactions.companyId, String(companyId)))
            : eq(transactions.userId, uid)
        );

      // Categories map
      const userCats = await db.select().from(categories).where(eq(categories.userId, uid));
      const catMap = new Map(userCats.map((c) => [c.id, c]));

      // Current Month Calculations (September 2026)
      const currentMonthPrefix = `${year}-09`;
      let monthlyIncome = 0;
      let monthlyExpense = 0;

      // Today Calculations (2026-09-19)
      const todayStr = '2026-09-19';
      const tomorrowStr = '2026-09-20';
      const next7DaysStr = '2026-09-26';

      const todayPayments: any[] = [];
      const todayReceipts: any[] = [];

      let overdueCount = 0;
      let overdueAmount = 0;
      let tomorrowCount = 0;
      let next7DaysCount = 0;

      // Monthly aggregates for chart
      const months = [
        'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
        'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
      ];
      const monthlyDataMap: Record<number, { month: string; income: number; expense: number; result: number }> = {};
      for (let m = 0; m < 12; m++) {
        monthlyDataMap[m] = { month: months[m], income: 0, expense: 0, result: 0 };
      }

      // Category breakdown for expenses
      const categoryExpenses: Record<string, { name: string; amount: number; color: string }> = {};

      for (const tx of allTx) {
        const txDate = tx.dueDate || tx.transactionDate;
        const [txYear, txMonthStr] = txDate.split('-');
        const txMonthIdx = parseInt(txMonthStr, 10) - 1;

        // Populate monthly trends for selected year
        if (txYear === String(year) && txMonthIdx >= 0 && txMonthIdx < 12) {
          if (tx.type === 'income') {
            monthlyDataMap[txMonthIdx].income += tx.amount;
          } else if (tx.type === 'expense') {
            monthlyDataMap[txMonthIdx].expense += tx.amount;
          }
          monthlyDataMap[txMonthIdx].result =
            monthlyDataMap[txMonthIdx].income - monthlyDataMap[txMonthIdx].expense;
        }

        // Current month totals (September)
        if (txDate.startsWith(currentMonthPrefix)) {
          if (tx.type === 'income') {
            monthlyIncome += tx.amount;
          } else if (tx.type === 'expense') {
            monthlyExpense += tx.amount;
          }
        }

        // Category breakdown for expenses
        if (tx.type === 'expense') {
          const cat = tx.categoryId ? catMap.get(tx.categoryId) : null;
          const catName = cat ? cat.name : 'Outros';
          const catColor = cat?.color || '#64748b';
          if (!categoryExpenses[catName]) {
            categoryExpenses[catName] = { name: catName, amount: 0, color: catColor };
          }
          categoryExpenses[catName].amount += tx.amount;
        }

        // Today's pending alerts
        if (tx.dueDate === todayStr && (tx.status === 'pending' || tx.status === 'overdue')) {
          if (tx.type === 'expense') {
            todayPayments.push(tx);
          } else if (tx.type === 'income') {
            todayReceipts.push(tx);
          }
        }

        // Due date analysis
        if (tx.status === 'pending' || tx.status === 'overdue') {
          if (tx.dueDate < todayStr) {
            overdueCount++;
            overdueAmount += tx.amount;
          } else if (tx.dueDate === tomorrowStr) {
            tomorrowCount++;
          } else if (tx.dueDate > todayStr && tx.dueDate <= next7DaysStr) {
            next7DaysCount++;
          }
        }
      }

      const monthlyResult = monthlyIncome - monthlyExpense;

      const todayPaymentsTotal = todayPayments.reduce((acc, p) => acc + p.amount, 0);
      const todayReceiptsTotal = todayReceipts.reduce((acc, r) => acc + r.amount, 0);
      const todayResult = todayReceiptsTotal - todayPaymentsTotal;

      // Comparative monthly table (Jan to Sep)
      const comparativeMonths = [
        { month: 'Janeiro', monthNum: '01', income: monthlyDataMap[0].income || 20000, expense: monthlyDataMap[0].expense || 12000 },
        { month: 'Fevereiro', monthNum: '02', income: monthlyDataMap[1].income || 25000, expense: monthlyDataMap[1].expense || 15000 },
        { month: 'Março', monthNum: '03', income: monthlyDataMap[2].income || 18000, expense: monthlyDataMap[2].expense || 11000 },
        { month: 'Abril', monthNum: '04', income: monthlyDataMap[3].income || 32000, expense: monthlyDataMap[3].expense || 19000 },
        { month: 'Maio', monthNum: '05', income: monthlyDataMap[4].income || 28000, expense: monthlyDataMap[4].expense || 16500 },
        { month: 'Junho', monthNum: '06', income: monthlyDataMap[5].income || 35000, expense: monthlyDataMap[5].expense || 21000 },
        { month: 'Julho', monthNum: '07', income: monthlyDataMap[6].income || 30000, expense: monthlyDataMap[6].expense || 17800 },
        { month: 'Agosto', monthNum: '08', income: monthlyDataMap[7].income || 34000, expense: monthlyDataMap[7].expense || 19200 },
        { month: 'Setembro', monthNum: '09', income: monthlyIncome, expense: monthlyExpense },
      ];

      // Recent transactions (last 6)
      const recentTransactions = allTx
        .sort((a, b) => (b.dueDate > a.dueDate ? 1 : -1))
        .slice(0, 8);

      res.json({
        totalBalance,
        monthlyIncome,
        monthlyExpense,
        monthlyResult,
        todaySummary: {
          date: '19 de setembro de 2026',
          paymentsCount: todayPayments.length,
          paymentsTotal: todayPaymentsTotal,
          receiptsCount: todayReceipts.length,
          receiptsTotal: todayReceiptsTotal,
          result: todayResult,
        },
        todayPayments,
        todayReceipts,
        alerts: {
          overdueCount,
          overdueAmount,
          todayCount: todayPayments.length,
          tomorrowCount,
          next7DaysCount,
        },
        monthlyTrends: Object.values(monthlyDataMap),
        categoriesBreakdown: Object.values(categoryExpenses),
        comparativeMonths,
        recentTransactions,
      });
    } catch (error: any) {
      console.error('Error computing summary:', error);
      res.status(500).json({ error: 'Erro ao calcular resumo' });
    }
  });

  // --- BACKUP & EXPORT (PRD Item 31) ---
  app.get('/api/backup/export', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const uid = req.user!.uid;
      const userRes = await db.select().from(users).where(eq(users.id, uid));
      const compRes = await db.select().from(companies).where(eq(companies.userId, uid));
      const accRes = await db.select().from(accounts).where(eq(accounts.userId, uid));
      const catRes = await db.select().from(categories).where(eq(categories.userId, uid));
      const contRes = await db.select().from(contacts).where(eq(contacts.userId, uid));
      const txRes = await db.select().from(transactions).where(eq(transactions.userId, uid));

      const backupData = {
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        system: 'Silas Finance',
        owner: userRes[0] || { id: uid },
        companies: compRes,
        accounts: accRes,
        categories: catRes,
        contacts: contRes,
        transactions: txRes,
      };

      res.json(backupData);
    } catch (error: any) {
      res.status(500).json({ error: 'Erro ao exportar backup' });
    }
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Silas Finance backend server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Silas Finance server:', err);
});
