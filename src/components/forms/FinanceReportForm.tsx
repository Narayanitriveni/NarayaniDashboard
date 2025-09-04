"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "react-toastify";
import { z } from "zod";
import { ExpenseCategory, IncomeCategory, TransactionType } from "@prisma/client";
import { expenseCategoryNepali, incomeCategoryNepali } from "@/lib/categoryUtils";
import { generateFinanceReport } from "@/lib/actions";
import PrintFinanceReport from "@/components/PrintFinanceReport";
import BikramSambatDatePicker from "../BikramSambatDatePicker";
import { BSToAD } from "bikram-sambat-js";

interface BSDate {
  year: number;
  month: number;
  day: number;
}

const financeReportSchema = z.object({
  type: z.enum(["ALL", "INCOME", "EXPENSE"]).optional(),
  category: z.string().optional(),
});

type FinanceReportSchema = z.infer<typeof financeReportSchema>;

interface FinanceReportFormProps {
  type: "create";
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const FinanceReportForm = ({ type, setOpen }: FinanceReportFormProps) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FinanceReportSchema>({
    resolver: zodResolver(financeReportSchema),
    defaultValues: {
      type: "ALL",
    },
  });

  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [showPrint, setShowPrint] = useState(false);
  const [fromDate, setFromDate] = useState<BSDate | null>(null);
  const [toDate, setToDate] = useState<BSDate | null>(null);

  const watchedType = watch("type");

  const formatBSDateForAPI = (bsDate: BSDate): string => {
    return `${bsDate.year}-${String(bsDate.month).padStart(2, '0')}-${String(bsDate.day).padStart(2, '0')}`;
  };

  const convertBSToAD = (bsDate: BSDate): string => {
    const bsDateString = formatBSDateForAPI(bsDate);
    return BSToAD(bsDateString);
  };

  const onSubmit = handleSubmit(async (data) => {
    setLoading(true);
    try {
      // Convert BS dates to AD for the API
      const reportFilters = {
        ...data,
        dateFrom: fromDate ? convertBSToAD(fromDate) : undefined,
        dateTo: toDate ? convertBSToAD(toDate) : undefined,
        dateType: "BS" as const,
      };

      const result = await generateFinanceReport(reportFilters);
      if (result.success && result.data) {
        setReportData({
          ...result.data,
          filters: {
            ...result.data.summary.filters,
            fromDateBS: fromDate ? formatBSDateForAPI(fromDate) : undefined,
            toDateBS: toDate ? formatBSDateForAPI(toDate) : undefined,
          }
        });
        setShowPrint(true);
        toast.success("Report generated successfully!");
      } else {
        toast.error(result.message || "Failed to generate report");
      }
    } catch (error: any) {
      toast.error("Failed to generate report");
      console.error("Report generation error:", error);
    } finally {
      setLoading(false);
    }
  });

  const getCategoryOptions = () => {
    if (watchedType === "INCOME") {
      return Object.entries(incomeCategoryNepali).map(([key, value]) => (
        <option key={key} value={key}>
          {value}
        </option>
      ));
    } else if (watchedType === "EXPENSE") {
      return Object.entries(expenseCategoryNepali).map(([key, value]) => (
        <option key={key} value={key}>
          {value}
        </option>
      ));
    }
    return null;
  };

  if (showPrint && reportData) {
    return (
      <PrintFinanceReport
        data={reportData}
        onClose={() => {
          setShowPrint(false);
          setOpen(false);
        }}
        onBack={() => setShowPrint(false)}
      />
    );
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">वित्तीय रिपोर्ट जेनेरेट गर्नुहोस् (Generate Finance Report)</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Transaction Type */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-400">लेनदेन प्रकार (Transaction Type)</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("type")}
          >
            <option value="ALL">सबै (All)</option>
            <option value="INCOME">आय (Income)</option>
            <option value="EXPENSE">व्यय (Expense)</option>
          </select>
          {errors.type?.message && (
            <p className="text-xs text-red-400">{errors.type.message}</p>
          )}
        </div>

        {/* Category */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-400">श्रेणी (Category)</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("category")}
            disabled={watchedType === "ALL"}
          >
            <option value="">सबै श्रेणी (All Categories)</option>
            {getCategoryOptions()}
          </select>
          {errors.category?.message && (
            <p className="text-xs text-red-400">{errors.category.message}</p>
          )}
        </div>
      </div>

      {/* Date Range Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* From Date */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-400">देखि मिति (From Date - BS)</label>
          <BikramSambatDatePicker onDateSelect={setFromDate} />
          {fromDate && (
            <p className="text-xs text-green-600">
              छानिएको मिति: {fromDate.year}-{String(fromDate.month).padStart(2, '0')}-{String(fromDate.day).padStart(2, '0')}
            </p>
          )}
        </div>

        {/* To Date */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-400">सम्म मिति (To Date - BS)</label>
          <BikramSambatDatePicker onDateSelect={setToDate} />
          {toDate && (
            <p className="text-xs text-green-600">
              छानिएको मिति: {toDate.year}-{String(toDate.month).padStart(2, '0')}-{String(toDate.day).padStart(2, '0')}
            </p>
          )}
        </div>
      </div>

      <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700">
        <p className="font-medium">सूचना:</p>
        <p>• मिति छान्नु वैकल्पिक छ। कुनै मिति नछानेमा सबै रेकर्ड देखाइनेछ।</p>
        <p>• दुवै मिति छान्नुपर्छ भनेर छैन, एउटा मात्र पनि छान्न सकिन्छ।</p>
      </div>

      <button
        type="submit"
        className="bg-blue-400 text-white p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={loading}
      >
        {loading ? "रिपोर्ट जेनेरेट गर्दै..." : "रिपोर्ट जेनेरेट गर्नुहोस् (Generate Report)"}
      </button>
    </form>
  );
};

export default FinanceReportForm;
