import { z } from "zod";
import { BSToAD } from "bikram-sambat-js";

export const subjectSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Subject name is required!" }),
  teachers: z.array(z.string()), //teacher ids
});

export type SubjectSchema = z.infer<typeof subjectSchema>;

export const classSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Class name is required!" }),
  capacity: z.coerce.number().min(1, { message: "Capacity name is required!" }),
  gradeId: z.coerce.number().min(1, { message: "Grade name is required!" }),
  supervisorId: z.coerce.string().optional(),
});

export type ClassSchema = z.infer<typeof classSchema>;

export const teacherSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().min(1, { message: "Phone is required!" }),
  address: z.string(),
  img: z.string().optional(),
  bloodType: z.string().min(1, { message: "Blood Type is required!" }),
  birthday: z.union([
    z.string().min(1, { message: "Birthday is required!" }),
    z.date().transform((date) => date.toISOString())
  ]),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
  subjects: z.array(z.string()).optional(), // subject ids
});

export type TeacherSchema = z.infer<typeof teacherSchema>;

export const studentSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  // Add mother and father name fields
  motherName: z.string().min(1, { message: "Mother's name is required!" }),
  fatherName: z.string().min(1, { message: "Father's name is required!" }),
  // Add IEMISCODE field
  IEMISCODE: z.coerce.number().min(1, { message: "IEMIS Code is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string(),
  img: z.string().optional(),
  bloodType: z.string().min(1, { message: "Blood Type is required!" }),
  birthday: z.preprocess((val) => {
    if (val instanceof Date) return val;
    if (typeof val === "string") {
      const parts = val.split("-");
      const year = parseInt(parts[0]);
      if (!isNaN(year) && year >= 2000) {
        try {
          const ad = BSToAD(val);
          return new Date(ad);
        } catch {
          return new Date(val);
        }
      }
      return new Date(val);
    }
    return val;
  }, z.date({ message: "Birthday is required!" })),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
  gradeId: z.coerce.number().min(1, { message: "Grade is required!" }),
  classId: z.coerce.number().min(1, { message: "Class is required!" }),
  // Add disability field
  disability: z.enum(["NONE", "VISION", "HEARING", "MOBILITY", "COGNITIVE", "SPEECH", "MENTAL_HEALTH", "OTHER"]),
  // Add StudentId field
  StudentId: z.string().optional(),
  // Add year field for academic year
  year: z.coerce.number().min(2070, { message: "Year must be 2070 or later!" }).max(2090, { message: "Year must be 2090 or earlier!" }).default(2081),
  // parentId field remains optional
  parentId: z.string().optional()
});

export type StudentSchema = z.infer<typeof studentSchema>;

export const examSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title name is required!" }),
  startTime: z.coerce.date({ message: "Start time is required!" }),
  endTime: z.coerce.date({ message: "End time is required!" }),
  subjectId: z.coerce.number({ message: "Subject is required!" }),
  classId: z.coerce.number({ message: "Class is required!" }),
});

export type ExamSchema = z.infer<typeof examSchema>;

export const lessonSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Lesson name is required!" }),
  day: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"], {
    message: "Day is required!"
  }),
  startTime: z.coerce.date({ message: "Start time is required!" }),
  endTime: z.coerce.date({ message: "End time is required!" }),
  subjectId: z.coerce.number({ message: "Subject is required!" }),
  classId: z.coerce.number({ message: "Class is required!" }),
  teacherId: z.string({ message: "Teacher is required!" })
});

export type LessonSchema = z.infer<typeof lessonSchema>;

export const assignmentSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Assignment title is required!" }),
  startDate: z.coerce.date({ message: "Start date is required!" }),
  dueDate: z.coerce.date({ message: "Due date is required!" }),
  lessonId: z.coerce.number({ message: "Lesson is required!" })
});

export type AssignmentSchema = z.infer<typeof assignmentSchema>;

export const resultSchema = z.object({
  id: z.coerce.number().optional(),
  score: z.coerce.number().min(0, { message: "Score must be positive!" }),
  studentId: z.string({ message: "Student is required!" }),
  assessmentType: z.enum(["exam", "assignment"], { 
    required_error: "Please select an assessment type" 
  }),
  examId: z.coerce.number().optional(),
  assignmentId: z.coerce.number().optional(),
}).refine(data => {
  if (data.assessmentType === "exam") return !!data.examId;
  if (data.assessmentType === "assignment") return !!data.assignmentId;
  return false;
}, {
  message: "Please select either an exam or an assignment",
  path: ["assessmentType"]
});

