import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { createStudent } from '@/lib/actions';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Function to normalize column names
function normalizeColumnName(columnName: string): string {
  return columnName
    .toLowerCase()
    .replace(/\s+/g, '') // Remove all spaces
    .replace(/[^a-z0-9]/g, ''); // Remove special characters
}

// Column name mapping
const columnMapping: { [key: string]: string } = {
  'fullname': 'fullName',
  'full_name': 'fullName',
  'name': 'fullName',
  'studentname': 'fullName',
  'student_name': 'fullName',
  'gender': 'gender',
  'sex': 'gender',
  'fathername': 'fatherName',
  'father_name': 'fatherName',
  'mothername': 'motherName',
  'mother_name': 'motherName',
  'dob': 'dob',
  'dateofbirth': 'dob',
  'birthdate': 'dob',
  'birth_date': 'dob',
  'date_of_birth': 'dob',
  'studentid': 'studentId',
  'student_id': 'studentId',
  'id': 'studentId',
  'currentclass': 'currentClass',
  'address': 'address',
};

export async function POST(request: NextRequest) {
  console.log('Starting student upload process...');
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.error('No file provided in the request');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log(`Processing file: ${file.name}, size: ${file.size} bytes`);
    const buffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      console.error('Invalid Excel file format - no worksheet found');
      return NextResponse.json(
        { error: 'Invalid Excel file format' },
        { status: 400 }
      );
    }

    const headers = worksheet.getRow(1).values as string[];
    console.log('Found headers:', headers);
    
    // Normalize headers
    const normalizedHeaders = headers.map(header => {
      if (!header) return '';
      const normalized = normalizeColumnName(header);
      return columnMapping[normalized] || normalized;
    });
    
    console.log('Normalized headers:', normalizedHeaders);

    const requiredFields = ['fullName', 'gender', 'fatherName', 'motherName', 'dob', 'studentId'];
    
    // Validate headers
    const missingFields = requiredFields.filter(field => !normalizedHeaders.includes(field));
    if (missingFields.length > 0) {
      console.error('Missing required columns:', missingFields);
      return NextResponse.json(
        { error: `Missing required columns: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const results = {
      success: 0,
      errors: [] as string[],
      processedRows: 0,
      skippedRows: 0
    };

    console.log(`Starting to process ${worksheet.rowCount - 1} rows...`);

    const classIdStr = formData.get('currentClass');
    if (!classIdStr) {
      return NextResponse.json({ error: 'No class selected' }, { status: 400 });
    }
    const classId = parseInt(classIdStr as string);
    if (isNaN(classId)) {
      return NextResponse.json({ error: 'Invalid class selected' }, { status: 400 });
    }
    const classObj = await prisma.class.findUnique({ where: { id: classId } });
    if (!classObj) {
      return NextResponse.json({ error: 'Class not found' }, { status: 400 });
    }
    const gradeId = classObj.gradeId;

    // Process each row
    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      const rowData: any = {};

      try {
        // Map the data using normalized headers
        headers.forEach((header, index) => {
          if (header) {
            const normalizedHeader = normalizeColumnName(header);
            const mappedField = columnMapping[normalizedHeader];
            if (mappedField) {
              rowData[mappedField] = row.getCell(index).value;
            }
          }
        });

        // Validate required fields
        const missingValues = requiredFields.filter(field => !rowData[field]);
        if (missingValues.length > 0) {
          throw new Error(`Missing required values: ${missingValues.join(', ')}`);
        }

        // Address is optional
        let address: string = 'N/A';
        if ('address' in rowData) {
          address = rowData.address ? String(rowData.address) : 'N/A';
        }

        // Split full name into name and surname
        const nameParts = rowData.fullName.split(' ');
        if (nameParts.length < 2) {
          throw new Error('Full name must contain at least two parts');
        }
        rowData.name = nameParts[0];
        rowData.surname = nameParts.slice(1).join(' ');

        // Generate username from name + 3 random digits
        const randomDigits = Math.floor(100 + Math.random() * 900);
        rowData.username = `${rowData.name.toLowerCase()}${randomDigits}`;

        // Generate email from username
        rowData.email = `${rowData.username}@gmail.com`;

        // Generate password from first 4 letters of name + @ + DOB year
        const dob = new Date(rowData.dob);
        if (isNaN(dob.getTime())) {
          throw new Error('Invalid date format for DOB');
        }
        const dobYear = dob.getFullYear();
        const firstFourLetters = rowData.name.slice(0, 4).toLowerCase();
        rowData.password = `${firstFourLetters}@${dobYear}`;

        // Set default values
        rowData.disability = 'NONE';
        rowData.bloodType = 'N/A';

        // Convert DOB to proper format
        rowData.birthday = dob.toISOString();

        // Use classId and gradeId from selection
        // Create student with required fields
        const studentData = {
          username: rowData.username,
          name: rowData.name,
          surname: rowData.surname,
          fatherName: rowData.fatherName,
          motherName: rowData.motherName,
          sex: rowData.gender.toUpperCase(),
          birthday: rowData.birthday,
          bloodType: rowData.bloodType,
          disability: rowData.disability,
          address,
          IEMISCODE: 48073003, // This should be set manually
          StudentId: rowData.studentId, // Using Student ID from Excel
          gradeId, // Use looked up gradeId
          classId, // Use looked up classId
          email: rowData.email,
          password: rowData.password
        };

        console.log(`Processing row ${rowNumber}:`, {
          username: studentData.username,
          name: studentData.name,
          surname: studentData.surname,
          email: studentData.email,
          password: studentData.password,
          studentId: studentData.StudentId
        });

        const result = await createStudent({ success: false, error: false }, studentData);
        
        if (result.success) {
          results.success++;
          console.log(`Successfully created student: ${studentData.username}`);
        } else {
          const errorMsg = `Row ${rowNumber}: ${result.message || 'Failed to create student'}`;
          console.error(errorMsg);
          results.errors.push(errorMsg);
        }
        results.processedRows++;
      } catch (error: any) {
        const errorMsg = `Row ${rowNumber}: ${error.message || 'Error processing row'}`;
        console.error(errorMsg);
        results.errors.push(errorMsg);
        results.skippedRows++;
      }
    }

    console.log('Upload process completed:', {
      totalRows: worksheet.rowCount - 1,
      processedRows: results.processedRows,
      successCount: results.success,
      errorCount: results.errors.length,
      skippedRows: results.skippedRows
    });

    return NextResponse.json({
      message: `Successfully uploaded ${results.success} students${results.errors.length > 0 ? ` with ${results.errors.length} errors` : ''}`,
      errors: results.errors,
      stats: {
        totalRows: worksheet.rowCount - 1,
        processedRows: results.processedRows,
        successCount: results.success,
        errorCount: results.errors.length,
        skippedRows: results.skippedRows
      }
    });

  } catch (error: any) {
    console.error('Fatal error processing file:', error);
    return NextResponse.json(
      { error: 'Error processing file: ' + error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return all classes with id, name, and gradeId
  const classes = await prisma.class.findMany({
    select: { id: true, name: true, gradeId: true },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(classes);
} 