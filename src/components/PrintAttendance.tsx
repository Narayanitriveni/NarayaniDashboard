'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ADToBS } from 'bikram-sambat-js';
import { getAllStudentAttendanceForPrint, getAllTeacherAttendanceForPrint } from '@/lib/actions';

interface AttendanceRecord {
  id: string | number;
  date: Date;
  status: string;
  inTime?: string | null;
  outTime?: string | null;
  student?: {
    name: string;
    surname: string;
    StudentId: string;
  };
  teacher?: {
    name: string;
    surname: string;
  };
  lesson?: {
    name: string;
  };
  class?: {
    name: string;
  };
}

interface PrintAttendanceProps {
  type: 'student' | 'teacher';
  className?: string;
  currentYear?: string;
}

type TimeRange = 'daily' | 'weekly' | 'monthly';

export default function PrintAttendance({ type, className, currentYear }: PrintAttendanceProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('daily');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const nepaliMonths = [
    'बैशाख', 'जेठ', 'आषाढ', 'श्रावण', 'भाद्र', 'आश्विन',
    'कार्तिक', 'मंसिर', 'पौष', 'माघ', 'फाल्गुन', 'चैत्र'
  ];

  // Fetch attendance data when component mounts
  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        let result;
        if (type === 'student') {
          result = await getAllStudentAttendanceForPrint();
        } else {
          result = await getAllTeacherAttendanceForPrint();
        }

        if (result.success && result.data) {
          // Transform the data to match our interface
          const transformedRecords = result.data.map((record: any) => {
            if (type === 'student') {
              return {
                id: record.id,
                date: new Date(record.date),
                status: record.status,
                inTime: record.inTime,
                outTime: record.outTime,
                student: {
                  name: record.student?.name || '',
                  surname: record.student?.surname || '',
                  StudentId: record.student?.StudentId || ''
                },
                lesson: {
                  name: record.lesson?.name || 'General'
                },
                class: {
                  name: record.student?.enrollments?.[0]?.class?.name || ''
                }
              };
            } else {
              return {
                id: record.id,
                date: new Date(record.date),
                status: record.status,
                inTime: record.inTime,
                outTime: record.outTime,
                teacher: {
                  name: record.teacher?.name || '',
                  surname: record.teacher?.surname || ''
                }
              };
            }
          });
          
          setRecords(transformedRecords);
        } else {
          setError(result.message || 'Failed to fetch attendance data');
        }
      } catch (err: any) {
        console.error('Error fetching attendance data:', err);
        setError(err.message || 'Failed to fetch attendance data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendanceData();
  }, [type]);

  const formatBSDate = (date: Date) => {
    const bsDate = ADToBS(date.toISOString().split('T')[0]);
    const [year, month, day] = bsDate.split('-').map(Number);
    return `${nepaliMonths[month - 1]} ${day}, ${year}`;
  };

  const getFilteredRecords = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (timeRange) {
      case 'daily':
        return records.filter(record => {
          const recordDate = new Date(record.date);
          const recordDateOnly = new Date(recordDate.getFullYear(), recordDate.getMonth(), recordDate.getDate());
          return recordDateOnly.getTime() === today.getTime();
        });
      case 'weekly':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return records.filter(record => {
          const recordDate = new Date(record.date);
          const recordDateOnly = new Date(recordDate.getFullYear(), recordDate.getMonth(), recordDate.getDate());
          return recordDateOnly >= weekAgo && recordDateOnly <= today;
        });
      case 'monthly':
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        return records.filter(record => {
          const recordDate = new Date(record.date);
          const recordDateOnly = new Date(recordDate.getFullYear(), recordDate.getMonth(), recordDate.getDate());
          return recordDateOnly >= monthAgo && recordDateOnly <= today;
        });
      default:
        return records;
    }
  };

  const getTimeRangeText = () => {
    switch (timeRange) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      default: return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'bg-green-100 text-green-800';
      case 'ABSENT': return 'bg-red-100 text-red-800';
      case 'LATE': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePrint = () => {
    setIsPrinting(true);
    const filteredRecords = getFilteredRecords();
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${getTimeRangeText()} Attendance - ${type === 'student' ? 'Students' : 'Teachers'}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 20px; 
                font-size: 12px;
              }
              .header { 
                text-align: center; 
                margin-bottom: 30px; 
                border-bottom: 2px solid #333; 
                padding-bottom: 20px;
              }
              .school-name { 
                font-size: 24px; 
                font-weight: bold; 
                margin-bottom: 10px;
              }
              .title { 
                font-size: 18px; 
                margin-bottom: 5px;
              }
              .subtitle { 
                font-size: 14px; 
                color: #666;
              }
              .print-date { 
                font-size: 12px; 
                color: #666; 
                margin-top: 10px;
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 20px;
              }
              th, td { 
                border: 1px solid #ddd; 
                padding: 8px; 
                text-align: left;
              }
              th { 
                background-color: #f2f2f2; 
                font-weight: bold;
              }
              .status-present { background-color: #d1fae5; color: #065f46; }
              .status-absent { background-color: #fee2e2; color: #991b1b; }
              .status-late { background-color: #fef3c7; color: #92400e; }
              .summary { 
                margin-top: 20px; 
                font-weight: bold;
              }
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="school-name">Shree Narayani Gandaki</div>
              <div class="title">${getTimeRangeText()} Attendance Report</div>
              <div class="subtitle">${type === 'student' ? 'Students' : 'Teachers'}${className ? ` - ${className}` : ''}</div>
              ${currentYear ? `<div class="subtitle">Academic Year: ${currentYear}</div>` : ''}
              <div class="print-date">Printed on: ${new Date().toLocaleDateString()}</div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Sr. No.</th>
                  <th>${type === 'student' ? 'Student ID' : 'Teacher'}</th>
                  <th>Name</th>
                  ${type === 'student' ? '<th>Class</th><th>Lesson</th>' : ''}
                  <th>Date (BS)</th>
                  ${type === 'teacher' ? '<th>In Time</th><th>Out Time</th>' : ''}
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${filteredRecords.map((record, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${type === 'student' ? (record.student?.StudentId || '') : ''}</td>
                    <td>${type === 'student' ? `${record.student?.name || ''} ${record.student?.surname || ''}` : `${record.teacher?.name || ''} ${record.teacher?.surname || ''}`}</td>
                    ${type === 'student' ? `<td>${record.class?.name || ''}</td><td>${record.lesson?.name || 'General'}</td>` : ''}
                    <td>${formatBSDate(new Date(record.date))}</td>
                    ${type === 'teacher' ? `<td>${record.inTime || '-'}</td><td>${record.outTime || '-'}</td>` : ''}
                    <td class="status-${record.status.toLowerCase()}">${record.status}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="summary">
              <p>Total Records: ${filteredRecords.length}</p>
              <p>Present: ${filteredRecords.filter(r => r.status === 'PRESENT').length}</p>
              <p>Absent: ${filteredRecords.filter(r => r.status === 'ABSENT').length}</p>
              <p>Late: ${filteredRecords.filter(r => r.status === 'LATE').length}</p>
            </div>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        setIsPrinting(false);
      }, 500);
    } else {
      window.print();
      setIsPrinting(false);
    }
  };

  const filteredRecords = getFilteredRecords();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">Loading attendance data...</span>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-red-500">Error: {error}</span>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline" 
          size="sm"
        >
          Retry
        </Button>
      </div>
    );
  }

  // Debug info
  console.log(`TimeRange: ${timeRange}, Total Records: ${records.length}, Filtered: ${filteredRecords.length}`);

  return (
    <div className="flex items-center gap-3">
      <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="daily">Daily</SelectItem>
          <SelectItem value="weekly">Weekly</SelectItem>
          <SelectItem value="monthly">Monthly</SelectItem>
        </SelectContent>
      </Select>
      
      <Button
        onClick={handlePrint}
        disabled={isPrinting || filteredRecords.length === 0}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Printer className="h-4 w-4" />
        {isPrinting ? 'Printing...' : `Print ${getTimeRangeText()} Attendance`}
      </Button>
      
      {filteredRecords.length === 0 && (
        <span className="text-sm text-gray-500">No records for selected period</span>
      )}
    </div>
  );
}
