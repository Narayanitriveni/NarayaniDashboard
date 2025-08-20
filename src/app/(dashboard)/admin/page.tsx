import Announcements from "@/components/Announcements";
import AttendanceChartContainer from "@/components/AttendanceChartContainer";
import CountChartContainer from "@/components/CountChartContainer";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import FinanceChart from "@/components/FinanceChart";
import FinanceChartContainer from "@/components/FinanceChartContainer";
import UserCard from "@/components/UserCard";

const AdminPage = async (
  props: {
    searchParams: Promise<{ [keys: string]: string | undefined }>;
  }
) => {
  const searchParams = await props.searchParams;
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-first responsive layout */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* USER CARDS - Mobile optimized grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          <UserCard type="admin" />
          <UserCard type="teacher" />
          <UserCard type="student" />
          <UserCard type="parent" />
        </div>
        
        {/* CHARTS SECTION - Mobile stacked, desktop side-by-side */}
        <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6">
          {/* COUNT CHART */}
          <div className="w-full h-[350px] sm:h-[400px] lg:h-[450px]">
            <CountChartContainer />
          </div>
          {/* ATTENDANCE CHART */}
          <div className="w-full h-[350px] sm:h-[400px] lg:h-[450px] lg:col-span-2">
            <AttendanceChartContainer />
          </div>
        </div>
        
        {/* FINANCE CHART - Full width */}
        <div className="w-full h-[400px] sm:h-[450px] lg:h-[500px]">
          <FinanceChartContainer />
        </div>
        
        {/* SIDEBAR CONTENT - Mobile stacked, desktop side-by-side */}
        <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-6">
          <EventCalendarContainer searchParams={searchParams}/>
          <Announcements />
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
