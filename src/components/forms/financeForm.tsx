"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import InputField from "../InputField";
import { financeSchema, FinanceSchema } from "@/lib/formValidationSchemas";
import { createFinance, updateFinance } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import ErrorDisplay from "../ui/error-display";
import { ExpenseCategory, IncomeCategory } from "@prisma/client";
import { expenseCategoryNepali, incomeCategoryNepali } from "@/lib/categoryUtils";

const FinanceForm = ({
  type,
  data,
  setOpen,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FinanceSchema>({
    resolver: zodResolver(financeSchema),
    defaultValues: {
      id: data?.id,
      type: data?.type || undefined,
      expenseCategory: data?.expenseCategory || undefined,
      incomeCategory: data?.incomeCategory || undefined,
      amount: data?.amount ? Number(data.amount) : undefined,
      description: data?.description || "",
    }
  });

  const transactionType = watch("type");
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  const [state, formAction] = useFormState(
    type === "create" ? createFinance : updateFinance,
    {
      success: false,
      error: false,
      message: "",
      details: null,
    }
  );

  const onSubmit = handleSubmit(async (data) => {
    setLoading(true);
    setShowError(false);
    await formAction(data);
    setLoading(false);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(
        `Financial record has been ${
          type === "create" ? "created" : "updated"
        }!`
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

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create"
          ? "Create New Financial Record"
          : "Update Financial Record"}
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
        {data?.id && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data.id}
            register={register}
            error={errors?.id}
            hidden
          />
        )}

        <div className="flex flex-wrap gap-4">
          <div className="w-full md:w-[48%]">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-500">Transaction Type</label>
              <select
                className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                {...register("type")}
              >
                <option value="">Select transaction type</option>
                <option value="INCOME">आय (Income)</option>
                <option value="EXPENSE">व्यय (Expense)</option>
              </select>
              {errors.type?.message && (
                <p className="text-xs text-red-400">
                  {errors.type.message.toString()}
                </p>
              )}
            </div>
          </div>

          {transactionType === "EXPENSE" && (
            <div className="w-full md:w-[48%]">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-500">Expense Category</label>
                <select
                  className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                  {...register("expenseCategory")}
                >
                  <option value="">Select expense category</option>
                  {Object.entries(expenseCategoryNepali).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
                {errors.expenseCategory?.message && (
                  <p className="text-xs text-red-400">
                    {errors.expenseCategory.message.toString()}
                  </p>
                )}
              </div>
            </div>
          )}

          {transactionType === "INCOME" && (
            <div className="w-full md:w-[48%]">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-500">Income Category</label>
                <select
                  className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                  {...register("incomeCategory")}
                >
                  <option value="">Select income category</option>
                  {Object.entries(incomeCategoryNepali).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
                {errors.incomeCategory?.message && (
                  <p className="text-xs text-red-400">
                    {errors.incomeCategory.message.toString()}
                  </p>
                )}
              </div>
            </div>
          )}

          <InputField
            label="Amount"
            name="amount"
            type="number"
            register={register}
            error={errors?.amount}
          />

          <InputField
            label="Description"
            name="description"
            type="text"
            register={register}
            error={errors?.description}
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
          ? "Create Record"
          : "Update Record"}
      </button>
    </form>
  );
};

export default FinanceForm;
