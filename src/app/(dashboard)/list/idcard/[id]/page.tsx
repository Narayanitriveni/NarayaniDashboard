'use client';

import { StudentIDCard } from '@/components/StudentIDCard';
import { useEffect, useState, useRef } from 'react';
import { getStudentIdCardData } from '@/lib/actions';
import html2pdf from 'html2pdf.js';
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

export default function IDCardPage(props: { params: { id: string } }) {
  const { id } = props.params;
  const [student, setStudent] = useState<StudentWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Get current BS year
  const currentDate = new Date();
  const bsDate = ADToBS(currentDate.toISOString().split('T')[0]);
  const currentBSYear = parseInt(bsDate.split('-')[0]);
  const schoolYear = `${currentBSYear}-${currentBSYear + 1}`;
  
  // Set expiry date to end of current BS year
  const expiryDate = `31/12/${currentBSYear + 1}`;

  useEffect(() => {
    async function fetchStudentData() {
      try {
        setLoading(true);
        const response = await getStudentIdCardData(id);
        if (response.success && response.data) {
          setStudent(response.data);
        } else {
          setError(response.message || 'Failed to load student data');
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchStudentData();
  }, [id]);

  const handleDownload = async () => {
    if (!cardRef.current) return;

    setIsGenerating(true);
    try {
      const element = cardRef.current;
      const opt = {
        margin: 0,
        filename: `student-id-card-${student?.StudentId}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-lg font-semibold">Loading...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-lg font-semibold text-red-500">{error}</h2>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-lg font-semibold text-red-500">Student data not found</h2>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-center">Student ID Card</h1>
        <div className="bg-white rounded-lg shadow-md overflow-hidden" ref={cardRef}>
          <StudentIDCard 
            student={student}
            schoolYear={schoolYear}
            expiryDate={expiryDate}
          />
        </div>
        <div className="text-center mt-6">
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className={`px-6 py-3 ${
              isGenerating 
                ? 'bg-gray-400' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white rounded-md transition-colors shadow-md`}
          >
            {isGenerating 
              ? 'Generating PDF...' 
              : 'Download ID Card'}
          </button>
          <p className="mt-3 text-sm text-gray-500">
            {isGenerating 
              ? 'Please wait while we prepare your PDF...' 
              : 'ID card will be downloaded as a PDF document'}
          </p>
        </div>
      </div>
    </div>
  );
}