export type ResultSchema = z.infer<typeof resultSchema>;

export const eventSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title is required!" }),
  description: z.string().min(1, { message: "Description is required!" }),
  startTime: z.coerce.date({ required_error: "Start time is required!" }),
  endTime: z.coerce.date({ required_error: "End time is required!" }),
  classId: z.coerce.number().optional()
});

export type EventSchema = z.infer<typeof eventSchema>;

export const announcementSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title is required!" }),
  description: z.string().min(1, { message: "Description is required!" }),
  date: z.coerce.date({ required_error: "Date is required!" }),
  classId: z.coerce.number().optional()
});

export type AnnouncementSchema = z.infer<typeof announcementSchema>;

export const parentSchema = z.object({
  id: z.string().optional(),
  username: z.string().min(1, { message: "Username is required!" }),
  email: z.string().email({ message: "Invalid email format!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  phone: z.string().min(1, { message: "Phone is required!" }),
  address: z.string().min(1, { message: "Address is required!" }),
  birthday: z.coerce.date({ message: "Birthday is required!" }),
  studentId: z.string().optional(),
  parentId: z.string().optional(),
});

export type ParentSchema = z.infer<typeof parentSchema>;

export const accountantSchema = z.object({
  id: z.string().optional(),
  username: z.string().min(1, { message: "Username is required!" }),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z.string().email({ message: "Invalid email format!" }).optional().nullable(),
  phone: z.string().min(1, { message: "Phone is required!" }),
  address: z.string().min(1, { message: "Address is required!" }),
  password: z.string().optional().or(z.literal("")).refine(
    (val) => !val || val.length === 0 || val.length >= 6,
    { message: "Password must be at least 6 characters!" }
  ),
});

export type AccountantSchema = z.infer<typeof accountantSchema>;

export const feeSchema = z.object({
  id: z.coerce.number().optional(),
  studentId: z.string().min(1, "Student is required"),
  category: z.enum([
    "PARENT_SUPPORT", "PARENT_SUPPORT_MONTHLY", "TUITION_FEE", "DEPOSIT_FEE", "ELECTRICITY_TRANSPORT",
    "LIBRARY_FEE", "REGISTRATION_FEE", "IDENTITY_SPORTS", "EXAM_FEE_1",
    "EXAM_FEE_2", "EXAM_FEE_3", "EXAM_FEE_4", "SEE_EXAM_FEE", "BUILDING_MISC_FEE",
    "CERTIFICATE_FEE", "GRADE_SHEET", "TIE_BELT"
  ], { required_error: "Fee category is required" }),
  totalAmount: z
    .union([
      z.coerce.number().positive("Amount must be positive"),
      z.literal("").transform(() => undefined)
    ])
    .optional(),
  paidAmount: z.coerce.number().optional(),
  dueDate: z.coerce.date({ required_error: "Due date is required" }),
  status: z.enum(["PAID", "UNPAID", "PARTIAL", "OVERDUE", "WAIVED"]),
  description: z.string().optional(),
});

export type FeeSchema = z.infer<typeof feeSchema>;
export const paymentSchema = z.object({
  id: z.coerce.number().optional(),
  feeId: z.coerce.number().min(1, "Fee selection is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  method: z.enum(["CASH", "CARD", "BANK_TRANSFER","UPI"], {
    required_error: "Payment method is required"
  }),
  date: z.coerce.date({ required_error: "Payment date is required" }),
  reference: z.string().optional(),
  transactionId: z.string().optional(),
  category: z.enum([
    "PARENT_SUPPORT", "PARENT_SUPPORT_MONTHLY", "TUITION_FEE", "DEPOSIT_FEE", "ELECTRICITY_TRANSPORT",
    "LIBRARY_FEE", "REGISTRATION_FEE", "IDENTITY_SPORTS", "EXAM_FEE_1",
    "EXAM_FEE_2", "EXAM_FEE_3", "EXAM_FEE_4", "SEE_EXAM_FEE", "BUILDING_MISC_FEE",
    "CERTIFICATE_FEE", "GRADE_SHEET", "TIE_BELT"
  ], { required_error: "Payment category is required" })
}).superRefine((val, ctx) => {
  if (["CARD", "BANK_TRANSFER","UPI"].includes(val.method) && !val.transactionId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Transaction ID is required for card/bank payments",
      path: ["transactionId"]
    });
  }
});

