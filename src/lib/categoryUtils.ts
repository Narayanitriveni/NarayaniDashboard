import { ExpenseCategory, IncomeCategory } from "@prisma/client";

// Nepali translations for expense categories
export const expenseCategoryNepali: Record<ExpenseCategory, string> = {
  TEACHER_SALARY: "शिक्षक तलब भत्ता मा.वि., नि.मा.वि प्रा.वि./पोशाक",
  STAFF_SALARY: "विद्यालय कर्मचारी तलब भत्ता/पोशाक",
  CHILD_DEV_TEACHER_SALARY: "वाल विकाश शिक्षक तलब भत्ता",
  LOCAL_TEACHER_SALARY: "गा.पा. शिक्षक तलव भत्ता",
  PROVIDENT_FUND: "क.सं. कोष",
  CITIZEN_INVESTMENT_FUND: "नागरिक लगानी कोष",
  TAX_DEDUCTION: "कर कट्टी १ र १०%",
  PRIVATE_TEACHER_SALARY: "निजि स्रोत शिक्षक तलव भत्ता",
  ADMIN_STATIONERY: "मसलन्द, प्रशासनिक, बुक कर्नर",
  SCHOLARSHIP: "छात्रवृत्ति (२ आ.व.)",
  DAY_MEAL: "दिवा खाजा",
  TEXTBOOKS: "पाठ्यपुस्तक",
  PLAYGROUND: "गाउापालिकाबाट खेलमैदान",
  TRUST_BUILDING_REPAIR: "टष्ट भवन मर्मत",
  EXAM_SECONDARY: "परिक्षा मा.वि.",
  ADMIN_EXAM_PLUS_TWO: "प्रशासनिक, परिक्षा +२",
  MAINTENANCE: "मर्मत सम्भार",
  EDUCATIONAL_MATERIALS: "शैक्षिक सामग्री",
  BUILDING_CONSTRUCTION: "दुई तले ४ कोठे भवन निर्माण",
  AUDITING: "लेखापरीक्षण",
  COLUMN_CONSTRUCTION: "स्तम्भ निर्माण",
  TOILET_CLEANING: "शौचालय सरसफाई",
  TELEPHONE_POST: "टेलिफोन हुलाक",
  LAND_REVENUE: "मालपोत",
  TRACK_SUIT: "ट्रेक सुट",
  SOUND_SYSTEM: "साउण्ड सिस्टम उपकरण",
  ELECTRICITY: "विद्युत",
  COMPUTER_MATERIALS: "कम्प्युटर सामग्री",
  STEM_LAB: "स्टेम ल्याव",
  SARASWATI_PUJA: "सरस्वती पुजा",
  DAILY_TRAVEL: "दैनिक भ्रमण खर्च",
  STATUE_CONSTRUCTION: "मुर्ति निर्माण",
  SPORTS: "खेलकुद",
  LIABILITY: "दायित्व",
  TIE_BELT: "टाई बेल्ट",
  BUS_MANAGEMENT: "बस व्यवस्थापन तथा ईन्धन",
  EXCESS_REFUND: "निकासामा बढि छात्रवृत्ति तथा तलव फिर्ता",
  HOSPITALITY: "अतिथि सत्कार (चियापान)",
  TEACHER_SELECTION: "शिक्षक छनौट खर्च",
  OTHER: "अन्य"
};

