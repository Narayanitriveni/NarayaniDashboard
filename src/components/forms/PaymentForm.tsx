"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { paymentSchema, PaymentSchema } from "@/lib/formValidationSchemas";
import { createPayment, updatePayment } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import BikramSambatDatePicker from "../BikramSambatDatePicker";
import { BSToAD } from "bikram-sambat-js";
import ErrorDisplay from "../ui/error-display";

const PaymentForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  // Helper function to get category color classes
  const getCategoryColor = (category: string | undefined | null) => {
    if (!category) return "bg-gray-100 text-gray-800";
    
    switch (category) {
      case "PARENT_SUPPORT":
        return "bg-blue-100 text-blue-800";
      case "TUITION_FEE":
        return "bg-green-100 text-green-800";
      case "DEPOSIT_FEE":
        return "bg-purple-100 text-purple-800";
      case "ELECTRICITY_TRANSPORT":
        return "bg-yellow-100 text-yellow-800";
      case "LIBRARY_FEE":
        return "bg-indigo-100 text-indigo-800";
      case "REGISTRATION_FEE":
        return "bg-pink-100 text-pink-800";
      case "IDENTITY_SPORTS":
        return "bg-orange-100 text-orange-800";
      case "EXAM_FEE_1":
      case "EXAM_FEE_2":
      case "EXAM_FEE_3":
        return "bg-red-100 text-red-800";
      case "SEE_EXAM_FEE":
        return "bg-red-200 text-red-900";
      case "BUILDING_MISC_FEE":
        return "bg-gray-100 text-gray-800";
      case "CERTIFICATE_FEE":
        return "bg-teal-100 text-teal-800";
      case "GRADE_SHEET":
        return "bg-cyan-100 text-cyan-800";
      case "TIE_BELT":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Helper function to get category label
  const getCategoryLabel = (category: string | undefined | null) => {
    if (!category) return "Unknown Category";
    
    switch (category) {
      case "PARENT_SUPPORT":
        return "Parent Support";
      case "PARENT_SUPPORT_MONTHLY":
        return "Parent Support Monthly";
      case "TUITION_FEE":
        return "Tuition Fee";
      case "DEPOSIT_FEE":
        return "Deposit Fee";
      case "ELECTRICITY_TRANSPORT":
        return "Electricity/Transport";
      case "LIBRARY_FEE":
        return "Library Fee";
      case "REGISTRATION_FEE":
        return "Registration Fee";
      case "IDENTITY_SPORTS":
        return "Identity & Sports";
      case "EXAM_FEE_1":
        return "Exam Fee I";
      case "EXAM_FEE_2":
        return "Exam Fee II";
      case "EXAM_FEE_3":
        return "Exam Fee III";
      case "EXAM_FEE_4":
        return "Exam Fee IV";
      case "SEE_EXAM_FEE":
        return "SEE Exam Fee";
      case "BUILDING_MISC_FEE":
        return "Building & Misc";
      case "CERTIFICATE_FEE":
        return "Certificate Fee";
      case "GRADE_SHEET":
        return "Grade Sheet";
      case "TIE_BELT":
        return "Tie Belt";
      default:
        return category;
    }
  };
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PaymentSchema>({
    resolver: zodResolver(paymentSchema),
  });

  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  const [state, formAction] = useFormState(
    type === "create" ? createPayment : updatePayment,
    {
      success: false,
      error: false,
      message: "",
      details: null,
    }
  );

  const onSubmit = handleSubmit(async (formData) => {
    setLoading(true);
    setShowError(false);
    await formAction(formData);
    setLoading(false);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(
        `Payment has been ${type === "create" ? "created" : "updated"}!`
      );
      setOpen(false);
      router.refresh();
    }
    if (state.error) {
      setShowError(true);
      toast.error(state.message || "Something went wrong!");
    }
    if (state.success || state.error) {
      setLoading(false);
    }
  }, [state, router, type, setOpen]);

  // Memoize fees to avoid unnecessary re-renders and fix exhaustive-deps warning
  const fees = useMemo(() => relatedData?.fees || [], [relatedData?.fees]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<any>(
    data?.feeId ? fees.find((fee: any) => fee.id === data.feeId) : null
  );

  // Ensure selected fee and search term are set when editing and fees are loaded
  useEffect(() => {
    if (type === "update" && data?.feeId && fees.length > 0) {
      const found = fees.find((fee: any) => fee.id === data.feeId);
      if (found && found.student) {
        setSelectedFee(found);
        setSearchTerm(
          `${found.student.name || ""} ${found.student.surname || ""} (${found.student.StudentId || "N/A"}) - ${getCategoryLabel(found.category)}`
        );
        setValue("feeId", found.id);
        setIsDropdownOpen(false);
      }
    }
  }, [type, data?.feeId, fees, setValue]);

  const filteredFees = fees.filter((fee: any) => {
    // Safety check for fee and student data
    if (!fee || !fee.student) return false;
    
    const fullName = `${fee.student.name || ""} ${fee.student.surname || ""}`.toLowerCase();
    const studentId = fee.student.StudentId?.toLowerCase() || "";
    const category = getCategoryLabel(fee.category || "").toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return fullName.includes(searchLower) || studentId.includes(searchLower) || category.includes(searchLower);
  });

  const handleFeeSelect = (fee: any) => {
    if (!fee || !fee.student) return;
    
    setSelectedFee(fee);
    setSearchTerm(
      `${fee.student.name || ""} ${fee.student.surname || ""} (${fee.student.StudentId || "N/A"}) - ${getCategoryLabel(fee.category)}`
    );
    setValue("feeId", fee.id);
    setTimeout(() => setIsDropdownOpen(false), 100);
  };

  const handleDateSelect = (date: {
    year: number;
    month: number;
    day: number;
  }) => {
    const bsDateString = `${date.year}-${date.month
      .toString()
      .padStart(2, "0")}-${date.day.toString().padStart(2, "0")}`;
    const adDateString = BSToAD(bsDateString);
    const adDate = new Date(adDateString);
    setValue("date", adDate);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".fee-dropdown-container")) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Make sure transaction ID is properly initialized from data
  useEffect(() => {
    if (data && data.transactionId) {
      setValue("transactionId", data.transactionId);
    }
  }, [data, setValue]);

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create New Payment" : "Update Payment"}
      </h1>

      {showError && state.error && (
        <ErrorDisplay
          error={state.details || state.message || "An error occurred"}
          title="Error Details"
          onClose={() => setShowError(false)}
          className="mb-4"
        />
      )}

      <div className="flex flex-col gap-4">
        {data && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data?.id}
            register={register}
            error={errors?.id}
            hidden
          />
        )}

        <div className="flex flex-wrap gap-4">
          <div className="w-full md:w-[48%] fee-dropdown-container">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-500">Search Student</label>
              <input
                type="text"
                className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                placeholder="Search for student, ID, or fee category..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onClick={() => setIsDropdownOpen(true)}
              />
              {isDropdownOpen && filteredFees.length > 0 && (
                <div className="absolute bg-white mt-12 shadow-lg rounded-md max-h-60 overflow-y-auto z-10 w-full max-w-md">
                  {filteredFees.map((fee: any) => (
                    <div
                      key={fee.id}
                      className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                      onClick={() => handleFeeSelect(fee)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">
                            {fee.student?.name || ""} {fee.student?.surname || ""}
                          </span>
                          <span className="text-gray-500 text-sm">
                            ID: {fee.student?.StudentId || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {fee.student?.enrollments?.[0]?.class?.name || "N/A"}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(fee.category)}`}>
                            {getCategoryLabel(fee.category)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-green-600 font-semibold text-sm">
                          ₹{Number(
                            fee.totalAmount - fee.paidAmount
                          ).toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-500">
                          Due
                        </span>
                        <div className="text-xs text-gray-400">
                          <span>Total: ₹{Number(fee.totalAmount).toLocaleString()}</span>
                          {Number(fee.paidAmount) > 0 && (
                            <span className="ml-1">| Paid: ₹{Number(fee.paidAmount).toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {selectedFee ? (
                <>
                  <input
                    type="hidden"
                    {...register("feeId")}
                    value={selectedFee.id}
                  />
                  <div className="mt-2 p-2 bg-gray-50 rounded-md border">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {selectedFee.student?.name || ""} {selectedFee.student?.surname || ""}
                        </div>
                        <div className="text-xs text-gray-500">
                          Class: {selectedFee.student?.enrollments?.[0]?.class?.name || "N/A"}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(selectedFee.category)}`}>
                          {getCategoryLabel(selectedFee.category)}
                        </span>
                        <span className="text-sm font-semibold text-green-600 mt-1">
                          ₹{Number(selectedFee.totalAmount - selectedFee.paidAmount).toLocaleString()} due
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <input type="hidden" {...register("feeId")} />
              )}
              {errors.feeId?.message && (
                <p className="text-xs text-red-400">
                  {errors.feeId.message.toString()}
                </p>
              )}
            </div>
          </div>

          <InputField
            label="Amount"
            name="amount"
            type="number"
            defaultValue={data?.amount}
            register={register}
            error={errors?.amount}
          />

          <div className="w-full md:w-[48%]">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-500">Date</label>
              <BikramSambatDatePicker onDateSelect={handleDateSelect} />
              {errors.date?.message && (
                <p className="text-xs text-red-400">
                  {errors.date.message.toString()}
                </p>
              )}
            </div>
          </div>

          <div className="w-full md:w-[48%]">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-500">Payment Method</label>
              <select
                className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                {...register("method")}
                defaultValue={data?.method || "CASH"}
              >
                <option value="CASH">Cash</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="UPI">UPI</option>
              </select>
              {errors.method?.message && (
                <p className="text-xs text-red-400">
                  {errors.method.message.toString()}
                </p>
              )}
            </div>
          </div>

          <div className="w-full md:w-[48%]">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-500">Payment Category</label>
              <select
                className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                {...register("category")}
                defaultValue={data?.category || "TUITION_FEE"}
              >
                <option value="PARENT_SUPPORT">अभिभावक सहयोग (Parent Support)</option>
                <option value="PARENT_SUPPORT_MONTHLY">अभिभावक सहयोग मासिक (Parent Support Monthly)</option>
                <option value="TUITION_FEE">शिक्षण शुल्कं (Tuition Fee)</option>
                <option value="DEPOSIT_FEE">धरौटी शुल्क (Deposit Fee)</option>
                <option value="ELECTRICITY_TRANSPORT">विद्युत/यातायात शुल्क (Electricity/Transport)</option>
                <option value="LIBRARY_FEE">पुस्तकालय शुल्क (Library Fee)</option>
                <option value="REGISTRATION_FEE">रजिष्ट्रेशन शुल्क (Registration Fee)</option>
                <option value="IDENTITY_SPORTS">परिचय पत्र तथा खेलकुद (Identity Card & Sports)</option>
                <option value="EXAM_FEE_1">। परीक्षा शुल्क (Exam Fee I)</option>
                <option value="EXAM_FEE_2">|| परीक्षा शुल्क (Exam Fee II)</option>
                <option value="EXAM_FEE_3">||| परीक्षा शुल्क (Exam Fee III)</option>
                <option value="EXAM_FEE_4">|||| परीक्षा शुल्क (Exam Fee IV)</option>
                <option value="SEE_EXAM_FEE">SEE परीक्षा (SEE Exam)</option>
                <option value="BUILDING_MISC_FEE">भवन एवं विविध शुल्क (Building & Miscellaneous)</option>
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
          </div>

          <InputField
            label="Transaction ID (if applicable)"
            name="transactionId"
            type="text"
            defaultValue={data?.transactionId || ""}
            register={register}
            error={errors?.transactionId}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`p-2 rounded-md text-white transition ${
          loading
            ? "bg-blue-300 cursor-not-allowed"
            : "bg-blue-400 hover:bg-blue-500"
        }`}
      >
        {loading
          ? type === "create"
            ? "Creating..."
            : "Updating..."
          : type === "create"
          ? "Create Payment"
          : "Update Payment"}
      </button>
    </form>
  );
};

export default PaymentForm;
