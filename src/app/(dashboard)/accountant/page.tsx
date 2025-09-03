import FinancialSummaryCard from '@/components/FinancialSummaryCard';
import IncomeExpenseChart from '@/components/IncomeExpenseChart';
import ExpenseDistributionChart from '@/components/ExpenseDistributionChart';
import RecentTransactions from '@/components/RecentTransactions';
import prisma from '@/lib/prisma';
import { IndianRupee, PieChart, TrendingUp, TrendingDown } from 'lucide-react';
import { ADToBS } from 'bikram-sambat-js';
import dynamic from 'next/dynamic';

// Fix import path for AccountantSummarySection
const AccountantSummarySection = dynamic(() => import('./AccountantSummarySection'), { ssr: false });

const AccountantDashboard = async () => {
  // Fetch aggregate financial data
  const totalRevenue = await prisma.fee.aggregate({ _sum: { paidAmount: true } });
  const outstandingFees = await prisma.fee.aggregate({ _sum: { totalAmount: true, paidAmount: true } });
  const totalExpenses = await prisma.finance.aggregate({ _sum: { amount: true } });

  const revenue = totalRevenue._sum.paidAmount ?? 0;
  const outstanding = Number(outstandingFees._sum.totalAmount ?? 0) - Number(outstandingFees._sum.paidAmount ?? 0);
  const expenses = totalExpenses._sum.amount ?? 0;

  // --- Day-wise summary ---
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const startOfDay = new Date(todayStr + 'T00:00:00.000Z');
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const dayRevenue = await prisma.fee.aggregate({
    _sum: { paidAmount: true },
    where: { payments: { some: { date: { gte: startOfDay, lt: endOfDay } } } },
  });
  const dayExpenses = await prisma.finance.aggregate({
    _sum: { amount: true },
    where: { createdAt: { gte: new Date(todayStr + 'T00:00:00.000Z'), lte: new Date(todayStr + 'T23:59:59.999Z') } },
  });

  // --- Week-wise summary ---
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
  startOfWeek.setHours(0,0,0,0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23,59,59,999);
  const weekRevenue = await prisma.fee.aggregate({
    _sum: { paidAmount: true },
    where: { payments: { some: { date: { gte: startOfWeek, lte: endOfWeek } } } },
  });
  const weekExpenses = await prisma.finance.aggregate({
    _sum: { amount: true },
    where: { createdAt: { gte: startOfWeek, lte: endOfWeek } },
  });

  // --- Month-wise summary (already present as monthlyIncome/monthlyExpenses) ---
  // --- Total summary (already present as revenue/expenses) ---

  // Prepare summary data for each type
  const summaryData = {
    day: {
      revenue: Number(dayRevenue._sum.paidAmount ?? 0),
      expenses: Number(dayExpenses._sum.amount ?? 0),
    },
    week: {
      revenue: Number(weekRevenue._sum.paidAmount ?? 0),
      expenses: Number(weekExpenses._sum.amount ?? 0),
    },
    month: {
      revenue: Number(revenue), // fallback to total for now
      expenses: Number(expenses),
    },
    total: {
      revenue: Number(revenue),
      expenses: Number(expenses),
    },
  };

  // Fetch monthly data for the chart
  const monthlyIncome = await prisma.payment.groupBy({
    by: ['date'],
    _sum: { amount: true },
    orderBy: { date: 'asc' },
  });

  const monthlyExpenses = await prisma.finance.groupBy({
    by: ['createdAt'],
    _sum: { amount: true },
    orderBy: { createdAt: 'asc' },
  });

  const bsMonths = ["Baisakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin", "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"];
  
  const monthlyChartData = bsMonths.map(monthName => ({
    name: monthName,
    income: 0,
    expenses: 0,
  }));

  monthlyIncome.forEach(item => {
    const adDate = new Date(item.date);
    const bsDate = ADToBS(adDate.toISOString().split('T')[0]);
    const bsMonth = parseInt(bsDate.split('-')[1]) - 1;
    if (monthlyChartData[bsMonth]) {
      monthlyChartData[bsMonth].income += Number(item._sum.amount);
    }
  });

  monthlyExpenses.forEach(item => {
    const adDate = new Date(item.createdAt);
    const bsDate = ADToBS(adDate.toISOString().split('T')[0]);
    const bsMonth = parseInt(bsDate.split('-')[1]) - 1;
    if (monthlyChartData[bsMonth]) {
      monthlyChartData[bsMonth].expenses += Number(item._sum.amount);
    }
  });

  // Import category utils for Nepali names
  const { expenseCategoryNepali, incomeCategoryNepali } = await import('@/lib/categoryUtils');

  // Fetch expense distribution data
  const expenseDistribution = await prisma.finance.groupBy({
    by: ['type', 'expenseCategory', 'incomeCategory'],
    _sum: { amount: true },
    where: {
      type: "EXPENSE",
      expenseCategory: { not: null }
    }
  });

  const expenseChartData = expenseDistribution.map(item => {
    // Get the category name - either from the Nepali mapping or format the enum
    const categoryName = item.expenseCategory ? 
      (expenseCategoryNepali[item.expenseCategory] || 
        item.expenseCategory.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())) : 
      'Other';
    
    return {
      name: categoryName,
      value: Number(item._sum?.amount ?? 0),
    };
  });

  // Fetch income distribution data
  const incomeDistribution = await prisma.finance.groupBy({
    by: ['type', 'incomeCategory'],
    _sum: { amount: true },
    where: {
      type: "INCOME",
      incomeCategory: { not: null }
    }
  });

  const incomeChartData = incomeDistribution.map(item => {
    // Get the category name - either from the Nepali mapping or format the enum
    const categoryName = item.incomeCategory ? 
      (incomeCategoryNepali[item.incomeCategory] || 
        item.incomeCategory.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())) : 
      'Other';
    
    return {
      name: categoryName,
      value: Number(item._sum?.amount ?? 0),
    };
  });

  // Fetch recent transactions
  const recentPayments = await prisma.payment.findMany({
    take: 5,
    orderBy: { date: 'desc' },
    include: {
      fee: {
        include: {
          student: {
            select: { name: true, surname: true }
          }
        }
      }
    }
  });

  const recentExpensesList = await prisma.finance.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Accountant Dashboard</h1>
   
      <AccountantSummarySection summaryData={summaryData} />
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Income vs. Expenses</h2>
          <IncomeExpenseChart data={monthlyChartData} />
        </div>
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Expense Distribution</h2>
          <ExpenseDistributionChart data={expenseChartData} />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Income Distribution</h2>
          <ExpenseDistributionChart data={incomeChartData} />
        </div>
        <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Financial Summary</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <h3 className="text-sm text-green-700 font-medium">कुल आय (Total Income)</h3>
              <p className="text-xl font-bold text-green-800">₹{Number(revenue).toLocaleString()}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-100">
              <h3 className="text-sm text-red-700 font-medium">कुल व्यय (Total Expense)</h3>
              <p className="text-xl font-bold text-red-800">₹{Number(expenses).toLocaleString()}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="text-sm text-blue-700 font-medium">बाँकी शुल्क (Outstanding Fees)</h3>
              <p className="text-xl font-bold text-blue-800">₹{Number(outstanding).toLocaleString()}</p>
            </div>
            <div className={`p-4 rounded-lg border ${Number(revenue) > Number(expenses) ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
              <h3 className={`text-sm font-medium ${Number(revenue) > Number(expenses) ? 'text-green-700' : 'text-red-700'}`}>
                {Number(revenue) > Number(expenses) ? 'लाभ (Profit)' : 'हानि (Loss)'}
              </h3>
              <p className={`text-xl font-bold ${Number(revenue) > Number(expenses) ? 'text-green-800' : 'text-red-800'}`}>
                ₹{Math.abs(Number(revenue) - Number(expenses)).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Recent Transactions */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
        <RecentTransactions payments={recentPayments} expenses={recentExpensesList} />
      </div>
    </div>
  );
};

export default AccountantDashboard;