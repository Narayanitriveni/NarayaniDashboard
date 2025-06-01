"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { feeSchema, FeeSchema } from "@/lib/formValidationSchemas";
import { createFee, updateFee } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const FeeForm = ({
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
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FeeSchema>({
    resolver: zodResolver(feeSchema),
  });

  const [state, formAction] = useFormState(
    type === "create" ? createFee : updateFee,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((data) => {
    console.log("Fee Form - Submitted data:", {
      ...data,
      paidAmount: data.paidAmount,
      totalAmount: data.totalAmount
    });
    formAction(data);
  });
  

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Fee has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const students = relatedData?.students || [];
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(
    data?.studentId ? students.find((student: any) => student.id === data.studentId) : null
  );

  const filteredStudents = students.filter((student: any) => {
    const fullName = `${student.name} ${student.surname}`.toLowerCase();
    const studentId = student.StudentId?.toLowerCase() || "";
    const searchLower = searchTerm.toLowerCase();
    return fullName.includes(searchLower) || studentId.includes(searchLower);
  });

  const handleStudentSelect = (student: any) => {
    setSelectedStudent(student);
    setSearchTerm(`${student.name} ${student.surname} (${student.StudentId})`);
    setValue("studentId", student.id);
    setTimeout(() => setIsDropdownOpen(false), 100);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".student-dropdown-container")) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create New Fee" : "Update Fee"}
      </h1>

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
          <div className="w-full md:w-[48%] student-dropdown-container">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-500">Search Student</label>
              <input
                type="text"
                className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                placeholder="Search by name or student ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onClick={() => setIsDropdownOpen(true)}
              />
              {isDropdownOpen && filteredStudents.length > 0 && (
                <div className="absolute bg-white mt-12 shadow-lg rounded-md max-h-60 overflow-y-auto z-10 w-full max-w-md">
                  {filteredStudents.map((student: any) => (
                    <div
                      key={student.id}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleStudentSelect(student)}
                    >
                      <div className="flex justify-between items-center">
                        <span>{student.name} {student.surname}</span>
                        <span className="text-gray-500 text-sm">ID: {student.StudentId || 'N/A'}</span>
                      </div>
                      <div className="text-xs text-gray-500">{student.class?.name}</div>
                    </div>
                  ))}
                </div>
              )}
              {selectedStudent ? (
                <input
                  type="hidden"
                  {...register("studentId")}
                  value={selectedStudent.id}
                />
              ) : (
                <input type="hidden" {...register("studentId")} />
              )}
              {errors.studentId?.message && (
                <p className="text-xs text-red-400">{errors.studentId.message.toString()}</p>
              )}
            </div>
          </div>

          <InputField
            label={`Total Amount${type === "create" ? " *" : ""}`}
            name="totalAmount"
            type="number"
            defaultValue={data?.totalAmount}
            register={register}
            error={errors?.totalAmount}
          />

          <InputField
            label="Due Date"
            name="dueDate"
            type="date"
            defaultValue={data?.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : undefined}
            register={register}
            error={errors?.dueDate}
          />

          <div className="w-full md:w-[48%]">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-500">Status</label>
              <select
                className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                {...register("status")}
                defaultValue={data?.status || "UNPAID"}
              >
                <option value="PAID">Paid</option>
                <option value="UNPAID">Unpaid</option>
                <option value="PARTIAL">Partial</option>
                <option value="OVERDUE">Overdue</option>
                <option value="WAIVED">Waived</option>
              </select>
              {errors.status?.message && (
                <p className="text-xs text-red-400">
                  {errors.status.message.toString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {type === "update" && (
          <InputField
            label="Paid Amount"
            name="paidAmount"
            type="number"
            defaultValue={data?.paidAmount ?? ""}
            register={register}
            error={errors?.paidAmount}
          />
        )}
      </div>

      {state?.error && (
        <span className="text-red-500">Something went wrong!</span>
      )}
      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create Fee" : "Update Fee"}
      </button>
    </form>
  );
};

export default FeeForm;