// Nepali translations for income categories
export const incomeCategoryNepali: Record<IncomeCategory, string> = {
  OPENING_BALANCE_RASTRIYA_BANIJYA_BANK_PARASI: "अल्या रा.बा.बैंक लि. परासी ६७१",
  OPENING_BALANCE_RASTRIYA_BANIJYA_BANK_BARDAGHAT: "अल्या रा.बा. बैंक लि. बर्दघाट ३६५",
  OPENING_BALANCE_RASTRIYA_BANIJYA_BANK_TRIVENI: "अल्या रा.बा.बैंक लि. त्रिवेणी ९००६",
  OPENING_BALANCE_RASTRIYA_BANIJYA_BANK_TRIVENI_2: "अल्या राःबा. बैंक लि. त्रिवेणी ६३८००१",
  OPENING_BALANCE_KRISHI_BANK_BARDAGHAT: "अल्या कृषि वि. बैंक लि. बर्दघाट",
  OPENING_BALANCE_KRISHI_BANK_BARDAGHAT_FIXED: "अल्या कृषि वि. बैंक लि. बर्दघाट मुद्यती",
  OPENING_BALANCE_SIDDHARTHA_BANK_DUMKIWAS: "अल्या सिद्धार्थ बैंक लिमिटेड दुम्कीवास",
  OPENING_BALANCE_COOPERATIVE: "अल्या सा.कि.कृ.स.सं.लि. (वा.वि.के)",
  OPENING_BALANCE_RAMESHCHANDRA_ADVANCE: "अल्या रमेशचन्द्र रौनियार पेश्की",
  OPENING_BALANCE_PRADIP_ADVANCE: "अल्या प्रदिप कुमार चौधरी पेश्की",
  OPENING_BALANCE_CONSUMER_COMMITTEE: "अल्या उपभोक्ता समिति परासी, त्रिवेणी",
  OPENING_BALANCE_PREVIOUS_YEAR: "मौज्दात (२०७७/०७८)",
  TEACHER_SALARY: "शिक्षक तलब भत्ता ( प्रा.वि, नि.मा.वि., मा.वि. राहत)",
  STAFF_SALARY: "विद्यालय कर्मचारी तलव भत्ता",
  CHILD_DEV_SALARY: "वाल विकाश तलब भत्ता",
  LOCAL_TEACHER_SALARY: "गा.पा. शिक्षक तलब भत्ता",
  ADMIN_STATIONERY: "मसलन्द, प्रशासनिक, बुक कर्नर",
  SCHOLARSHIP: "छात्रवृती",
  DAY_MEAL: "दिवा खाजा",
  TEXTBOOKS: "पाठ्यपुस्तक",
  BUILDING_RECONSTRUCTION: "रा. पुन निर्माण प्राधिकरण भवन निर्माण",
  LOCAL_PLAYGROUND_GRANT: "गा.पा. खेलमैदान अनुदान",
  EARN_WHILE_LEARNING: "पढ्‌दै कमाउदै कार्यक्रम",
  EXAM: "परीक्षा",
  BANK_INTEREST: "रा.वा.बैंक + सा.कि.सं.लि. व्याज",
  PARENT_SUPPORT: "अभिभावक सहयोग",
  CERTIFICATE: "प्रमाणपत्र",
  ENDOWMENT_FUND: "अक्षयकोष",
  NATIONAL_EXAM_BOARD: "रा.प.बोर्ड बुटवल",
  STEM_LAB: "STEM LAB",
  GRADE_11_PARENT_SUPPORT: "कक्षा ११ बाट अभिभावक सहयोग",
  GRADE_12_PARENT_SUPPORT: "कक्षा १२ बाट अभिभावक सहयोग",
  ADVERTISEMENT: "विज्ञापनबाट",
  TIE_BELT: "टाई बेल्ट",
  TRANSPORTATION: "यातायात (बस)",
  MAGHE_MELA: "माघेमेलां",
  N_CELL: "एन. सेलबाट",
  YAGYA_SUPPORT: "यज्ञ सहयोग",
  ASSEMBLY_HALL: "सभाहल",
  PAPER_SALES: "कागज बिक्रीबाट",
  OTHER: "अन्य"
};

// Color mapping for expense categories
export const expenseCategoryColors: Record<ExpenseCategory, string> = {
  TEACHER_SALARY: "bg-red-100 text-red-800",
  STAFF_SALARY: "bg-orange-100 text-orange-800",
  CHILD_DEV_TEACHER_SALARY: "bg-amber-100 text-amber-800",
  LOCAL_TEACHER_SALARY: "bg-yellow-100 text-yellow-800",
  PROVIDENT_FUND: "bg-lime-100 text-lime-800",
  CITIZEN_INVESTMENT_FUND: "bg-green-100 text-green-800",
  TAX_DEDUCTION: "bg-emerald-100 text-emerald-800",
  PRIVATE_TEACHER_SALARY: "bg-teal-100 text-teal-800",
  ADMIN_STATIONERY: "bg-cyan-100 text-cyan-800",
  SCHOLARSHIP: "bg-sky-100 text-sky-800",
  DAY_MEAL: "bg-blue-100 text-blue-800",
  TEXTBOOKS: "bg-indigo-100 text-indigo-800",
  PLAYGROUND: "bg-violet-100 text-violet-800",
  TRUST_BUILDING_REPAIR: "bg-purple-100 text-purple-800",
  EXAM_SECONDARY: "bg-fuchsia-100 text-fuchsia-800",
  ADMIN_EXAM_PLUS_TWO: "bg-pink-100 text-pink-800",
  MAINTENANCE: "bg-rose-100 text-rose-800",
  EDUCATIONAL_MATERIALS: "bg-red-100 text-red-800",
  BUILDING_CONSTRUCTION: "bg-orange-100 text-orange-800",
  AUDITING: "bg-amber-100 text-amber-800",
  COLUMN_CONSTRUCTION: "bg-yellow-100 text-yellow-800",
  TOILET_CLEANING: "bg-lime-100 text-lime-800",
  TELEPHONE_POST: "bg-green-100 text-green-800",
  LAND_REVENUE: "bg-emerald-100 text-emerald-800",
  TRACK_SUIT: "bg-teal-100 text-teal-800",
  SOUND_SYSTEM: "bg-cyan-100 text-cyan-800",
  ELECTRICITY: "bg-sky-100 text-sky-800",
  COMPUTER_MATERIALS: "bg-blue-100 text-blue-800",
  STEM_LAB: "bg-indigo-100 text-indigo-800",
  SARASWATI_PUJA: "bg-violet-100 text-violet-800",
  DAILY_TRAVEL: "bg-purple-100 text-purple-800",
  STATUE_CONSTRUCTION: "bg-fuchsia-100 text-fuchsia-800",
  SPORTS: "bg-pink-100 text-pink-800",
  LIABILITY: "bg-rose-100 text-rose-800",
  TIE_BELT: "bg-red-100 text-red-800",
  BUS_MANAGEMENT: "bg-orange-100 text-orange-800",
  EXCESS_REFUND: "bg-amber-100 text-amber-800",
  HOSPITALITY: "bg-yellow-100 text-yellow-800",
  TEACHER_SELECTION: "bg-lime-100 text-lime-800",
  OTHER: "bg-gray-100 text-gray-800"
};

