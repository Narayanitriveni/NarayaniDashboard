import Announcements from "@/components/Announcements";
import { CardSchedule } from "@/components/card-schedule";
import { TimelineSchedule } from "@/components/timeline-schedule";
import { AgendaSchedule } from "@/components/agenda-schedule";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { format, isSameDay, subDays } from "date-fns";
import { BarChart3, Users, CalendarDays, GraduationCap } from "lucide-react";

const TeacherPage = async () => {
  const session = await auth();
  const userId = session.userId;

  // Get teacher details with related data
  const teacher = await prisma.teacher.findUnique({
    where: { id: userId! },
    include: {
      lessons: {
        include: {
          subject: true,
          class: {
            include: {
              grade: true,
              students: {
                include: {
                  student: {
                    include: {
                      attendances: {
                        where: {
                          date: {
                            gte: new Date(new Date().setDate(new Date().getDate() - 7)) // Last 7 days
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      classes: {
        include: {
          grade: true,
          students: {
            include: {
              student: {
                include: {
                  results: {
                    include: {
                      exam: {
                        include: {
                          subject: true
                        }
                      },
                      assignment: {
                        include: {
                          lesson: {
                            include: {
                              subject: true
                            }
                          }
                        }
                      }
                    },
                    orderBy: {
                      id: 'desc'
                    },
                    take: 5
                  }
                }
              }
            }
          },
          exams: {
            include: {
              subject: true
            },
            orderBy: {
              startTime: 'desc'
            },
            take: 5
          }
        }
      }
    }
  });

  if (!teacher) {
    return <div>Teacher not found</div>;
  }

  // Transform lessons into schedule events
  const lessonEvents = teacher.lessons.map(lesson => ({
    id: `lesson-${lesson.id}`,
    title: `${lesson.subject.name} - ${lesson.name}`,
    description: `Class ${lesson.class.name} - Grade ${lesson.class.grade.level}`,
    date: new Date(lesson.startTime),
    startTime: format(new Date(lesson.startTime), 'HH:mm'),
    endTime: format(new Date(lesson.endTime), 'HH:mm'),
    duration: Math.round((new Date(lesson.endTime).getTime() - new Date(lesson.startTime).getTime()) / (1000 * 60)),
    category: 'class',
    location: `Class ${lesson.class.name}`,
    color: '#e0f2fe',
    priority: 'high' as const,
    type: 'lesson' as const
  }));

  // Dashboard KPIs
  const uniqueStudentIds = new Set<string>();
  teacher.classes.forEach(cls => {
    cls.students.forEach(enrollment => {
      // @ts-ignore - prisma includes student relation with id
      uniqueStudentIds.add(enrollment.student.id);
    });
  });

  const totalClasses = teacher.classes.length;
  const totalStudents = uniqueStudentIds.size;
  const lessonsToday = teacher.lessons.filter(lesson => isSameDay(new Date(lesson.startTime), new Date())).length;
  const upcomingExams = teacher.classes.flatMap(c => c.exams).filter(exam => new Date(exam.startTime) > new Date()).length;

  // Weekly attendance trend (last 7 days, percentage present)
  type AttendanceRecord = { key: string; status: string };
  const attendanceMap = new Map<string, AttendanceRecord>();
  teacher.lessons.forEach(lesson => {
    lesson.class.students.forEach(enrollment => {
      // @ts-ignore
      const studentId = enrollment.student.id as string;
      // @ts-ignore
      enrollment.student.attendances.forEach((att: { date: Date; status: string }) => {
        const dateKey = format(new Date(att.date), "yyyy-MM-dd");
        const key = `${studentId}-${dateKey}`;
        if (!attendanceMap.has(key)) {
          attendanceMap.set(key, { key: dateKey, status: att.status });
        }
      });
    });
  });

  const last7Days: Date[] = Array.from({ length: 7 }).map((_, idx) => subDays(new Date(), 6 - idx));
  const weeklyAttendanceData = last7Days.map(d => {
    const dateKey = format(d, "yyyy-MM-dd");
    const records = Array.from(attendanceMap.values()).filter(r => r.key === dateKey);
    const total = records.length;
    const present = records.filter(r => r.status === "PRESENT").length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    return { day: format(d, "EEE"), attendance: percentage };
  });

  // Class performance averages (from latest results per student)
  const performanceData = teacher.classes.map(cls => {
    const scores: number[] = [];
    cls.students.forEach(enrollment => {
      const score = enrollment.student.results?.[0]?.score as number | undefined;
      if (typeof score === "number") scores.push(score);
    });
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    return {
      name: `${cls.name} (G${cls.grade.level})`,
      class: cls.name,
      averageScore: avg,
    };
  });

  return (
    <div className="p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT SIDE */}
      <div className="w-full xl:w-2/3 flex flex-col gap-4">
        {/* Hero / Teacher Info */}
        <div className="bg-gradient-to-r from-indigo-50 to-white p-6 rounded-xl border border-indigo-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {teacher.name} {teacher.surname}</h1>
              <p className="text-sm text-gray-600 mt-1">ID: {teacher.teacherId} • {teacher.email}</p>
              <p className="text-sm text-gray-600">Phone: {teacher.phone}</p>
            </div>
          </div>
          {/* KPI Cards */}
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-blue-100 rounded-lg p-4 shadow-sm border border-blue-200">
              <div className="flex items-center gap-2 text-blue-700 text-xs"><GraduationCap className="w-4 h-4" /> Classes</div>
              <div className="text-2xl font-semibold mt-1 text-blue-800">{totalClasses}</div>
            </div>
            <div className="bg-green-100 rounded-lg p-4 shadow-sm border border-green-200">
              <div className="flex items-center gap-2 text-green-700 text-xs"><Users className="w-4 h-4" /> Students</div>
              <div className="text-2xl font-semibold mt-1 text-green-800">{totalStudents}</div>
            </div>
            <div className="bg-yellow-100 rounded-lg p-4 shadow-sm border border-yellow-200">
              <div className="flex items-center gap-2 text-yellow-700 text-xs"><CalendarDays className="w-4 h-4" /> Lessons Today</div>
              <div className="text-2xl font-semibold mt-1 text-yellow-800">{lessonsToday}</div>
            </div>
            <div className="bg-red-100 rounded-lg p-4 shadow-sm border border-red-200">
              <div className="flex items-center gap-2 text-red-700 text-xs"><BarChart3 className="w-4 h-4" /> Upcoming Exams</div>
              <div className="text-2xl font-semibold mt-1 text-red-800">{upcomingExams}</div>
            </div>
          </div>
        </div>

    
        {/* Schedule */}
        <div className="bg-white p-4 rounded-xl border">
          <h1 className="text-xl font-semibold mb-4">Schedule</h1>
          <Tabs defaultValue="agenda" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="card" className="data-[state=active]:bg-gray-100">Card View</TabsTrigger>
              <TabsTrigger value="timeline" className="data-[state=active]:bg-gray-100">Timeline View</TabsTrigger>
              <TabsTrigger value="agenda" className="data-[state=active]:bg-gray-100">Agenda View</TabsTrigger>
            </TabsList>

            <TabsContent value="card">
              <CardSchedule events={lessonEvents} initialDate={new Date()} />
            </TabsContent>

            <TabsContent value="timeline">
              <TimelineSchedule events={lessonEvents} initialDate={new Date()} />
            </TabsContent>

            <TabsContent value="agenda">
              <AgendaSchedule events={lessonEvents} initialDate={new Date()} daysToShow={7} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Classes Overview */}
        <div className="bg-white p-4 rounded-xl border">
          <h1 className="text-xl font-semibold mb-4">Classes Overview</h1>
          <div className="space-y-4">
            {teacher.classes.map((class_) => (
              <div key={class_.id} className="border-b pb-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-medium">Class {class_.name} - Grade {class_.grade.level}</h2>
                  <span className="text-sm text-gray-500">{class_.students.length} Students</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Recent Results</p>
                    <div className="mt-1">
                      {class_.students.slice(0, 3).map(enrollment => (
                        <div key={enrollment.id} className="flex justify-between">
                          <span>{enrollment.student.name}</span>
                          <span>{enrollment.student.results[0]?.score || 'N/A'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500">Upcoming Exams</p>
                    <div className="mt-1">
                      {class_.exams.slice(0, 3).map(exam => (
                        <div key={exam.id} className="flex justify-between">
                          <span>{exam.subject.name}</span>
                          <span>{format(new Date(exam.startTime), "dd MMM")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        {/* Recent Attendance Overview */}
        <div className="bg-white p-4 rounded-xl border">
          <h1 className="text-xl font-semibold mb-4">Recent Attendance Overview</h1>
          <div className="space-y-4">
            {teacher.lessons.map(lesson => (
              <div key={lesson.id} className="border-b pb-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-medium">{lesson.subject.name}</h2>
                  <span className="text-sm text-gray-500">Class {lesson.class.name}</span>
                </div>
                <div className="space-y-2">
                  {lesson.class.students.slice(0, 3).map(enrollment => {
                    const recentAttendance = enrollment.student.attendances[0];
                    return (
                      <div key={enrollment.id} className="flex justify-between items-center">
                        <span className="text-sm">{enrollment.student.name}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          recentAttendance?.status === "PRESENT" ? "bg-green-100 text-green-800" :
                          recentAttendance?.status === "ABSENT" ? "bg-red-100 text-red-800" :
                          "bg-yellow-100 text-yellow-800"
                        }`}>
                          {recentAttendance?.status || 'N/A'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Exams */}
        <div className="bg-white p-4 rounded-xl border">
          <h1 className="text-xl font-semibold mb-4">Upcoming Exams</h1>
          <div className="space-y-4">
            {teacher.classes.flatMap(class_ => class_.exams)
              .filter(exam => new Date(exam.startTime) > new Date())
              .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
              .slice(0, 5)
              .map(exam => (
                <div key={exam.id} className="border-b pb-4">
                  <div className="font-medium">{exam.title}</div>
                  <div className="text-sm text-gray-500">
                    {exam.subject.name} &bull; {format(new Date(exam.startTime), "dd MMM yyyy, hh:mm a")}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Announcements */}
        <Announcements />
      </div>
    </div>
  );
};

export default TeacherPage;
