"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "react-toastify";
import { z } from "zod";
import { FeeCategory, FeeStatus } from "@prisma/client";
import { generateFeeReport } from "@/lib/actions";
import PrintFeeReport from "@/components/PrintFeeReport";
import BikramSambatDatePicker from "../BikramSambatDatePicker";
import { BSToAD } from "bikram-sambat-js";

interface BSDate {
  year: number;
  month: number;
  day: number;
}

const feeReportSchema = z.object({
  classId: z.string().optional(),
  status: z.enum(["ALL", "PAID", "UNPAID", "PARTIAL", "OVERDUE", "WAIVED"]).optional(),
  category: z.string().optional(),
});

type FeeReportSchema = z.infer<typeof feeReportSchema>;

interface FeeReportFormProps {
  type: "create";
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: {
    classes: { id: number; name: string }[];
  };
}

const feeCategoryNepali: Record<FeeCategory, string> = {
  PARENT_SUPPORT: "अभिभावक सहयोग",
  PARENT_SUPPORT_MONTHLY: "अभिभावक सहयोग मासिक",
  TUITION_FEE: "शिक्षण शुल्क",
  DEPOSIT_FEE: "धरौटी शुल्क",
  ELECTRICITY_TRANSPORT: "विद्युत/यातायात शुल्क",
  LIBRARY_FEE: "पुस्तकालय शुल्क",
  REGISTRATION_FEE: "रजिष्ट्रेशन शुल्क",
  IDENTITY_SPORTS: "परिचय पत्र तथा खेलकुद",
  EXAM_FEE_1: "। परीक्षा शुल्क",
  EXAM_FEE_2: "|| परीक्षा शुल्क",
  EXAM_FEE_3: "||| परीक्षा शुल्क",
  EXAM_FEE_4: "|||| परीक्षा शुल्क",
  SEE_EXAM_FEE: "SEE परीक्षा",
  BUILDING_MISC_FEE: "भवन एवं विविध शुल्क",
  CERTIFICATE_FEE: "प्रमाण पत्र शुल्क",
  GRADE_SHEET: "लब्धाङ्क पत्र",
  TIE_BELT: "टाई बेल्ट",
};

const feeStatusNepali: Record<FeeStatus, string> = {
  PAID: "भुक्तान गरिएको",
  UNPAID: "भुक्तान नगरिएको",
  PARTIAL: "आंशिक भुक्तान",
  OVERDUE: "समय सकिएको",
  WAIVED: "माफ गरिएको",
};

const FeeReportForm = ({ type, setOpen, relatedData }: FeeReportFormProps) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FeeReportSchema>({
    resolver: zodResolver(feeReportSchema),
    defaultValues: {
      status: "ALL",
    },
  });

  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [showPrint, setShowPrint] = useState(false);
  const [fromDate, setFromDate] = useState<BSDate | null>(null);
  const [toDate, setToDate] = useState<BSDate | null>(null);

  const watchedStatus = watch("status");

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


      const result = await generateFeeReport(reportFilters);
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
        toast.success("Fee report generated successfully!");
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

  if (showPrint && reportData) {
    return (
      <PrintFeeReport
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
      <h1 className="text-xl font-semibold">शुल्क रिपोर्ट जेनेरेट गर्नुहोस् (Generate Fee Report)</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Class Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-400">कक्षा (Class)</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("classId")}
          >
            <option value="">सबै कक्षा (All Classes)</option>
            {relatedData?.classes?.map((cls) => (
              <option key={cls.id} value={cls.id.toString()}>
                {cls.name}
              </option>
            ))}
          </select>
          {errors.classId?.message && (
            <p className="text-xs text-red-400">{errors.classId.message}</p>
          )}
        </div>

        {/* Payment Status */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-400">भुक्तान स्थिति (Payment Status)</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("status")}
          >
            <option value="ALL">सबै (All)</option>
            <option value="PAID">भुक्तान गरिएको (Paid)</option>
            <option value="UNPAID">भुक्तान नगरिएको (Unpaid)</option>
            <option value="PARTIAL">आंशिक भुक्तान (Partial)</option>
            <option value="OVERDUE">समय सकिएको (Overdue)</option>
            <option value="WAIVED">माफ गरिएको (Waived)</option>
          </select>
          {errors.status?.message && (
            <p className="text-xs text-red-400">{errors.status.message}</p>
          )}
        </div>

        {/* Fee Category */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-400">शुल्क श्रेणी (Fee Category)</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("category")}
          >
            <option value="">सबै श्रेणी (All Categories)</option>
            {Object.entries(feeCategoryNepali).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
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
        <p>• रिपोर्टमा विद्यार्थीको नाम, बुबा/आमाको नाम, फोन नम्बर र शुल्क विवरण समावेश हुनेछ।</p>
        <p>• मिति छान्नु वैकल्पिक छ। कुनै मिति नछानेमा सबै रेकर्ड देखाइनेछ।</p>
        <p>• कक्षा र स्थिति अनुसार फिल्टर गर्न सकिन्छ।</p>
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

export default FeeReportForm;
