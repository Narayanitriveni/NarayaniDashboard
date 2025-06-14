import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { createTeacher } from '@/lib/actions';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      return NextResponse.json(
        { error: 'Invalid Excel file format' },
        { status: 400 }
      );
    }

    const headers = worksheet.getRow(1).values as string[];
    const requiredFields = ['username', 'name', 'surname', 'email', 'phone', 'address', 'bloodType', 'sex', 'birthday', 'subjectId', 'qualification'];
    
    // Validate headers
    const missingFields = requiredFields.filter(field => !headers.includes(field));
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required columns: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const results = {
      success: 0,
      errors: [] as string[]
    };

    // Process each row
    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      const rowData: any = {};

      headers.forEach((header, index) => {
        if (header) { // Skip empty headers
          rowData[header] = row.getCell(index).value;
        }
      });

      try {
        // Convert subjectId to number
        rowData.subjectId = parseInt(rowData.subjectId);

        // Create teacher
        const result = await createTeacher({ success: false, error: false }, rowData);
        
        if (result.success) {
          results.success++;
        } else {
          results.errors.push(`Row ${rowNumber}: ${result.message || 'Failed to create teacher'}`);
        }
      } catch (error: any) {
        results.errors.push(`Row ${rowNumber}: ${error.message || 'Error processing row'}`);
      }
    }

    return NextResponse.json({
      message: `Successfully uploaded ${results.success} teachers${results.errors.length > 0 ? ` with ${results.errors.length} errors` : ''}`,
      errors: results.errors
    });

  } catch (error: any) {
    console.error('Error processing file:', error);
    return NextResponse.json(
      { error: 'Error processing file' },
      { status: 500 }
    );
  }
} 