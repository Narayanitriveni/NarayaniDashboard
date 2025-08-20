import Image from "next/image";
import EventCalendar from "./EventCalendar";
import EventList from "./EventList";

const EventCalendarContainer = async ({
  searchParams,
}: {
  searchParams: { [keys: string]: string | undefined };
}) => {
  const { date } = searchParams;
  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-lg shadow-sm border border-gray-100">
      <EventCalendar initialDate={date} />
      <div className="flex items-center justify-between mt-4 sm:mt-6">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-800">Events</h1>
        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation">
          <Image src="/moreDark.png" alt="More options" width={20} height={20} />
        </button>
      </div>
      <div className="flex flex-col gap-3 sm:gap-4 mt-4">
        <EventList dateParam={date} />
      </div>
    </div>
  );
};

export default EventCalendarContainer;
