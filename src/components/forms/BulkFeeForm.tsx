"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bulkFeeSchema, type BulkFeeSchema } from "@/lib/formValidationSchemas";
import { createBulkFees } from "@/lib/actions";
import { useTransition, useState } from "react";
import { toast } from "react-toastify";
import InputField from "@/components/InputField";
import BikramSambatDatePicker from "@/components/BikramSambatDatePicker";
import { BSToAD } from "bikram-sambat-js";

interface BulkFeeFormProps {
  classId: number;
  className: string;
  onSuccess?: () => void;
}

const BulkFeeForm = ({ classId, className, onSuccess }: BulkFeeFormProps) => {
  const [loading, startTransition] = useTransition();
  const [selectedBSDate, setSelectedBSDate] = useState<{ year: number; month: number; day: number } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<BulkFeeSchema>({
    resolver: zodResolver(bulkFeeSchema),
    defaultValues: {
      classId: classId,
      year: 2081,
    },
  });

  const handleDateSelect = (date: { year: number; month: number; day: number }) => {
    setSelectedBSDate(date);
    // Convert BS date to AD date for the form
    const bsDateString = `${date.year}-${date.month.toString().padStart(2, '0')}-${date.day.toString().padStart(2, '0')}`;
    const adDateString = BSToAD(bsDateString);
    // Ensure the string is in YYYY-MM-DD and create a Date object
    const adDate = new Date(adDateString + "T00:00:00");
    setValue('dueDate', adDate, { shouldValidate: true });
  };

  const onSubmit = (data: BulkFeeSchema) => {
    startTransition(async () => {
      const result = await createBulkFees({ success: false, error: false }, data);
      
      if (result.success) {
        toast.success(result.message || "Bulk fees created successfully!");
        reset();
        setSelectedBSDate(null);
        onSuccess?.();
      } else {
        toast.error(result.message || "Failed to create bulk fees");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-md mb-4">
        <h3 className="font-medium text-gray-900 mb-2">Create Fees for {className}</h3>
        <p className="text-sm text-gray-600">
          This will create fees for all students currently enrolled in this class.
        </p>
      </div>

      <InputField
        label="Class"
        name="classId"
        type="hidden"
        defaultValue={classId.toString()}
        register={register}
        error={errors?.classId}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Total Amount"
          name="totalAmount"
          type="number"
          register={register}
          error={errors?.totalAmount}
          inputProps={{ placeholder: "Enter amount" }}
        />

        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">Fee Category *</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("category")}
            defaultValue="TUITION_FEE"
          >
            <option value="PARENT_SUPPORT">अभिभावक सहयोग (Parent Support)</option>
            <option value="TUITION_FEE">शिक्षण शुल्कं (Tuition Fee)</option>
            <option value="DEPOSIT_FEE">धरौटी शुल्क (Deposit Fee)</option>
            <option value="ELECTRICITY_TRANSPORT">विद्युत/यातायात शुल्क (Electricity/Transport)</option>
            <option value="LIBRARY_FEE">पुस्तकालय शुल्क (Library Fee)</option>
            <option value="REGISTRATION_FEE">रजिष्ट्रेशन शुल्क (Registration Fee)</option>
            <option value="IDENTITY_SPORTS">परिचय पत्र तथा खेलकुद (Identity & Sports)</option>
            <option value="EXAM_FEE_1">। परीक्षा शुल्क (1st Term Exam)</option>
            <option value="EXAM_FEE_2">|| परीक्षा शुल्क (2nd Term Exam)</option>
            <option value="EXAM_FEE_3">||| परीक्षा शुल्क (3rd Term Exam)</option>
            <option value="SEE_EXAM_FEE">SEE परीक्षा (SEE Exam)</option>
            <option value="BUILDING_MISC_FEE">भवन एवं विविध शुल्क (Building & Misc)</option>
            <option value="CERTIFICATE_FEE">प्रमाण पत्र शुल्क (Certificate Fee)</option>
            <option value="GRADE_SHEET">लब्धाङ्क पत्र (Grade Sheet)</option>
            <option value="TIE_BELT">टाई बेल्ट (Tie Belt)</option>
          </select>
          {errors.category?.message && (
            <p className="text-xs text-red-400">
              {errors.category.message.toString()}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">Due Date (BS)</label>
          <BikramSambatDatePicker onDateSelect={handleDateSelect} />
          <input
            type="hidden"
            {...register("dueDate")}
          />
          {selectedBSDate && (
            <p className="text-xs text-green-600">
              Selected: {selectedBSDate.year}/{selectedBSDate.month.toString().padStart(2, '0')}/{selectedBSDate.day.toString().padStart(2, '0')}
            </p>
          )}
          {errors.dueDate?.message && (
            <p className="text-xs text-red-400">
              {errors.dueDate.message.toString()}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Academic Year (BS)"
          name="year"
          type="number"
          register={register}
          error={errors?.year}
          inputProps={{ placeholder: "e.g., 2081" }}
        />

        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">Description (Optional)</label>
          <textarea
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full resize-none"
            rows={3}
            placeholder="Enter fee description..."
            {...register("description")}
          />
          {errors.description?.message && (
            <p className="text-xs text-red-400">
              {errors.description.message.toString()}
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full p-2 rounded-md text-white transition ${
          loading
            ? "bg-blue-300 cursor-not-allowed"
            : "bg-blue-400 hover:bg-blue-500"
        }`}
      >
        {loading ? "Creating Fees..." : "Create Fees for All Students"}
      </button>
    </form>
  );
};

export default BulkFeeForm; 