export type PaymentSchema = z.infer<typeof paymentSchema>;
export const attendanceSchema = z.object({
  id: z.coerce.number().optional(),
  date: z.coerce.date({ message: "Date is required!" }),
  studentId: z.string().min(1, { message: "Student ID is required!" }),
  classId: z.coerce.number().min(1, { message: "Class ID is required!" }),
  lessonId: z.coerce.number().optional(),
  status: z.enum(["PRESENT", "ABSENT", "LATE"], {
    message: "Status is required!",
  }),
});

export type AttendanceSchema = z.infer<typeof attendanceSchema>;

export const financeSchema = z.object({
  id: z.coerce.number().optional(),
  type: z.enum(["INCOME", "EXPENSE"], {
    required_error: "Transaction type is required"
  }),
  expenseCategory: z.enum([
    "TEACHER_SALARY", "STAFF_SALARY", "CHILD_DEV_TEACHER_SALARY", "LOCAL_TEACHER_SALARY", 
    "PROVIDENT_FUND", "CITIZEN_INVESTMENT_FUND", "TAX_DEDUCTION", "PRIVATE_TEACHER_SALARY", 
    "ADMIN_STATIONERY", "SCHOLARSHIP", "DAY_MEAL", "TEXTBOOKS", "PLAYGROUND", 
    "TRUST_BUILDING_REPAIR", "EXAM_SECONDARY", "ADMIN_EXAM_PLUS_TWO", "MAINTENANCE", 
    "EDUCATIONAL_MATERIALS", "BUILDING_CONSTRUCTION", "AUDITING", "COLUMN_CONSTRUCTION", 
    "TOILET_CLEANING", "TELEPHONE_POST", "LAND_REVENUE", "TRACK_SUIT", "SOUND_SYSTEM", 
    "ELECTRICITY", "COMPUTER_MATERIALS", "STEM_LAB", "SARASWATI_PUJA", "DAILY_TRAVEL", 
    "STATUE_CONSTRUCTION", "SPORTS", "LIABILITY", "TIE_BELT", "BUS_MANAGEMENT", 
    "EXCESS_REFUND", "HOSPITALITY", "TEACHER_SELECTION","OTHER" 
  ], {
    required_error: "Expense category is required"
  }).optional().nullable(),
  incomeCategory: z.enum([
    "OPENING_BALANCE_RASTRIYA_BANIJYA_BANK_PARASI", "OPENING_BALANCE_RASTRIYA_BANIJYA_BANK_BARDAGHAT", 
    "OPENING_BALANCE_RASTRIYA_BANIJYA_BANK_TRIVENI", "OPENING_BALANCE_RASTRIYA_BANIJYA_BANK_TRIVENI_2", 
    "OPENING_BALANCE_KRISHI_BANK_BARDAGHAT", "OPENING_BALANCE_KRISHI_BANK_BARDAGHAT_FIXED", 
    "OPENING_BALANCE_SIDDHARTHA_BANK_DUMKIWAS", "OPENING_BALANCE_COOPERATIVE", 
    "OPENING_BALANCE_RAMESHCHANDRA_ADVANCE", "OPENING_BALANCE_PRADIP_ADVANCE", 
    "OPENING_BALANCE_CONSUMER_COMMITTEE", "OPENING_BALANCE_PREVIOUS_YEAR", "TEACHER_SALARY", 
    "STAFF_SALARY", "CHILD_DEV_SALARY", "LOCAL_TEACHER_SALARY", "ADMIN_STATIONERY", 
    "SCHOLARSHIP", "DAY_MEAL", "TEXTBOOKS", "BUILDING_RECONSTRUCTION", "LOCAL_PLAYGROUND_GRANT", 
    "EARN_WHILE_LEARNING", "EXAM", "BANK_INTEREST", "PARENT_SUPPORT", "CERTIFICATE", 
    "ENDOWMENT_FUND", "NATIONAL_EXAM_BOARD", "STEM_LAB", "GRADE_11_PARENT_SUPPORT", 
    "GRADE_12_PARENT_SUPPORT", "ADVERTISEMENT", "TIE_BELT", "TRANSPORTATION", "MAGHE_MELA", 
    "N_CELL", "YAGYA_SUPPORT", "ASSEMBLY_HALL", "PAPER_SALES","OTHER"

  ], {
    required_error: "Income category is required"
  }).optional().nullable(),
  amount: z.coerce.number().positive("Amount must be positive"),
  description: z.string().optional(),
}).refine(
  (data) => {
    if (data.type === "EXPENSE") {
      return data.expenseCategory !== null && data.expenseCategory !== undefined;
    } else if (data.type === "INCOME") {
      return data.incomeCategory !== null && data.incomeCategory !== undefined;
    }
    return false;
  },
  {
    message: "You must select a category based on transaction type",
    path: ["type"]
  }
);

