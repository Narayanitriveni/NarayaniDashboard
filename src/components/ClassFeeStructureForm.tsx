"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClassFeeStructure } from "@/lib/actions";
import { ClassFeeStructureSchema } from "@/lib/formValidationSchemas";
import InputField from "./InputField";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { classFeeStructureSchema } from "@/lib/formValidationSchemas";

interface ClassFeeStructureFormProps {
  classId: number;
  onSuccess?: () => void;
  initialData?: Partial<ClassFeeStructureSchema>;
}

export default function ClassFeeStructureForm({ 
  classId, 
  onSuccess, 
  initialData 
}: ClassFeeStructureFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ClassFeeStructureSchema>({
    resolver: zodResolver(classFeeStructureSchema),
    defaultValues: initialData || {
      classId: classId,
      year: new Date().getFullYear(),
      category: "TUITION_FEE",
      amount: 0,
    }
  });

  const onSubmit = async (data: ClassFeeStructureSchema) => {
    setLoading(true);
    try {
      const result = await createClassFeeStructure({ success: false, error: false }, data);
      if (result.success) {
        alert("Fee structure saved successfully!");
        setIsOpen(false);
        reset();
        onSuccess?.();
      } else {
        alert(result.message || "Failed to save fee structure");
      }
    } catch (error) {
      alert("An error occurred while saving the fee structure");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button 
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="mb-4"
      >
        {isOpen ? "Cancel" : "Add Fee Template"}
      </Button>

      {isOpen && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Fee Structure Template</CardTitle>
            <CardDescription>
              Create a fee template for this class that will be applied to all students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
              <input type="hidden" {...register("id")} />
              <input type="hidden" {...register("classId")} value={classId} />
              
              <h1 className="text-xl font-semibold">
                {initialData?.id ? "Update Fee Template" : "Create Fee Template"}
              </h1>

              <span className="text-xs text-gray-400 font-medium">
                Template Information
              </span>
              <div className="flex justify-between flex-wrap gap-4">
                <InputField
                  label="Academic Year (BS)"
                  name="year"
                  type="number"
                  register={register}
                  error={errors?.year}
                  inputProps={{ min: "2080", max: "2090" }}
                />
                
                <div className="flex flex-col gap-2 w-full md:w-1/4">
                  <label className="text-xs text-gray-500">Fee Category</label>
                  <select 
                    {...register("category")}
                    className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                  >
                    <option value="PARENT_SUPPORT">Parent Support</option>
                    <option value="PARENT_SUPPORT_MONTHLY">Parent Support Monthly</option>
                    <option value="TUITION_FEE">Tuition Fee</option>
                    <option value="DEPOSIT_FEE">Deposit Fee</option>
                    <option value="ELECTRICITY_TRANSPORT">Electricity/Transport</option>
                    <option value="LIBRARY_FEE">Library Fee</option>
                    <option value="REGISTRATION_FEE">Registration Fee</option>
                    <option value="IDENTITY_SPORTS">Identity/Sports</option>
                    <option value="EXAM_FEE_1">Exam Fee I</option>
                    <option value="EXAM_FEE_2">Exam Fee II</option>
                    <option value="EXAM_FEE_3">Exam Fee III</option>
                    <option value="EXAM_FEE_4">Exam Fee IV</option>
                    <option value="SEE_EXAM_FEE">SEE Exam Fee</option>
                    <option value="BUILDING_MISC_FEE">Building/Misc Fee</option>
                    <option value="CERTIFICATE_FEE">Certificate Fee</option>
                    <option value="GRADE_SHEET">Grade Sheet</option>
                    <option value="TIE_BELT">Tie Belt</option>
                  </select>
                  {errors?.category?.message && (
                    <p className="text-xs text-red-400">{errors.category.message.toString()}</p>
                  )}
                </div>
              </div>

              <span className="text-xs text-gray-400 font-medium">
                Fee Details
              </span>
              <div className="flex justify-between flex-wrap gap-4">
                <InputField
                  label="Amount (in rupees)"
                  name="amount"
                  type="number"
                  register={register}
                  error={errors?.amount}
                  inputProps={{ min: "0", step: "0.01", placeholder: "5000.00" }}
                />
                
                <InputField
                  label="Due Date (Optional)"
                  name="dueDate"
                  type="date"
                  register={register}
                  error={errors?.dueDate}
                />
                
                <InputField
                  label="Due Days Offset (Optional)"
                  name="dueDaysOffset"
                  type="number"
                  register={register}
                  error={errors?.dueDaysOffset}
                  inputProps={{ min: "0", placeholder: "30 for 30 days from creation" }}
                />
              </div>

              <div className="flex flex-col gap-2 w-full">
                <label className="text-xs text-gray-500">Description (Optional)</label>
                <textarea
                  {...register("description")}
                  placeholder="Fee description..."
                  className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                  rows={3}
                />
                {errors?.description?.message && (
                  <p className="text-xs text-red-400">{errors.description.message.toString()}</p>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsOpen(false);
                    reset();
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className={`p-2 rounded-md text-white transition ${
                    loading 
                      ? "bg-blue-300 cursor-not-allowed" 
                      : "bg-blue-400 hover:bg-blue-500"
                  }`}
                >
                  {loading ? "Saving..." : (initialData?.id ? "Update" : "Create") + " Template"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
