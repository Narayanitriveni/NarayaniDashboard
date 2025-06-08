/* eslint-disable @next/next/no-img-element */
import { format } from 'date-fns';
import { ADToBS } from 'bikram-sambat-js';

type StudentWithDetails = {
  id: string;
  name: string;
  surname: string;
  StudentId: string;
  bloodType: string;
  birthday: Date;
  phone: string | null;
  img: string | null;
  address: string;
  sex: 'MALE' | 'FEMALE';
  class: {
    name: string;
  };
  grade: {
    level: number;
  };
  parent?: {
    name: string;
    surname: string;
    phone: string;
  } | null;
};

export const StudentIDCard = ({ 
  student,
  schoolYear = "2023-2024",
  expiryDate = "2024-07-31"
}: { 
  student: StudentWithDetails;
  schoolYear?: string;
  expiryDate?: string;
}) => {
  const nepaliMonths = [
    'बैशाख', 'जेठ', 'आषाढ', 'श्रावण', 'भाद्र', 'आश्विन',
    'कार्तिक', 'मंसिर', 'पौष', 'माघ', 'फाल्गुन', 'चैत्र'
  ];

  const formatBSDate = (date: Date) => {
    const bsDate = ADToBS(date.toISOString().split('T')[0]);
    const [year, month, day] = bsDate.split('-').map(Number);
    return `${nepaliMonths[month - 1]} ${day}, ${year}`;
  };

  const formattedBirthday = formatBSDate(new Date(student.birthday));

  return (
    <div id="student-id-card" className="bg-white rounded-lg shadow-xl overflow-hidden w-80 mx-auto">
      {/* Header with school name and logo */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-white p-1 rounded-full">
              <img 
                src="/logo.png" 
                alt="School Logo" 
                width={32} 
                height={32} 
                className="h-8 w-8" 
                crossOrigin="anonymous"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Academix School</h1>
              <p className="text-xs text-blue-100">Student Identification</p>
            </div>
          </div>
        </div>
      </div>

      {/* Photo and basic info */}
      <div className="p-4">
        <div className="flex gap-4">
          <div className="w-24 h-32 bg-gray-100 rounded-lg overflow-hidden">
            {student.img ? (
              <img
                src={student.img}
                alt={`${student.name}'s photo`}
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No Photo
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">{student.name} {student.surname}</h2>
            <p className="text-sm text-gray-600">ID: {student.StudentId}</p>
            <p className="text-sm text-gray-600">Class: {student.class.name}</p>
            <p className="text-sm text-gray-600">Grade: {student.grade.level}</p>
          </div>
        </div>
      </div>

      {/* Additional details */}
      <div className="px-4 pb-3">
        <div className="border-t pt-3 grid grid-cols-2 gap-x-2 gap-y-1">
          <div className="text-sm flex flex-col space-y-1">
            <div>
              <span className="text-gray-500 text-xs">DOB:</span>
              <p className="font-medium text-gray-700">{formattedBirthday}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">Blood:</span>
              <p className="font-medium text-gray-700">{student.bloodType}</p>
            </div>
          </div>
          <div className="text-sm flex flex-col space-y-1">
            <div>
              <span className="text-gray-500 text-xs">Gender:</span>
              <p className="font-medium text-gray-700">{student.sex === 'MALE' ? 'Male' : 'Female'}</p>
            </div>
            {student.phone && (
              <div>
                <span className="text-gray-500 text-xs">Phone:</span>
                <p className="font-medium text-gray-700">{student.phone}</p>
              </div>
            )}
          </div>
        </div>

        {student.parent && (
          <div className="mt-2 pt-2 border-t border-dashed border-gray-200">
            <h3 className="text-xs text-gray-500 mb-1">Emergency Contact:</h3>
            <p className="text-xs font-medium">{student.parent.name} {student.parent.surname}</p>
            <p className="text-xs">{student.parent.phone}</p>
          </div>
        )}
      </div>

      {/* Validity info */}
      <div className="bg-blue-50 px-4 py-2 border-t border-blue-100">
        <div className="flex justify-between text-xs">
          <div>
            <p className="text-gray-500">School Year</p>
            <p className="font-semibold text-gray-800">{schoolYear}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500">Valid Until</p>
            <p className="font-semibold text-gray-800">{expiryDate}</p>
          </div>
        </div>
      </div>

      {/* Footer with barcode */}
      <div className="bg-gray-50 p-2 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500 flex-1">
            <p>If found, please return to:</p>
            <p className="font-medium">Academix School</p>
          </div>
          <div className="w-24">
            <div className="h-10">
              <div className="h-full flex items-end">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="h-full bg-gray-900 w-1 mx-0.5" 
                    style={{ height: `${Math.max(40, Math.random() * 100)}%` }}
                  />
                ))}
              </div>
            </div>
            <p className="text-center text-xs text-gray-500 mt-1">{student.StudentId}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
