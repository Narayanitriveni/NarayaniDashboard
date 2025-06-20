"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { studentSchema, StudentSchema } from "@/lib/formValidationSchemas";
import { useFormState } from "react-dom";
import { createStudent, updateStudent } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CldUploadWidget } from "next-cloudinary";
import { ADToBS, BSToAD } from "bikram-sambat-js";

const createWrapper = async (state: { success: boolean; error: boolean }, formData: StudentSchema & { img?: string }) => {
  try {
    await createStudent({ success: false, error: false, message: "" }, formData);
    return { success: true, error: false };
  } catch (error) {
    return { success: false, error: true };
  }
};

const updateWrapper = async (state: { success: boolean; error: boolean }, formData: StudentSchema & { img?: string }) => {
  try {
    if (!formData.id) {
      return { success: false, error: true };
    }
    await updateStudent({ success: false, error: false, message: "" }, formData);
    return { success: true, error: false };
  } catch (error) {
    return { success: false, error: true };
  }
};

const StudentForm = ({
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
    formState: { errors },
    setValue,
  } = useForm<StudentSchema>({
    resolver: zodResolver(studentSchema),
  });

  const [img, setImg] = useState<any>();
  const [bsBirthday, setBsBirthday] = useState<string>("");

  // Convert AD date to BS when component mounts or data changes
  useEffect(() => {
    if (data?.birthday) {
      const adDate = new Date(data.birthday);
      const year = adDate.getFullYear();
      if (!isNaN(adDate.getTime()) && year >= 1913 && year <= 2043) {
        const bsDate = ADToBS(adDate.toISOString().split('T')[0]);
        setBsBirthday(bsDate);
      } else {
        setBsBirthday("");
      }
    }
  }, [data]);

  // Handle BS date change
  const handleBSDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const bsDate = e.target.value;
    setBsBirthday(bsDate);
    
    // Convert BS date to AD and set form value
    try {
      const adDate = BSToAD(bsDate);
      // Convert to ISO string and create a new Date object
      const dateObj = new Date(adDate);
      setValue('birthday', dateObj);
    } catch (error) {
      console.error('Invalid BS date format');
    }
  };

  const [state, formAction] = useFormState(
    type === "create" ? createWrapper : updateWrapper,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((formData) => {
    formAction({ ...formData, img: img?.secure_url });
  });

  const router = useRouter();

  useEffect(() => {
    if (state && state.success) {
      toast(`Student has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { grades, classes } = relatedData;

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new student" : "Update the student"}
      </h1>
      <span className="text-xs text-gray-400 font-medium">
        Authentication Information
      </span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Username"
          name="username"
          defaultValue={data?.username}
          register={register}
          error={errors?.username}
        />
        <InputField
          label="Email"
          name="email"
          defaultValue={data?.email}
          register={register}
          error={errors?.email}
        />
        <InputField
          label="Password"
          name="password"
          type="password"
          defaultValue={data?.password}
          register={register}
          error={errors?.password}
        />
        <InputField
          label="IEMIS Code"
          name="IEMISCODE"
          type="number"
          defaultValue={data?.IEMISCODE}
          register={register}
          error={errors?.IEMISCODE}
        />
      </div>
      <span className="text-xs text-gray-400 font-medium">
        Personal Information
      </span>
      <CldUploadWidget
        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "school"}
        onSuccess={(result, { widget }) => {
          setImg(result.info);
          widget.close();
        }}
      >
        {({ open }) => (
          <div className="flex flex-col items-center gap-2">
            <div
              className="text-xs text-gray-500 flex items-center gap-2 cursor-pointer"
              onClick={() => open()}
            >
              <Image src="/upload.png" alt="" width={28} height={28} />
              <span>Upload a photo</span>
            </div>

            {img && (
              <div className="mt-2">
                <Image
                  src={img.secure_url}
                  alt="Uploaded Image Preview"
                  width={100}
                  height={100}
                  className="rounded-lg border"
                />
              </div>
            )}
          </div>
        )}
      </CldUploadWidget>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="First Name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors.name}
        />
        <InputField
          label="Last Name"
          name="surname"
          defaultValue={data?.surname}
          register={register}
          error={errors.surname}
        />
        <InputField
          label="Mother's Name"
          name="motherName"
          defaultValue={data?.motherName}
          register={register}
          error={errors.motherName}
        />
        <InputField
          label="Father's Name"
          name="fatherName"
          defaultValue={data?.fatherName}
          register={register}
          error={errors.fatherName}
        />
        <InputField
          label="Phone"
          name="phone"
          defaultValue={data?.phone}
          register={register}
          error={errors.phone}
        />
        <InputField
          label="Address"
          name="address"
          defaultValue={data?.address}
          register={register}
          error={errors.address}
        />
        <InputField
          label="Blood Type"
          name="bloodType"
          defaultValue={data?.bloodType}
          register={register}
          error={errors.bloodType}
        />
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Birthday (BS)</label>
          <input
            type="text"
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            placeholder="YYYY-MM-DD"
            value={bsBirthday}
            onChange={handleBSDateChange}
          />
          {errors.birthday?.message && (
            <p className="text-xs text-red-400">
              {errors.birthday.message.toString()}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Sex</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("sex")}
            defaultValue={data?.sex}
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
          {errors.sex?.message && (
            <p className="text-xs text-red-400">{errors.sex.message}</p>
          )}
        </div>
        
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Disability</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("disability")}
            defaultValue={data?.disability || "NONE"}
          >
            <option value="NONE">None</option>
            <option value="VISION">Vision</option>
            <option value="HEARING">Hearing</option>
            <option value="MOBILITY">Mobility</option>
            <option value="COGNITIVE">Cognitive</option>
            <option value="SPEECH">Speech</option>
            <option value="MENTAL_HEALTH">Mental Health</option>
            <option value="OTHER">Other</option>
          </select>
          {errors.disability?.message && (
            <p className="text-xs text-red-400">{errors.disability.message}</p>
          )}
        </div>
        
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Grade</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("gradeId")}
            defaultValue={data?.gradeId}
          >
            {grades.map((grade: { id: number; level: number }) => (
              <option value={grade.id} key={grade.id}>
                {grade.level}
              </option>
            ))}
          </select>
          {errors.gradeId?.message && (
            <p className="text-xs text-red-400">{errors.gradeId.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Class</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("classId")}
            defaultValue={data?.classId}
          >
            {classes.map(
              (classItem: {
                id: number;
                name: string;
                capacity: number;
                _count: { students: number };
              }) => (
                <option value={classItem.id} key={classItem.id}>
                  ({classItem.name} -{" "}
                  {classItem._count.students + "/" + classItem.capacity}{" "}
                  Capacity)
                </option>
              )
            )}
          </select>
          {errors.classId?.message && (
            <p className="text-xs text-red-400">{errors.classId.message}</p>
          )}
        </div>
      </div>
      {state?.error && <span className="text-red-500">Something went wrong!</span>}
      <button type="submit" className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default StudentForm;