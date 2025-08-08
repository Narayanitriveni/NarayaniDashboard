"use client";

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import React from "react";

export type SummaryType = "day" | "week" | "month" | "total";

interface SummaryTypeSelectorProps {
  value: SummaryType;
  onChange: (value: SummaryType) => void;
}

const options: { label: string; value: SummaryType }[] = [
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Total", value: "total" },
];

const SummaryTypeSelector: React.FC<SummaryTypeSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="w-40">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-white border border-gray-300 focus:ring-2 focus:ring-blue-500">{/* Make select visible */}
          <SelectValue placeholder="Select summary type" />
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-200 shadow-lg">{/* Ensure dropdown is visible */}
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SummaryTypeSelector; 