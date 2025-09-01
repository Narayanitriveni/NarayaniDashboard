import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import SortDropdown from "@/components/SortDropdown";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Announcement, Class } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import { ADToBS } from "bikram-sambat-js";

type AnnouncementList = Announcement & { class: Class | null };

const sortOptions = [
  { label: "Date (Newest First)", value: "date", direction: "desc" as const },
  { label: "Date (Oldest First)", value: "date", direction: "asc" as const },
  { label: "Title (A-Z)", value: "title", direction: "asc" as const },
  { label: "Title (Z-A)", value: "title", direction: "desc" as const },
  { label: "Class (A-Z)", value: "class.name", direction: "asc" as const },
  { label: "Class (Z-A)", value: "class.name", direction: "desc" as const },
];

const AnnouncementListPage = async (
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
    {
      header: "Title",
      accessor: "title",
    },
    {
      header: "Description",
      accessor: "description",
      className: "hidden md:table-cell",
    },
    {
      header: "Class",
      accessor: "class",
    },
    {
      header: "Date",
      accessor: "date",
      className: "hidden md:table-cell",
    },
    ...(role === "admin" || role === "accountant"
      ? [
          {
            header: "Actions",
            accessor: "action",
          },
        ]
      : []),
  ];

  const renderRow = (item: AnnouncementList) => {
    const date = new Date(item.date);
    const bsDate = ADToBS(date.toISOString().split("T")[0]);
    const time = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    return (
      <tr
        key={item.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
      >
        <td className="p-4">{item.title}</td>
        <td className="hidden md:table-cell">{item.description}</td>
        <td>{item.class?.name || "-"}</td>
        <td className="hidden md:table-cell">{`${bsDate} ${time}`}</td>
        {(role === "admin" || role === "accountant") && (
          <td>
            <div className="flex items-center gap-2">
              <FormContainer table="announcement" type="update" data={item} />
              <FormContainer table="announcement" type="delete" id={item.id} />
            </div>
          </td>
        )}
      </tr>
    );
  };

  const { page, sort, direction, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION
  const query: any = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            query.title = { contains: value, mode: "insensitive" };
            break;
          default:
            break;
        }
      }
    }
  }

  // ROLE CONDITIONS
  if (role === "teacher") {
    query.class = {
      lessons: {
        some: { teacherId: currentUserId! }
      }
    };
  } else if (role === "student") {
    query.class = {
      students: {
        some: { id: currentUserId! }
      }
    };
  } else if (role === "parent") {
    query.class = {
      students: {
        some: { parentId: currentUserId! }
      }
    };
  }

  const [data, count] = await prisma.$transaction([
    prisma.announcement.findMany({
      where: query,
      include: {
        class: true,
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
    prisma.announcement.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          All Announcements
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <SortDropdown options={sortOptions} defaultSort="date" />
            {(role === "admin" || role === "accountant") && (
              <FormContainer table="announcement" type="create" />
            )}
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

export default AnnouncementListPage;
