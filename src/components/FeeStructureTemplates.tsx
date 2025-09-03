"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getClassFeeStructures, deleteClassFeeStructure } from "@/lib/actions";
import ClassFeeStructureForm from "./ClassFeeStructureForm";
import { FeeCategory } from "@prisma/client";

interface FeeStructureTemplatesProps {
  classId: number;
  year?: number;
}

interface FeeTemplate {
  id: number;
  classId: number;
  year: number;
  category: FeeCategory;
  amount: bigint;
  dueDate: Date | null;
  dueDaysOffset: number | null;
  description: string | null;
  createdAt: Date;
  class: {
    name: string;
  };
}

export default function FeeStructureTemplates({ classId, year }: FeeStructureTemplatesProps) {
  const [templates, setTemplates] = useState<FeeTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<FeeTemplate | null>(null);

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getClassFeeStructures(classId, year);
      setTemplates(data as FeeTemplate[]);
    } catch (error) {
      console.error("Error loading templates:", error);
      alert("Failed to load fee templates");
    } finally {
      setLoading(false);
    }
  }, [classId, year]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleDelete = async (templateId: number) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const result = await deleteClassFeeStructure({ success: false, error: false }, templateId);
      if (result.success) {
        alert("Template deleted successfully!");
        loadTemplates();
      } else {
        alert(result.message || "Failed to delete template");
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      alert("Failed to delete template");
    }
  };

  const handleEdit = (template: FeeTemplate) => {
    setEditingTemplate(template);
  };

  const handleSuccess = () => {
    loadTemplates();
    setEditingTemplate(null);
  };

  const formatAmount = (amount: bigint) => {
    const rupees = Number(amount) / 100;
    return `₹${rupees.toLocaleString('en-IN')}`;
  };

  const formatCategory = (category: FeeCategory) => {
    const categoryMap: Record<FeeCategory, string> = {
      PARENT_SUPPORT: "Parent Support",
      PARENT_SUPPORT_MONTHLY: "Parent Support Monthly",
      TUITION_FEE: "Tuition Fee",
      DEPOSIT_FEE: "Deposit Fee",
      ELECTRICITY_TRANSPORT: "Electricity/Transport",
      LIBRARY_FEE: "Library Fee",
      REGISTRATION_FEE: "Registration Fee",
      IDENTITY_SPORTS: "Identity/Sports",
      EXAM_FEE_1: "Exam Fee I",
      EXAM_FEE_2: "Exam Fee II",
      EXAM_FEE_3: "Exam Fee III",
      EXAM_FEE_4: "Exam Fee IV",
      SEE_EXAM_FEE: "SEE Exam Fee",
      BUILDING_MISC_FEE: "Building/Misc Fee",
      CERTIFICATE_FEE: "Certificate Fee",
      GRADE_SHEET: "Grade Sheet",
      TIE_BELT: "Tie Belt",
    };
    return categoryMap[category] || category;
  };

  if (loading) {
    return <div className="text-center py-4">Loading templates...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Fee Structure Templates</h3>
        <ClassFeeStructureForm 
          classId={classId} 
          onSuccess={handleSuccess}
          initialData={editingTemplate ? {
            id: editingTemplate.id,
            classId: editingTemplate.classId,
            year: editingTemplate.year,
            category: editingTemplate.category,
            amount: Number(editingTemplate.amount),
            dueDate: editingTemplate.dueDate || undefined,
            dueDaysOffset: editingTemplate.dueDaysOffset || undefined,
            description: editingTemplate.description || undefined,
          } : undefined}
        />
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <p>No fee templates found for this class.</p>
            <p className="text-sm">Create templates to automatically generate fees for students.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">
                      {formatCategory(template.category)}
                    </CardTitle>
                    <CardDescription>
                      Academic Year {template.year} • {template.class.name}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">
                      {formatAmount(template.amount)}
                    </Badge>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(template)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(template.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Due Date: </span>
                    {template.dueDate ? (
                      template.dueDate.toLocaleDateString()
                    ) : template.dueDaysOffset ? (
                      `${template.dueDaysOffset} days from creation`
                    ) : (
                      "30 days from creation (default)"
                    )}
                  </div>
                  <div>
                    <span className="font-medium">Created: </span>
                    {template.createdAt.toLocaleDateString()}
                  </div>
                </div>
                {template.description && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {template.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
