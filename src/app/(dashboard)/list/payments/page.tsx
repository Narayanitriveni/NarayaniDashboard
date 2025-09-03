import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import SortDropdown from "@/components/SortDropdown";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Payment, Fee, Student, Class } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";
import { ADToBS } from "bikram-sambat-js";

const getCategoryInHindi = (category: string) => {
  const categoryMap: { [key: string]: string } = {
    'PARENT_SUPPORT': 'अभिभावक सहयोग',
    'PARENT_SUPPORT_MONTHLY': 'अभिभावक सहयोग मासिक',
    'TUITION_FEE': 'शिक्षण शुल्कं',
    'DEPOSIT_FEE': 'धरौटी शुल्क',
    'ELECTRICITY_TRANSPORT': 'विद्युत/यातायात शुल्क',
    'LIBRARY_FEE': 'पुस्तकालय शुल्क',
    'REGISTRATION_FEE': 'रजिष्ट्रेशन शुल्क',
    'IDENTITY_SPORTS': 'परिचय पत्र तथा खेलकुद',
    'EXAM_FEE_1': '। परीक्षा शुल्क',
    'EXAM_FEE_2': '|| परीक्षा शुल्क',
    'EXAM_FEE_3': '||| परीक्षा शुल्क',
    'EXAM_FEE_4': '|||| परीक्षा शुल्क',
    'SEE_EXAM_FEE': 'SEE परीक्षा',
    'BUILDING_MISC_FEE': 'भवन एवं विविध शुल्क',
    'CERTIFICATE_FEE': 'प्रमाण पत्र शुल्क',
    'GRADE_SHEET': 'लब्धाङ्क पत्र',
    'TIE_BELT': 'टाई बेल्ट'
  };
  return categoryMap[category] || category;
};

const getCategorySearchQuery = (searchValue: string) => {
  const searchLower = searchValue.toLowerCase();
  const matchingCategories: string[] = [];
  
  // Check if search value matches any Hindi text or English enum
  if (searchLower.includes('अभिभावक') || searchLower.includes('parent') || searchLower.includes('support')) {
    matchingCategories.push('PARENT_SUPPORT');
    matchingCategories.push('PARENT_SUPPORT_MONTHLY');
  }
  if (searchLower.includes('शिक्षण') || searchLower.includes('tuition')) {
    matchingCategories.push('TUITION_FEE');
  }
  if (searchLower.includes('धरौटी') || searchLower.includes('deposit')) {
    matchingCategories.push('DEPOSIT_FEE');
  }
  if (searchLower.includes('विद्युत') || searchLower.includes('यातायात') || searchLower.includes('electricity') || searchLower.includes('transport')) {
    matchingCategories.push('ELECTRICITY_TRANSPORT');
  }
  if (searchLower.includes('पुस्तकालय') || searchLower.includes('library')) {
    matchingCategories.push('LIBRARY_FEE');
  }
  if (searchLower.includes('रजिष्ट्रेशन') || searchLower.includes('registration')) {
    matchingCategories.push('REGISTRATION_FEE');
  }
  if (searchLower.includes('परिचय') || searchLower.includes('खेलकुद') || searchLower.includes('identity') || searchLower.includes('sports')) {
    matchingCategories.push('IDENTITY_SPORTS');
  }
  if (searchLower.includes('परीक्षा') || searchLower.includes('exam')) {
    matchingCategories.push('EXAM_FEE_1', 'EXAM_FEE_2', 'EXAM_FEE_3', 'EXAM_FEE_4', 'SEE_EXAM_FEE');
  }
  if (searchLower.includes('भवन') || searchLower.includes('विविध') || searchLower.includes('building') || searchLower.includes('misc')) {
    matchingCategories.push('BUILDING_MISC_FEE');
  }
  if (searchLower.includes('प्रमाण') || searchLower.includes('पत्र') || searchLower.includes('certificate')) {
    matchingCategories.push('CERTIFICATE_FEE');
  }
  if (searchLower.includes('लब्धाङ्क') || searchLower.includes('grade') || searchLower.includes('sheet')) {
    matchingCategories.push('GRADE_SHEET');
  }
  if (searchLower.includes('टाई') || searchLower.includes('बेल्ट') || searchLower.includes('tie') || searchLower.includes('belt')) {
    matchingCategories.push('TIE_BELT');
  }
  
  // Return category filter if we found matches
  return matchingCategories.length > 0 ? [{ category: { in: matchingCategories } }] : [];
};

type PaymentWithRelations = Payment & {
  fee: Fee & {
    student: Student & {
      enrollments: { class: Class }[];
    };
  };
};