// Color mapping for income categories
export const incomeCategoryColors: Record<IncomeCategory, string> = {
  OPENING_BALANCE_RASTRIYA_BANIJYA_BANK_PARASI: "bg-green-100 text-green-800",
  OPENING_BALANCE_RASTRIYA_BANIJYA_BANK_BARDAGHAT: "bg-emerald-100 text-emerald-800",
  OPENING_BALANCE_RASTRIYA_BANIJYA_BANK_TRIVENI: "bg-teal-100 text-teal-800",
  OPENING_BALANCE_RASTRIYA_BANIJYA_BANK_TRIVENI_2: "bg-cyan-100 text-cyan-800",
  OPENING_BALANCE_KRISHI_BANK_BARDAGHAT: "bg-sky-100 text-sky-800",
  OPENING_BALANCE_KRISHI_BANK_BARDAGHAT_FIXED: "bg-blue-100 text-blue-800",
  OPENING_BALANCE_SIDDHARTHA_BANK_DUMKIWAS: "bg-indigo-100 text-indigo-800",
  OPENING_BALANCE_COOPERATIVE: "bg-violet-100 text-violet-800",
  OPENING_BALANCE_RAMESHCHANDRA_ADVANCE: "bg-purple-100 text-purple-800",
  OPENING_BALANCE_PRADIP_ADVANCE: "bg-fuchsia-100 text-fuchsia-800",
  OPENING_BALANCE_CONSUMER_COMMITTEE: "bg-pink-100 text-pink-800",
  OPENING_BALANCE_PREVIOUS_YEAR: "bg-rose-100 text-rose-800",
  TEACHER_SALARY: "bg-green-100 text-green-800",
  STAFF_SALARY: "bg-emerald-100 text-emerald-800",
  CHILD_DEV_SALARY: "bg-teal-100 text-teal-800",
  LOCAL_TEACHER_SALARY: "bg-cyan-100 text-cyan-800",
  ADMIN_STATIONERY: "bg-sky-100 text-sky-800",
  SCHOLARSHIP: "bg-blue-100 text-blue-800",
  DAY_MEAL: "bg-indigo-100 text-indigo-800",
  TEXTBOOKS: "bg-violet-100 text-violet-800",
  BUILDING_RECONSTRUCTION: "bg-purple-100 text-purple-800",
  LOCAL_PLAYGROUND_GRANT: "bg-fuchsia-100 text-fuchsia-800",
  EARN_WHILE_LEARNING: "bg-pink-100 text-pink-800",
  EXAM: "bg-rose-100 text-rose-800",
  BANK_INTEREST: "bg-green-100 text-green-800",
  PARENT_SUPPORT: "bg-emerald-100 text-emerald-800",
  CERTIFICATE: "bg-teal-100 text-teal-800",
  ENDOWMENT_FUND: "bg-cyan-100 text-cyan-800",
  NATIONAL_EXAM_BOARD: "bg-sky-100 text-sky-800",
  STEM_LAB: "bg-blue-100 text-blue-800",
  GRADE_11_PARENT_SUPPORT: "bg-indigo-100 text-indigo-800",
  GRADE_12_PARENT_SUPPORT: "bg-violet-100 text-violet-800",
  ADVERTISEMENT: "bg-purple-100 text-purple-800",
  TIE_BELT: "bg-fuchsia-100 text-fuchsia-800",
  TRANSPORTATION: "bg-pink-100 text-pink-800",
  MAGHE_MELA: "bg-rose-100 text-rose-800",
  N_CELL: "bg-green-100 text-green-800",
  YAGYA_SUPPORT: "bg-emerald-100 text-emerald-800",
  ASSEMBLY_HALL: "bg-teal-100 text-teal-800",
  PAPER_SALES: "bg-cyan-100 text-cyan-800",
  OTHER: "bg-gray-100 text-gray-800"
};

// Helper function to get Nepali name for a category
export function getCategoryNepaliName(type: TransactionType, category: string): string {
  if (type === "INCOME") {
    return incomeCategoryNepali[category as IncomeCategory] || category;
  } else {
    return expenseCategoryNepali[category as ExpenseCategory] || category;
  }
}

// Helper function to get color class for a category
export function getCategoryColorClass(type: TransactionType, category: string): string {
  if (type === "INCOME") {
    return incomeCategoryColors[category as IncomeCategory] || "bg-gray-100 text-gray-800";
  } else {
    return expenseCategoryColors[category as ExpenseCategory] || "bg-gray-100 text-gray-800";
  }
}

export enum TransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE"
}
