"use client";

import React, { useState } from "react";
import FinancialSummaryCard from '@/components/FinancialSummaryCard';
import { IndianRupee, TrendingUp, TrendingDown, PieChart } from 'lucide-react';
import SummaryTypeSelector, { SummaryType } from '@/components/SummaryTypeSelector';

interface AccountantSummarySectionProps {
  summaryData: {
    day: { revenue: number; expenses: number };
    week: { revenue: number; expenses: number };
    month: { revenue: number; expenses: number };
    total: { revenue: number; expenses: number };
  };
}

const AccountantSummarySection: React.FC<AccountantSummarySectionProps> = ({ summaryData }) => {
  const [type, setType] = useState<SummaryType>('total');
  const data = summaryData[type];
  const outstanding = 0; // Not calculated in this section

  const cards = [
    {
      title: 'Total Revenue',
      amount: `₹${Number(data.revenue).toLocaleString()}`,
      icon: <IndianRupee className="text-green-800" />, color: '#dcfce7',
    },
    {
      title: 'Total Expenses',
      amount: `₹${Number(data.expenses).toLocaleString()}`,
      icon: <TrendingUp className="text-yellow-800" />, color: '#fef9c3',
    },
    {
      title: 'Net Profit',
      amount: `₹${(Number(data.revenue) - Number(data.expenses)).toLocaleString()}`,
      icon: <PieChart className="text-blue-800" />, color: '#dbeafe',
    },
  ];

  return (
    <div className="mb-6">
      <div className="flex items-center mb-4">
        <span className="mr-2 font-medium">Summary Type:</span>
        <SummaryTypeSelector value={type} onChange={setType} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map(item => (
          <FinancialSummaryCard key={item.title} {...item} />
        ))}
      </div>
    </div>
  );
};

export default AccountantSummarySection; 