const PaymentsListPage = async (
  props: {
    searchParams: Promise<{ [key: string]: string | undefined }>;
  }
) => {
  const searchParams = await props.searchParams;
  const session = await auth();
  const userId = session.userId;
  const sessionClaims = session.sessionClaims;
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;
  const columns = [
    { header: "Student", accessor: "student" },
    { header: "Class", accessor: "class" },
    { header: "Category", accessor: "category" },
    { header: "Amount", accessor: "amount" },
    { header: "Method", accessor: "method" },
    { header: "Date", accessor: "date" },
    { header: "Transaction ID", accessor: "transactionId" },
    ...(role === "admin" || role === "accountant"
      ? [{ header: "Actions", accessor: "actions" }]
      : []),
  ];

  const renderRow = (payment: PaymentWithRelations) => {
    const paymentDate = new Date(payment.date);
    const adDateString = `${paymentDate.getFullYear()}-${String(
      paymentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(paymentDate.getDate()).padStart(2, "0")}`;
    const bsDate = ADToBS(adDateString);
    const [year, month, day] = bsDate.split("-").map(Number);

    const nepaliMonths = [
      "बैशाख",
      "जेठ",
      "आषाढ",
      "श्रावण",
      "भाद्र",
      "आश्विन",
      "कार्तिक",
      "मंसिर",
      "पौष",
      "माघ",
      "फाल्गुन",
      "चैत्र",
    ];
    return (
      <tr
        key={payment.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
      >
        <td className="p-4">{`${payment.fee.student.name} ${payment.fee.student.surname}`}</td>
        <td>{(() => {
          const currentEnrollment = payment.fee.student.enrollments?.[0];
          const currentClass = currentEnrollment?.class;
          return currentClass ? currentClass.name : "N/A";
        })()}</td>
        <td>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            payment.category === 'PARENT_SUPPORT' ? 'bg-blue-100 text-blue-800' :
            payment.category === 'PARENT_SUPPORT_MONTHLY' ? 'bg-blue-100 text-blue-800' :
            payment.category === 'TUITION_FEE' ? 'bg-green-100 text-green-800' :
            payment.category === 'DEPOSIT_FEE' ? 'bg-purple-100 text-purple-800' :
            payment.category === 'ELECTRICITY_TRANSPORT' ? 'bg-yellow-100 text-yellow-800' :
            payment.category === 'LIBRARY_FEE' ? 'bg-indigo-100 text-indigo-800' :
            payment.category === 'REGISTRATION_FEE' ? 'bg-pink-100 text-pink-800' :
            payment.category === 'IDENTITY_SPORTS' ? 'bg-orange-100 text-orange-800' :
            payment.category === 'EXAM_FEE_1' ? 'bg-red-100 text-red-800' :
            payment.category === 'EXAM_FEE_2' ? 'bg-red-100 text-red-800' :
            payment.category === 'EXAM_FEE_3' ? 'bg-red-100 text-red-800' :
            payment.category === 'EXAM_FEE_4' ? 'bg-red-100 text-red-800' :
            payment.category === 'SEE_EXAM_FEE' ? 'bg-red-100 text-red-800' :
            payment.category === 'BUILDING_MISC_FEE' ? 'bg-gray-100 text-gray-800' :
            payment.category === 'CERTIFICATE_FEE' ? 'bg-teal-100 text-teal-800' :
            payment.category === 'GRADE_SHEET' ? 'bg-cyan-100 text-cyan-800' :
            payment.category === 'TIE_BELT' ? 'bg-emerald-100 text-emerald-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {getCategoryInHindi(payment.category)}
          </span>
        </td>
        <td>{Number(payment.amount).toLocaleString()}</td>
        <td>{payment.method}</td>
        <td>{`${nepaliMonths[month - 1]} ${day}, ${year}`}</td>
        <td>{payment.transactionId || "N/A"}</td>
        {(role === "admin" || role === "accountant") && (
          <td>
            <div className="flex items-center gap-2">
              <FormContainer table="payment" type="update" data={payment} />
              <FormContainer table="payment" type="delete" id={payment.id} />
            </div>
          </td>
        )}
      </tr>
    );
  };

  const { page, sort, direction, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  const query: any = {
    where: {
      AND: [],
    },
  };

  // Search filter
  if (queryParams.search) {
    query.where.AND.push({
      OR: [
        {
          fee: {
            student: {
              OR: [
                { name: { contains: queryParams.search, mode: "insensitive" } },
                { surname: { contains: queryParams.search, mode: "insensitive" } },
              ],
            },
          },
        },
        // For enum fields, we need to check if the search value matches any category
        ...(queryParams.search ? getCategorySearchQuery(queryParams.search) : []),
      ]
    });
  }

  // Role-based filtering
  if (role === "student") {
    query.where.AND.push({ fee: { studentId: currentUserId } });
  } else if (role === "parent") {
    query.where.AND.push({
      fee: { student: { parentId: currentUserId } },
    });
  } else if (role === "teacher") {
    query.where.AND.push({
      fee: { student: { class: { supervisorId: currentUserId } } },
    });
  }

  const [data, count] = await prisma.$transaction([
    prisma.payment.findMany({
      ...query,
      include: {
        fee: {
          include: {
            student: {
              include: {
                enrollments: {
                  include: { class: true },
                  where: { leftAt: null },
                },
              },
            },
          },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: sort && direction ? {
        [sort.includes('.') ? sort.split('.')[0] : sort]: sort.includes('.') 
          ? { [sort.split('.')[1]]: direction }
          : direction
      } : {
        date: 'desc'
      }
    }),
    prisma.payment.count({ where: query.where }),
  ]);

  const sortOptions = [
    { label: "Date (Newest)", value: "date", direction: "desc" as const },
    { label: "Date (Oldest)", value: "date", direction: "asc" as const },
    { label: "Amount (High-Low)", value: "amount", direction: "desc" as const },
    { label: "Amount (Low-High)", value: "amount", direction: "asc" as const },
    { label: "Student (A-Z)", value: "student.name", direction: "asc" as const },
    { label: "Student (Z-A)", value: "student.name", direction: "desc" as const },
    { label: "Category (A-Z)", value: "category", direction: "asc" as const },
    { label: "Category (Z-A)", value: "category", direction: "desc" as const },
    { label: "Method (A-Z)", value: "method", direction: "asc" as const },
    { label: "Method (Z-A)", value: "method", direction: "desc" as const },
  ];

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Payments</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <SortDropdown options={sortOptions} defaultSort="date" />
            {(role === "admin" || role === "accountant") && <FormContainer table="payment" type="create" />}
          </div>
        </div>
      </div>

      <Table columns={columns} renderRow={renderRow} data={data} />
      <Pagination page={p} count={count} />
    </div>
  );
};

export default PaymentsListPage;
