import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

// Type definitions for Bikram Sambat functionality
interface BSDate {
  year: number;
  month: number;
  day: number;
}

interface BSCalendarData {
  year: number;
  month: number;
  monthName: string;
  daysInMonth: number;
  startDay: number; // 0 = Sunday, 1 = Monday, etc.
}

interface BikramSambatDatePickerProps {
  onDateSelect?: (date: BSDate) => void;
}

// Bikram Sambat utility functions (simplified implementation)
class BikramSambat {
  private static monthNames = [
    'बैशाख', 'जेठ', 'आषाढ', 'श्रावण', 'भाद्र', 'आश्विन',
    'कार्तिक', 'मंसिर', 'पौष', 'माघ', 'फाल्गुन', 'चैत्र'
  ];

  private static monthNamesEn = [
    'Baisakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin',
    'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
  ];

  private static daysInMonths: { [key: string]: number[] } = {
    '2081': [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    '2082': [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    '2083': [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  };

  static getCurrentBSDate(): BSDate {
    // Simplified - in real implementation, convert from current AD date
    return { year: 2081, month: 8, day: 15 }; // Example current date
  }

  static getMonthName(month: number, nepali = false): string {
    return nepali ? this.monthNames[month - 1] : this.monthNamesEn[month - 1];
  }

  static getDaysInMonth(year: number, month: number): number {
    const yearData = this.daysInMonths[year.toString()];
    return yearData ? yearData[month - 1] : 30; // Default to 30 if data not available
  }

  static getStartDayOfMonth(year: number, month: number): number {
    // Simplified calculation - in real implementation, this would be calculated properly
    return (year + month) % 7;
  }

  static isValidDate(year: number, month: number, day: number): boolean {
    if (month < 1 || month > 12) return false;
    if (day < 1) return false;
    return day <= this.getDaysInMonth(year, month);
  }
}

const BikramSambatDatePicker: React.FC<BikramSambatDatePickerProps> = ({ onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState<BSDate>(BikramSambat.getCurrentBSDate());
  const [selectedDate, setSelectedDate] = useState<BSDate | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [viewYear, setViewYear] = useState<number>(currentDate.year);
  const [viewMonth, setViewMonth] = useState<number>(currentDate.month);

  const dayNames = ['आइत', 'सोम', 'मंगल', 'बुध', 'बिहि', 'शुक्र', 'शनि'];
  const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const generateCalendar = (): (number | null)[][] => {
    const daysInMonth = BikramSambat.getDaysInMonth(viewYear, viewMonth);
    const startDay = BikramSambat.getStartDayOfMonth(viewYear, viewMonth);
    
    const calendar: (number | null)[][] = [];
    let week: (number | null)[] = [];
    ;
    // Fill empty cells before the first day
    for (let i = 0; i < startDay; i++) {
      week.push(null);
    }
    
    // Fill the days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      week.push(day);
      
      if (week.length === 7) {
        calendar.push(week);
        week = [];
      }
    }
    
    // Fill remaining empty cells
    while (week.length < 7 && week.length > 0) {
      week.push(null);
    }
    
    if (week.length > 0) {
      calendar.push(week);
    }
    
    return calendar;
  };

  const handleDateSelect = (day: number) => {
    const newDate: BSDate = { year: viewYear, month: viewMonth, day };
    setSelectedDate(newDate);
    setIsOpen(false);
    onDateSelect?.(newDate);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (viewMonth === 1) {
        setViewMonth(12);
        setViewYear(viewYear - 1);
      } else {
        setViewMonth(viewMonth - 1);
      }
    } else {
      if (viewMonth === 12) {
        setViewMonth(1);
        setViewYear(viewYear + 1);
      } else {
        setViewMonth(viewMonth + 1);
      }
    }
  };

  const isToday = (day: number): boolean => {
    return (
      day === currentDate.day &&
      viewMonth === currentDate.month &&
      viewYear === currentDate.year
    );
  };

  const isSelected = (day: number): boolean => {
    return (
      selectedDate !== null &&
      day === selectedDate.day &&
      viewMonth === selectedDate.month &&
      viewYear === selectedDate.year
    );
  };

  const formatSelectedDate = (): string => {
    if (!selectedDate) return 'Select Date';
    return `${selectedDate.year}/${selectedDate.month.toString().padStart(2, '0')}/${selectedDate.day.toString().padStart(2, '0')}`;
  };

  const calendar = generateCalendar();

  return (
    <div className="relative w-80 mx-auto p-4">
      <div className="mb-4">
        {/* <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">
          बिक्रम संवत् मिति छान्नुहोस्
        </h2> */}
        {/* <p className="text-center text-gray-600">Bikram Sambat Date Picker</p> */}
      </div>

      {/* Date Input Display */}
      <div
        className="w-full p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors flex items-center justify-between bg-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`${selectedDate ? 'text-gray-800' : 'text-gray-500'}`}>
          {formatSelectedDate()}
        </span>
        <Calendar className="w-5 h-5 text-gray-500" />
      </div>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-lg z-10">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="text-center">
              <div className="font-semibold text-lg text-gray-800">
                {BikramSambat.getMonthName(viewMonth, true)} {viewYear}
              </div>
              <div className="text-sm text-gray-600">
                {BikramSambat.getMonthName(viewMonth)} {viewYear}
              </div>
            </div>
            
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-gray-200">
            {dayNames.map((day, index) => (
              <div
                key={index}
                className="p-2 text-center text-sm font-medium text-gray-600 border-r border-gray-100 last:border-r-0"
              >
                <div>{day}</div>
                <div className="text-xs">{dayNamesEn[index]}</div>
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="p-2">
            {calendar.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-1">
                {week.map((day, dayIndex) => (
                  <div key={dayIndex} className="aspect-square">
                    {day && (
                      <button
                        onClick={() => handleDateSelect(day)}
                        className={`
                          w-full h-full rounded-lg text-sm font-medium transition-all duration-200
                          ${isSelected(day)
                            ? 'bg-blue-500 text-white shadow-md'
                            : isToday(day)
                            ? 'bg-red-100 text-red-600 border border-red-300'
                            : 'hover:bg-gray-100 text-gray-700'
                          }
                        `}
                      >
                        {day}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 text-center">
            <button
              onClick={() => {
                setSelectedDate(currentDate);
                setViewYear(currentDate.year);
                setViewMonth(currentDate.month);
                setIsOpen(false);
              }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              आजको मिति (Today)
            </button>
          </div>
        </div>
      )}

      {/* Selected Date Display */}
      {selectedDate && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">चयनित मिति:</h3>
          <div className="text-lg font-bold text-blue-900">
            {BikramSambat.getMonthName(selectedDate.month, true)} {selectedDate.day}, {selectedDate.year}
          </div>
          <div className="text-sm text-blue-700">
            {BikramSambat.getMonthName(selectedDate.month)} {selectedDate.day}, {selectedDate.year}
          </div>
        </div>
      )}
    </div>
  );
};

export default BikramSambatDatePicker;