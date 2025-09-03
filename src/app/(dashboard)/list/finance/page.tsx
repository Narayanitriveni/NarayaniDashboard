import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import SortDropdown from "@/components/SortDropdown";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Finance, Prisma, TransactionType } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import { ADToBS } from "bikram-sambat-js";
import { 
  expenseCategoryNepali, 
  incomeCategoryNepali, 
  expenseCategoryColors, 
  incomeCategoryColors 
} from "@/lib/categoryUtils";

const sortOptions = [
  { label: "Date (Newest)", value: "createdAt", direction: "desc" as const },
  { label: "Date (Oldest)", value: "createdAt", direction: "asc" as const },
  { label: "Amount (High-Low)", value: "amount", direction: "desc" as const },
  { label: "Amount (Low-High)", value: "amount", direction: "asc" as const },
  { label: "Type (A-Z)", value: "type", direction: "asc" as const },
  { label: "Type (Z-A)", value: "type", direction: "desc" as const },
  { label: "Description (A-Z)", value: "description", direction: "asc" as const },
  { label: "Description (Z-A)", value: "description", direction: "desc" as const },
];

const FinanceListPage = async (
  props: {
    searchParams: Promise<{ [key: string]: string | undefined }>;
  }
) => {
  const searchParams = await props.searchParams;
  const session = await auth();
  const sessionClaims = session.sessionClaims;
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const nepaliMonths = [
    'बैशाख', 'जेठ', 'आषाढ', 'श्रावण', 'भाद्र', 'आश्विन',
    'कार्तिक', 'मंसिर', 'पौष', 'माघ', 'फाल्गुन', 'चैत्र'
  ];

  const formatBSDate = (date: Date) => {
    const bsDate = ADToBS(date.toISOString().split('T')[0]);
    const [year, month, day] = bsDate.split('-').map(Number);
    return `${nepaliMonths[month - 1]} ${day}, ${year}`;
  };

  // Get Nepali category name
  const getCategoryNepaliName = (finance: Finance): string => {
    if (finance.type === "INCOME" && finance.incomeCategory) {
      return incomeCategoryNepali[finance.incomeCategory] || finance.incomeCategory;
    } else if (finance.type === "EXPENSE" && finance.expenseCategory) {
      return expenseCategoryNepali[finance.expenseCategory] || finance.expenseCategory;
    }
    return "-";
  };

  // Get category color class
  const getCategoryColorClass = (finance: Finance): string => {
    if (finance.type === "INCOME" && finance.incomeCategory) {
      return incomeCategoryColors[finance.incomeCategory] || "bg-gray-100 text-gray-800";
    } else if (finance.type === "EXPENSE" && finance.expenseCategory) {
      return expenseCategoryColors[finance.expenseCategory] || "bg-gray-100 text-gray-800";
    }
    return "bg-gray-100 text-gray-800";
  };

  const columns = [
    { header: "Type", accessor: "type" },
    { header: "Category", accessor: "category" },
    { header: "Amount", accessor: "amount" },
    { header: "Description", accessor: "description" },
    { header: "Date (BS)", accessor: "date" },
    ...(role === "admin" || role === "accountant"
      ? [{ header: "Actions", accessor: "actions" }]
      : []),
  ];

  const renderRow = (finance: Finance) => (
    <tr
      key={finance.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="p-4">
        <span className={`px-2 py-1 rounded-full text-xs ${
          finance.type === "INCOME" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          {finance.type === "INCOME" ? "आय (Income)" : "व्यय (Expense)"}
        </span>
      </td>
      <td className="p-4">
        <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColorClass(finance)}`}>
          {getCategoryNepaliName(finance)}
        </span>
      </td>
      <td className="p-4">₹{Number(finance.amount).toLocaleString()}</td>
      <td className="p-4">{finance.description || "-"}</td>
      <td className="p-4">{formatBSDate(new Date(finance.createdAt))}</td>
      {(role === "admin" || role === "accountant") && (
        <td className="p-4">
          <div className="flex items-center gap-2">
            <FormContainer table="finance" type="update" data={finance} />
            <FormContainer table="finance" type="delete" id={finance.id} />
          </div>
        </td>
      )}
    </tr>
  );

  const { page, sort, direction, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION
  const query: Prisma.FinanceWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "type":
            query.type = value as TransactionType;
            break;
          case "search":
            query.description = { contains: value, mode: "insensitive" };
            break;
          default:
            break;
        }
      }
    }
  }

  // Get financial summary
  const [data, count, totalIncome, totalExpense] = await prisma.$transaction([
    prisma.finance.findMany({
      where: query,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: sort && direction ? {
        [sort.includes('.') ? sort.split('.')[0] : sort]: sort.includes('.') 
          ? { [sort.split('.')[1]]: direction }
          : direction
      } : {
        createdAt: 'desc'
      }
    }),
    prisma.finance.count({ where: query }),
    prisma.finance.aggregate({
      _sum: { amount: true },
      where: { type: "INCOME" }
    }),
    prisma.finance.aggregate({
      _sum: { amount: true },
      where: { type: "EXPENSE" }
    })
  ]);

  // Calculate profit
  const incomeTotal = totalIncome._sum.amount ? Number(totalIncome._sum.amount) : 0;
  const expenseTotal = totalExpense._sum.amount ? Number(totalExpense._sum.amount) : 0;
  const profit = incomeTotal - expenseTotal;

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg shadow-sm border border-green-100">
          <h3 className="text-sm text-green-700 font-medium">कुल आय (Total Income)</h3>
          <p className="text-2xl font-bold text-green-800">₹{incomeTotal.toLocaleString()}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg shadow-sm border border-red-100">
          <h3 className="text-sm text-red-700 font-medium">कुल व्यय (Total Expense)</h3>
          <p className="text-2xl font-bold text-red-800">₹{expenseTotal.toLocaleString()}</p>
        </div>
        <div className={`p-4 rounded-lg shadow-sm border ${profit >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'}`}>
          <h3 className={`text-sm font-medium ${profit >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
            {profit >= 0 ? 'लाभ (Profit)' : 'हानि (Loss)'}
          </h3>
          <p className={`text-2xl font-bold ${profit >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
            ₹{Math.abs(profit).toLocaleString()}
          </p>
        </div>
      </div>

      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">सबै वित्त (All Finances)</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <SortDropdown options={sortOptions} defaultSort="date" />
            {(role === "admin" || role === "accountant") && <FormContainer table="finance" type="create" />}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={data} />
      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default FinanceListPage;