export type FinanceSchema = z.infer<typeof financeSchema>;

export const teacherAttendanceSchema = z.object({
  id: z.coerce.number().optional(),
  teacherId: z.string().min(1, { message: "Teacher is required!" }),
  date: z.coerce.date({ message: "Date is required!" }),
  status: z.enum(["PRESENT", "ABSENT", "LATE"], {
    message: "Status is required!",
  }),
  inTime: z.string().optional(),
  outTime: z.string().optional(),
}).refine((data) => {
  // If status is ABSENT, inTime and outTime should be undefined
  if (data.status === "ABSENT") {
    return !data.inTime && !data.outTime;
  }
  return true;
}, {
  message: "In/Out time should not be set for absent status",
  path: ["status"]
});

export type TeacherAttendanceSchema = z.infer<typeof teacherAttendanceSchema>;

export const bulkFeeSchema = z.object({
  classId: z.coerce.number().min(1, "Class is required"),
  category: z.enum([
    "PARENT_SUPPORT", "PARENT_SUPPORT_MONTHLY", "TUITION_FEE", "DEPOSIT_FEE", "ELECTRICITY_TRANSPORT",
    "LIBRARY_FEE", "REGISTRATION_FEE", "IDENTITY_SPORTS", "EXAM_FEE_1",
    "EXAM_FEE_2", "EXAM_FEE_3", "EXAM_FEE_4", "SEE_EXAM_FEE", "BUILDING_MISC_FEE",
    "CERTIFICATE_FEE", "GRADE_SHEET", "TIE_BELT"
  ], { required_error: "Fee category is required" }),
  totalAmount: z.coerce.number().positive("Amount must be positive"),
  dueDate: z.coerce.date({ required_error: "Due date is required" }),
  description: z.string().optional(),
  year: z.coerce.number().min(2080, { message: "Year must be 2070 or later!" }).max(2090, { message: "Year must be 2090 or earlier!" }).default(2082),
});

export type BulkFeeSchema = z.infer<typeof bulkFeeSchema>;

export const classFeeStructureSchema = z.object({
  id: z.coerce.number().optional(),
  classId: z.coerce.number().min(1, "Class is required"),
  year: z.coerce.number().min(2080, { message: "Year must be 2080 or later!" }).max(2090, { message: "Year must be 2090 or earlier!" }),
  category: z.enum([
    "PARENT_SUPPORT", "PARENT_SUPPORT_MONTHLY", "TUITION_FEE", "DEPOSIT_FEE", "ELECTRICITY_TRANSPORT",
    "LIBRARY_FEE", "REGISTRATION_FEE", "IDENTITY_SPORTS", "EXAM_FEE_1",
    "EXAM_FEE_2", "EXAM_FEE_3", "EXAM_FEE_4", "SEE_EXAM_FEE", "BUILDING_MISC_FEE",
    "CERTIFICATE_FEE", "GRADE_SHEET", "TIE_BELT"
  ], { required_error: "Fee category is required" }),
  amount: z.coerce.number().positive("Amount must be positive").transform(val => Math.round(val * 100)), // Convert rupees to paisa
  dueDate: z.coerce.date().optional(),
  dueDaysOffset: z.coerce.number().min(0, "Days offset must be 0 or greater").optional(),
  description: z.string().optional(),
});

export type ClassFeeStructureSchema = z.infer<typeof classFeeStructureSchema>;
