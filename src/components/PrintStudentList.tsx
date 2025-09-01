'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  surname: string;
  StudentId: string;
  email?: string | null;
  phone?: string | null;
  parent?: {
    name?: string | null;
    surname?: string | null;
    phone?: string | null;
  } | null;
}

interface PrintStudentListProps {
  students: Student[];
  className: string;
  currentYear?: string;
}

export default function PrintStudentList({ students, className, currentYear }: PrintStudentListProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    setIsPrinting(true);
    
    // Use browser's print functionality
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Student List - ${className}</title>
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
              .class-info { 
                font-size: 18px; 
                margin-bottom: 5px;
              }
              .year-info { 
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
              .student-count { 
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
              <div class="class-info">Class: ${className}</div>
              ${currentYear ? `<div class="year-info">Academic Year: ${currentYear}</div>` : ''}
              <div class="print-date">Printed on: ${new Date().toLocaleDateString()}</div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Sr. No.</th>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Parent Name</th>
                  <th>Parent Phone</th>
                </tr>
              </thead>
              <tbody>
                ${students.map((student, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${student.StudentId || 'N/A'}</td>
                    <td>${student.name} ${student.surname}</td>
                    <td>${student.email || 'N/A'}</td>
                    <td>${student.phone || 'N/A'}</td>
                    <td>${student.parent ? `${student.parent.name || ''} ${student.parent.surname || ''}`.trim() || 'N/A' : 'N/A'}</td>
                    <td>${student.parent?.phone || 'N/A'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="student-count">
              Total Students: ${students.length}
            </div>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      
      // Wait for content to load then print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        setIsPrinting(false);
      }, 500);
    } else {
      // Fallback to regular print if popup is blocked
      window.print();
      setIsPrinting(false);
    }
  };

  return (
    <div>
      <Button
        onClick={handlePrint}
        disabled={isPrinting}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Printer className="h-4 w-4" />
        {isPrinting ? 'Printing...' : 'Print Student List'}
      </Button>
      
      {/* Hidden content for printing */}
      <div ref={printRef} className="hidden">
        <div className="print-content">
          <div className="header">
            <h1>Shree Narayani Gandaki</h1>
            <h2>Class: {className}</h2>
            {currentYear && <p>Academic Year: {currentYear}</p>}
            <p>Printed on: {new Date().toLocaleDateString()}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Sr. No.</th>
                <th>Student ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Parent Name</th>
                <th>Parent Phone</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student.id}>
                  <td>{index + 1}</td>
                  <td>{student.StudentId || 'N/A'}</td>
                  <td>{student.name} {student.surname}</td>
                  <td>{student.email || 'N/A'}</td>
                  <td>{student.phone || 'N/A'}</td>
                  <td>
                    {student.parent 
                      ? `${student.parent.name || ''} ${student.parent.surname || ''}`.trim() || 'N/A'
                      : 'N/A'
                    }
                  </td>
                  <td>{student.parent?.phone || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="student-count">
            Total Students: {students.length}
          </div>
        </div>
      </div>
    </div>
  );
}
