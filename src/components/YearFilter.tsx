'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface YearFilterProps {
  currentYear?: string;
}

export default function YearFilter({ currentYear }: YearFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Generate academic years (BS) from 2070 to 2090
  const academicYears = Array.from({ length: 21 }, (_, i) => 2070 + i);

  const handleYearChange = (year: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (year) {
      params.set('year', year);
    } else {
      params.delete('year');
    }
    
    // Reset to first page when filtering
    params.delete('page');
    
    router.push(`?${params.toString()}`);
  };

  return (
    <select
      className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
      value={currentYear || ""}
      onChange={(e) => handleYearChange(e.target.value)}
    >
      <option value="">All Years</option>
      {academicYears.map(year => (
        <option key={year} value={year}>
          {year}
        </option>
      ))}
    </select>
  );
} 