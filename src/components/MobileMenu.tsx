"use client";

import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const menuItems = [
  {
    title: "MENU",
    items: [
      {
        icon: "/home.png",
        label: "Home",
        href: "/",
        visible: ["admin", "teacher", "student", "parent","accountant"],
        color: "bg-blue-50"
      },
      {
        icon: "/teacher.png",
        label: "Teachers",
        href: "/list/teachers",
        visible: ["admin", "teacher","accountant"],
        color: "bg-purple-50"
      },
      {
        icon: "/student.png",
        label: "Students",
        href: "/list/students",
        visible: ["admin", "teacher","accountant"],
        color: "bg-green-50"
      },
      {
        icon: "/parent.png",
        label: "Parents",
        href: "/list/parents",
        visible: ["admin", "teacher","accountant"],
        color: "bg-yellow-50"
      },
      {
        icon: "/accountant.png",
        label: "Accountants",
        href: "/list/accountants",
        visible: ["admin"],
        color: "bg-cyan-50"
      },
      {
        icon: "/badge-indian-rupee1.png",
        label: "Fees",
        href: "/list/fees",
        visible: ["admin","accountant"],
        color: "bg-red-50"
      },
      {
        icon: "/payments.png",
        label: "Payments",
        href: "/list/payments",
        visible: ["admin","accountant"],
        color: "bg-pink-50"
      },
      {
        icon: "/wallet.png",
        label: "Finance",
        href: "/list/finance",
        visible: ["admin","accountant"],
        color: "bg-indigo-50"
      },
      {
        icon: "/attendance.png",
        label: "Attendance",
        href: "/list/attendance",
        visible: ["admin", "teacher", "student", "parent","accountant"],
        color: "bg-orange-50"
      },
      {
        icon: "/attendance.png",
        label: "Teacher Attendance",
        href: "/list/teacherattendance",
        visible: ["admin", "teacher","accountant"],
        color: "bg-teal-50"
      },
      {
        icon: "/subject.png",
        label: "Subjects",
        href: "/list/subjects",
        visible: ["admin"],
        color: "bg-cyan-50"
      },
      {
        icon: "/class.png",
        label: "Classes",
        href: "/list/classes",
        visible: ["admin", "teacher"],
        color: "bg-emerald-50"
      },
      {
        icon: "/lesson.png",
        label: "Lessons",
        href: "/list/lessons",
        visible: ["admin", "teacher"],
        color: "bg-violet-50"
      },
      {
        icon: "/exam.png",
        label: "Exams",
        href: "/list/exams",
        visible: ["admin", "teacher", "student", "parent"],
        color: "bg-fuchsia-50"
      },
      {
        icon: "/assignment.png",
        label: "Assignments",
        href: "/list/assignments",
        visible: ["admin", "teacher", "student", "parent"],
        color: "bg-rose-50"
      },
      {
        icon: "/result.png",
        label: "Results",
        href: "/list/results",
        visible: ["admin", "teacher", "student", "parent","accountant"],
        color: "bg-sky-50"
      },
      {
        icon: "/calendar.png",
        label: "Events",
        href: "/list/events",
        visible: ["admin", "teacher", "student", "parent","accountant"],
        color: "bg-lime-50"
      },
      {
        icon: "/announcement.png",
        label: "Announcements",
        href: "/list/announcements",
        visible: ["admin", "teacher", "student", "parent","accountant"],
        color: "bg-amber-50"
      },
    ],
  },
];

const MobileMenu = ({ user, onClose }: { user: { fullName?: string; role?: string }; onClose: () => void }) => {
  const router = useRouter();
  const role = user?.role;

  const handleNavigation = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* HEADER */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{user?.fullName}</h2>
            <p className="text-sm text-gray-500 capitalize">{role}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* MENU ITEMS */}
      <div className="flex-1 overflow-y-auto p-4">
        {menuItems.map((section) => (
          <div key={section.title} className="space-y-2">
            {section.items.map((item) => {
              if (role && item.visible.includes(role)) {
                return (
                  <button
                    key={item.label}
                    onClick={() => handleNavigation(item.href)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl ${item.color} hover:shadow-md transition-all duration-200 touch-manipulation text-left`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${item.color} shadow-sm`}>
                      <Image 
                        src={item.icon} 
                        alt={item.label} 
                        width={24} 
                        height={24} 
                        className="flex-shrink-0" 
                      />
                    </div>
                    <span className="text-base font-medium text-gray-700">{item.label}</span>
                  </button>
                );
              }
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MobileMenu;
