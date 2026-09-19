import { eq } from 'drizzle-orm';
import { db } from './index.ts';
import {
  accounts,
  categories,
  companies,
  contacts,
  transactions,
} from './schema.ts';

export async function ensureUserSeedData(userId: string) {
  try {
    const existingCompanies = await db
      .select()
      .from(companies)
      .where(eq(companies.userId, userId))
      .limit(1);

    if (existingCompanies.length > 0) {
      return; // Already initialized
    }

    console.log(`Seeding initial financial ecosystem for user ${userId}...`);

    // 1. Companies
    const companyCREATE = {
      id: `comp_create_${Date.now()}`,
      userId,
      name: 'CREATE',
      cnpj: '34.567.890/0001-12',
      description: 'Agência e Desenvolvimento de Software',
      status: 'active',
    };
    const companyOrbitra = {
      id: `comp_orbitra_${Date.now()}`,
      userId,
      name: 'Orbitra',
      cnpj: '45.678.901/0001-23',
      description: 'SaaS e Soluções Tecnológicas',
      status: 'active',
    };
    const companyPessoal = {
      id: `comp_pessoal_${Date.now()}`,
      userId,
      name: 'Pessoal',
      cnpj: '',
      description: 'Finanças Pessoais Silas Vinícius',
      status: 'active',
    };

    await db.insert(companies).values([companyCREATE, companyOrbitra, companyPessoal]);

    // 2. Bank Accounts
    const accNubank = {
      id: `acc_nubank_${Date.now()}`,
      userId,
      companyId: companyCREATE.id,
      name: 'Nubank PJ',
      bank: 'Nubank',
      type: 'corrente',
      initialBalance: 25400,
      currentBalance: 25400,
      color: '#820ad1',
    };
    const accInter = {
      id: `acc_inter_${Date.now()}`,
      userId,
      companyId: companyOrbitra.id,
      name: 'Banco Inter PJ',
      bank: 'Inter',
      type: 'corrente',
      initialBalance: 14320,
      currentBalance: 14320,
      color: '#ff7a00',
    };
    const accItau = {
      id: `acc_itau_${Date.now()}`,
      userId,
      companyId: companyPessoal.id,
      name: 'Itaú Personnalité',
      bank: 'Itaú',
      type: 'corrente',
      initialBalance: 8800,
      currentBalance: 8800,
      color: '#ec7000',
    };

    await db.insert(accounts).values([accNubank, accInter, accItau]);

    // 3. Categories
    const catSoftware = {
      id: `cat_soft_${Date.now()}`,
      userId,
      name: 'Software & SaaS',
      type: 'expense',
      color: '#3b82f6',
      icon: 'Laptop',
    };
    const catMarketing = {
      id: `cat_mkt_${Date.now()}`,
      userId,
      name: 'Marketing & Tráfego',
      type: 'expense',
      color: '#ec4899',
      icon: 'Megaphone',
    };
    const catFornecedores = {
      id: `cat_fornec_${Date.now()}`,
      userId,
      name: 'Fornecedores',
      type: 'expense',
      color: '#f59e0b',
      icon: 'Truck',
    };
    const catFuncionarios = {
      id: `cat_func_${Date.now()}`,
      userId,
      name: 'Funcionários & Pró-labore',
      type: 'expense',
      color: '#10b981',
      icon: 'Users',
    };
    const catInfra = {
      id: `cat_infra_${Date.now()}`,
      userId,
      name: 'Infraestrutura & Internet',
      type: 'expense',
      color: '#06b6d4',
      icon: 'Wifi',
    };
    const catImpostos = {
      id: `cat_tax_${Date.now()}`,
      userId,
      name: 'Impostos & DAS',
      type: 'expense',
      color: '#ef4444',
      icon: 'Receipt',
    };
    const catServicos = {
      id: `cat_srv_${Date.now()}`,
      userId,
      name: 'Desenvolvimento de Software',
      type: 'income',
      color: '#10b981',
      icon: 'Code',
    };
    const catConsultoria = {
      id: `cat_cons_${Date.now()}`,
      userId,
      name: 'Consultoria Estratégica',
      type: 'income',
      color: '#6366f1',
      icon: 'Briefcase',
    };

    await db.insert(categories).values([
      catSoftware,
      catMarketing,
      catFornecedores,
      catFuncionarios,
      catInfra,
      catImpostos,
      catServicos,
      catConsultoria,
    ]);

    // 4. Contacts (Clients and Suppliers)
    await db.insert(contacts).values([
      {
        id: `cont_cli1_${Date.now()}`,
        userId,
        name: 'Cliente A (TechCorp)',
        type: 'client',
        companyId: companyCREATE.id,
        email: 'financeiro@techcorp.com',
        document: '12.345.678/0001-99',
      },
      {
        id: `cont_cli2_${Date.now()}`,
        userId,
        name: 'Cliente B (Inovare)',
        type: 'client',
        companyId: companyOrbitra.id,
        email: 'contato@inovare.com.br',
        document: '23.456.789/0001-00',
      },
      {
        id: `cont_sup1_${Date.now()}`,
        userId,
        name: 'Adobe Creative Cloud',
        type: 'supplier',
        companyId: companyCREATE.id,
        email: 'billing@adobe.com',
      },
      {
        id: `cont_sup2_${Date.now()}`,
        userId,
        name: 'Fornecedor XYZ',
        type: 'supplier',
        companyId: companyOrbitra.id,
        email: 'vendas@fornecedorxyz.com',
      },
    ]);

    // 5. Initial Transactions matching PRD
    const today = '2026-09-19';
    const tomorrow = '2026-09-20';
    const next7Days = '2026-09-25';

    await db.insert(transactions).values([
      // Pagamentos de Hoje (PRD Section 7)
      {
        id: `tx_p1_${Date.now()}`,
        userId,
        companyId: companyCREATE.id,
        accountId: accNubank.id,
        categoryId: catSoftware.id,
        type: 'expense',
        description: 'Adobe Creative Cloud',
        amount: 199.9,
        transactionDate: today,
        dueDate: today,
        status: 'pending',
        supplierName: 'Adobe',
        paymentMethod: 'cartao',
      },
      {
        id: `tx_p2_${Date.now()}`,
        userId,
        companyId: companyCREATE.id,
        accountId: accNubank.id,
        categoryId: catInfra.id,
        type: 'expense',
        description: 'Internet Fibra Dedicada',
        amount: 150.0,
        transactionDate: today,
        dueDate: today,
        status: 'pending',
        supplierName: 'Internet',
        paymentMethod: 'boleto',
      },
      {
        id: `tx_p3_${Date.now()}`,
        userId,
        companyId: companyOrbitra.id,
        accountId: accInter.id,
        categoryId: catFornecedores.id,
        type: 'expense',
        description: 'Fornecedor XYZ - Licenciamento',
        amount: 850.0,
        transactionDate: today,
        dueDate: today,
        status: 'pending',
        supplierName: 'Fornecedor XYZ',
        paymentMethod: 'pix',
      },

      // Recebimentos de Hoje (PRD Section 8)
      {
        id: `tx_r1_${Date.now()}`,
        userId,
        companyId: companyCREATE.id,
        accountId: accNubank.id,
        categoryId: catServicos.id,
        type: 'income',
        description: 'Cliente A - Manutenção e Suporte',
        amount: 2500.0,
        transactionDate: today,
        dueDate: today,
        status: 'pending',
        clientName: 'Cliente A',
        paymentMethod: 'pix',
      },
      {
        id: `tx_r2_${Date.now()}`,
        userId,
        companyId: companyOrbitra.id,
        accountId: accInter.id,
        categoryId: catConsultoria.id,
        type: 'income',
        description: 'Cliente B - Mensalidade Plataforma',
        amount: 1500.0,
        transactionDate: today,
        dueDate: today,
        status: 'pending',
        clientName: 'Cliente B',
        paymentMethod: 'pix',
      },

      // Pagamentos Vencendo Amanhã e Próximos 7 Dias (PRD Section 28 e 29)
      {
        id: `tx_p_tom_${Date.now()}`,
        userId,
        companyId: companyCREATE.id,
        accountId: accNubank.id,
        categoryId: catInfra.id,
        type: 'expense',
        description: 'Hospedagem Cloud AWS',
        amount: 420.0,
        transactionDate: tomorrow,
        dueDate: tomorrow,
        status: 'pending',
        supplierName: 'AWS Cloud',
        paymentMethod: 'cartao',
      },
      {
        id: `tx_p_fut_${Date.now()}`,
        userId,
        companyId: companyOrbitra.id,
        accountId: accInter.id,
        categoryId: catFornecedores.id,
        type: 'expense',
        description: 'Fornecedor de APIs Externas',
        amount: 850.0,
        transactionDate: next7Days,
        dueDate: next7Days,
        status: 'pending',
        supplierName: 'Fornecedor API',
        paymentMethod: 'boleto',
      },

      // Pagamentos Vencidos (Overdue)
      {
        id: `tx_p_over1_${Date.now()}`,
        userId,
        companyId: companyCREATE.id,
        accountId: accNubank.id,
        categoryId: catMarketing.id,
        type: 'expense',
        description: 'Google Ads Campanha',
        amount: 600.0,
        transactionDate: '2026-09-15',
        dueDate: '2026-09-15',
        status: 'overdue',
        supplierName: 'Google Ads',
        paymentMethod: 'cartao',
      },
      {
        id: `tx_p_over2_${Date.now()}`,
        userId,
        companyId: companyOrbitra.id,
        accountId: accInter.id,
        categoryId: catImpostos.id,
        type: 'expense',
        description: 'Taxa Municipal Alvará',
        amount: 280.0,
        transactionDate: '2026-09-16',
        dueDate: '2026-09-16',
        status: 'overdue',
        supplierName: 'Prefeitura',
        paymentMethod: 'boleto',
      },

      // Lançamentos já realizados no mês (para compor os R$ 32.850 entradas e R$ 18.430 saídas do mês)
      {
        id: `tx_paid1_${Date.now()}`,
        userId,
        companyId: companyCREATE.id,
        accountId: accNubank.id,
        categoryId: catServicos.id,
        type: 'income',
        description: 'Projeto E-commerce Enterprise',
        amount: 20000.0,
        transactionDate: '2026-09-05',
        dueDate: '2026-09-05',
        status: 'received',
        clientName: 'Megastore S/A',
        paymentMethod: 'pix',
      },
      {
        id: `tx_paid2_${Date.now()}`,
        userId,
        companyId: companyOrbitra.id,
        accountId: accInter.id,
        categoryId: catConsultoria.id,
        type: 'income',
        description: 'Consultoria de Arquitetura Cloud',
        amount: 8850.0,
        transactionDate: '2026-09-10',
        dueDate: '2026-09-10',
        status: 'received',
        clientName: 'FinTech Brasil',
        paymentMethod: 'ted',
      },
      {
        id: `tx_exp1_${Date.now()}`,
        userId,
        companyId: companyCREATE.id,
        accountId: accNubank.id,
        categoryId: catFuncionarios.id,
        type: 'expense',
        description: 'Folha de Pagamento Desenvolvedores',
        amount: 11500.0,
        transactionDate: '2026-09-05',
        dueDate: '2026-09-05',
        status: 'paid',
        paymentMethod: 'pix',
      },
      {
        id: `tx_exp2_${Date.now()}`,
        userId,
        companyId: companyOrbitra.id,
        accountId: accInter.id,
        categoryId: catMarketing.id,
        type: 'expense',
        description: 'Campanha de Tráfego Pago Meta Ads',
        amount: 3200.0,
        transactionDate: '2026-09-08',
        dueDate: '2026-09-08',
        status: 'paid',
        paymentMethod: 'cartao',
      },
      {
        id: `tx_exp3_${Date.now()}`,
        userId,
        companyId: companyCREATE.id,
        accountId: accNubank.id,
        categoryId: catImpostos.id,
        type: 'expense',
        description: 'Guia DAS Simples Nacional',
        amount: 1230.1,
        transactionDate: '2026-09-12',
        dueDate: '2026-09-12',
        status: 'paid',
        paymentMethod: 'boleto',
      },
    ]);

    console.log(`Seeding completed successfully for user ${userId}.`);
  } catch (error) {
    console.error('Failed to seed user data:', error);
  }
}
