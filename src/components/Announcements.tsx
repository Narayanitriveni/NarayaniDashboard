import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { ADToBS } from "bikram-sambat-js";

const Announcements = async () => {
  const session = await auth();
  const userId = session.userId;
  const role = (session.sessionClaims?.metadata as { role?: string })?.role;
  const roleConditions = {
    teacher: { lessons: { some: { teacherId: userId! } } },
    student: { students: { some: { studentId: userId! } } },
    parent: { students: { some: { student: { parentId: userId! } } } },
  };

  const data = await prisma.announcement.findMany({
    take: 3,
    orderBy: { date: "desc" },
    where: {
      ...(role !== "admin" && {
        OR: [
          { classId: null },
          { class: roleConditions[role as keyof typeof roleConditions] || {} },
        ],
      }),
    },
  });

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-800">Announcements</h1>
        <button className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium touch-manipulation">
          View All
        </button>
      </div>
      <div className="flex flex-col gap-3 sm:gap-4">
        {data[0] && (
          <div className="bg-lamaSkyLight rounded-xl sm:rounded-lg p-4 sm:p-5 border border-lamaSky/20">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-semibold text-gray-800 text-sm sm:text-base flex-1">{data[0].title}</h2>
              <span className="text-xs text-gray-500 bg-white rounded-lg px-2 py-1 flex-shrink-0 shadow-sm">
                {ADToBS(new Date(data[0].date).toISOString().split('T')[0])}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">{data[0].description}</p>
          </div>
        )}
        {data[1] && (
          <div className="bg-lamaPurpleLight rounded-xl sm:rounded-lg p-4 sm:p-5 border border-lamaPurple/20">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-semibold text-gray-800 text-sm sm:text-base flex-1">{data[1].title}</h2>
              <span className="text-xs text-gray-500 bg-white rounded-lg px-2 py-1 flex-shrink-0 shadow-sm">
                {ADToBS(new Date(data[1].date).toISOString().split('T')[0])}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">{data[1].description}</p>
          </div>
        )}
        {data[2] && (
          <div className="bg-lamaYellowLight rounded-xl sm:rounded-lg p-4 sm:p-5 border border-lamaYellow/20">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-semibold text-gray-800 text-sm sm:text-base flex-1">{data[2].title}</h2>
              <span className="text-xs text-gray-500 bg-white rounded-lg px-2 py-1 flex-shrink-0 shadow-sm">
                {ADToBS(new Date(data[2].date).toISOString().split('T')[0])}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">{data[2].description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;
