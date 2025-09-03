"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createBulkFeesFromTemplate } from "@/lib/actions";
import InputField from "./InputField";
import { useForm } from "react-hook-form";
import { z } from "zod";

const bulkFeeFromTemplateSchema = z.object({
  classId: z.number(),
  year: z.number().min(2080).max(2090),
  category: z.string().optional(),
});

type BulkFeeFromTemplateSchema = z.infer<typeof bulkFeeFromTemplateSchema>;

interface CreateFeesFromTemplateButtonProps {
  classId: number;
  onSuccess?: () => void;
}

export default function CreateFeesFromTemplateButton({ 
  classId, 
  onSuccess 
}: CreateFeesFromTemplateButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<BulkFeeFromTemplateSchema>({
    defaultValues: {
      classId: classId,
      year: new Date().getFullYear(),
      category: "",
    }
  });

  const onSubmit = async (data: BulkFeeFromTemplateSchema) => {
    setLoading(true);
    try {
      const result = await createBulkFeesFromTemplate({ success: false, error: false }, data);
      if (result.success) {
        alert(result.message || "Fees created successfully!");
        setIsOpen(false);
        reset();
        onSuccess?.();
      } else {
        alert(result.message || "Failed to create fees");
      }
    } catch (error) {
      alert("An error occurred while creating fees");
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
        {isOpen ? "Cancel" : "Create Fees from Templates"}
      </Button>

      {isOpen && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create Fees from Templates</CardTitle>
            <CardDescription>
              Generate fees for all students in this class based on existing fee structure templates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
              <input type="hidden" {...register("classId")} value={classId} />
              
              <h1 className="text-xl font-semibold">
                Bulk Fee Creation
              </h1>

              <span className="text-xs text-gray-400 font-medium">
                Template Selection
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
                  <label className="text-xs text-gray-500">Fee Category (Optional)</label>
                  <select 
                    {...register("category")}
                    className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                  >
                    <option value="">All Categories</option>
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
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Select the academic year and optionally a specific fee category</li>
                  <li>• The system will find all fee structure templates for this class and year</li>
                  <li>• For each student enrolled in the class, fees will be created based on the templates</li>
                  <li>• Only missing fees will be created (existing fees won&apos;t be duplicated)</li>
                  <li>• Due dates will be calculated based on template settings</li>
                </ul>
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
                  {loading ? "Creating..." : "Create Fees from Templates"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
