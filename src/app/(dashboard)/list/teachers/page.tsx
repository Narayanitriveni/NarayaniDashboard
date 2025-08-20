import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import TableSearch from "@/components/TableSearch";
import SortDropdown from "@/components/SortDropdown";
import prisma from "@/lib/prisma";
import { Class, Prisma, Subject, Teacher } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";

type TeacherList = Teacher & { subjects: Subject[] } & { classes: Class[] };

const TeacherListPage = async (
  props: {
    searchParams: Promise<{ [key: string]: string | undefined }>;
  }
) => {
  const searchParams = await props.searchParams;
  const session = await auth();
  const sessionClaims = session.sessionClaims;
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  // Mobile-first card layout - no need for table columns
  const { page, sort, direction, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION
  const query: Prisma.TeacherWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "subject":
            query.subjects = {
              some: {
                name: { contains: value, mode: "insensitive" }
              }
            };
            break;
          case "search":
            query.OR = [
              { name: { contains: value, mode: "insensitive" } },
              { teacherId: { contains: value, mode: "insensitive" } }
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  const [data, count] = await prisma.$transaction([
    prisma.teacher.findMany({
      where: query,
      include: {
        subjects: true,
        classes: true
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: sort && direction ? {
        [sort.includes('.') ? sort.split('.')[0] : sort]: sort.includes('.') 
          ? { [sort.split('.')[1]]: direction }
          : direction
      } : {
        name: 'asc'
      }
    }),
    prisma.teacher.count({ where: query }),
  ]);

  const sortOptions = [
    { label: "Name (A-Z)", value: "name", direction: "asc" as const },
    { label: "Name (Z-A)", value: "name", direction: "desc" as const },
    { label: "Email (A-Z)", value: "email", direction: "asc" as const },
    { label: "Email (Z-A)", value: "email", direction: "desc" as const },
    { label: "Phone (A-Z)", value: "phone", direction: "asc" as const },
    { label: "Phone (Z-A)", value: "phone", direction: "desc" as const },
    { label: "Teacher ID (A-Z)", value: "teacherId", direction: "asc" as const },
    { label: "Teacher ID (Z-A)", value: "teacherId", direction: "desc" as const },
   
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-first responsive layout */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* HEADER SECTION */}
        <div className="bg-white rounded-2xl sm:rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">All Teachers</h1>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <TableSearch />
              <div className="flex items-center gap-3 sm:gap-4">
                <button className="p-3 sm:p-2 rounded-xl sm:rounded-lg bg-lamaYellow hover:bg-lamaYellow/90 transition-colors touch-manipulation shadow-sm">
                  <Image src="/filter.png" alt="Filter" width={16} height={16} className="sm:w-3.5 sm:h-3.5" />
                </button>
                <SortDropdown options={sortOptions} defaultSort="name" />
                {role === "admin" && <FormContainer table="teacher" type="create" />}
              </div>
            </div>
          </div>
        </div>

        {/* TEACHERS LIST - Mobile Card Layout */}
        <div className="space-y-4">
          {data.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl sm:rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              {/* Teacher Info Card */}
              <div className="flex items-start gap-4 mb-4">
                <Image
                  src={item.img || "/noAvatar.png"}
                  alt={item.name}
                  width={60}
                  height={60}
                  className="w-15 h-15 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg sm:text-base text-gray-800 mb-1">{item.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{item.email}</p>
                  <p className="text-sm text-gray-600 font-medium">ID: {item.teacherId}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/list/teachers/${item.id}`}>
                    <button className="p-3 sm:p-2 rounded-xl sm:rounded-lg bg-lamaSky hover:bg-lamaSky/90 transition-colors touch-manipulation shadow-sm">
                      <Image src="/view.png" alt="View" width={16} height={16} className="sm:w-4 sm:h-4" />
                    </button>
                  </Link>
                  {role === "admin" && (
                    <FormContainer table="teacher" type="delete" id={item.id} />
                  )}
                </div>
              </div>

              {/* Additional Details - Mobile Optimized */}
              <div className="space-y-3 sm:space-y-2">
                {/* Subjects */}
                {item.subjects.length > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="text-xs sm:text-sm font-medium text-gray-500 min-w-16">Subjects:</span>
                    <div className="flex flex-wrap gap-1">
                      {item.subjects.map((subject, index) => (
                        <span
                          key={subject.id}
                          className="inline-block px-2 py-1 text-xs bg-lamaSkyLight text-lamaSky rounded-lg"
                        >
                          {subject.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Classes */}
                {item.classes.length > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="text-xs sm:text-sm font-medium text-gray-500 min-w-16">Classes:</span>
                    <div className="flex flex-wrap gap-1">
                      {item.classes.map((classItem, index) => (
                        <span
                          key={classItem.id}
                          className="inline-block px-2 py-1 text-xs bg-lamaPurpleLight text-lamaPurple rounded-lg"
                        >
                          {classItem.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact Info */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 pt-2 border-t border-gray-100">
                  {item.phone && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm text-gray-500">📞</span>
                      <span className="text-sm text-gray-700">{item.phone}</span>
                    </div>
                  )}
                  {item.address && (
                    <div className="flex items-start gap-2">
                      <span className="text-xs sm:text-sm text-gray-500 mt-0.5">📍</span>
                      <span className="text-sm text-gray-700 flex-1">{item.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* PAGINATION - Mobile Optimized */}
        <div className="bg-white rounded-2xl sm:rounded-xl p-4 shadow-sm border border-gray-100">
          <Pagination page={p} count={count} />
        </div>
      </div>
    </div>
  );
};

export default TeacherListPage;
