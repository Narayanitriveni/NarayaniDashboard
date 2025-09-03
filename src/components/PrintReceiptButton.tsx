'use client';

import { useRef, useState } from 'react';
import html2pdf from 'html2pdf.js';
import { Payment, Fee, Student, Class } from '@prisma/client';
import { ADToBS } from 'bikram-sambat-js';
import Image from 'next/image';

type PaymentWithDetails = Payment & {
  fee: Fee & {
    student: Student & {
      enrollments: { class: Class }[];
    };
  };
};

interface PrintReceiptButtonProps {
  payment: PaymentWithDetails;
}

const getCategoryInHindi = (category: string) => {
  const categoryMap: { [key: string]: string } = {
    'PARENT_SUPPORT': 'अभिभावक सहयोग',
    'PARENT_SUPPORT_MONTHLY': 'अभिभावक सहयोग मासिक',
    'TUITION_FEE': 'शिक्षण शुल्कं',
    'DEPOSIT_FEE': 'धरौटी शुल्क',
    'ELECTRICITY_TRANSPORT': 'विद्युत/यातायात शुल्क',
    'LIBRARY_FEE': 'पुस्तकालय शुल्क',
    'REGISTRATION_FEE': 'रजिष्ट्रेशन शुल्क',
    'IDENTITY_SPORTS': 'परिचय पत्र तथा खेलकुद',
    'EXAM_FEE_1': '| परीक्षा शुल्क',
    'EXAM_FEE_2': '|| परीक्षा शुल्क',
    'EXAM_FEE_3': '||| परीक्षा शुल्क',
    'EXAM_FEE_4': '|||| परीक्षा शुल्क',
    'SEE_EXAM_FEE': 'SEE परीक्षा',
    'BUILDING_MISC_FEE': 'भवन एवं विविध शुल्क',
    'CERTIFICATE_FEE': 'प्रमाण पत्र शुल्क',
    'GRADE_SHEET': 'लब्धाङ्क पत्र',
    'TIE_BELT': 'टाई बेल्ट'
  };
  return categoryMap[category] || category;
};

const PrintReceiptButton = ({ payment }: PrintReceiptButtonProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  const nepaliMonths = [
    'बैशाख', 'जेठ', 'आषाढ', 'श्रावण', 'भाद्र', 'आश्विन',
    'कार्तिक', 'मंसिर', 'पौष', 'माघ', 'फाल्गुन', 'चैत्र'
  ];

  const formatBSDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    const bsDate = ADToBS(dateString);
    const [bsYear, bsMonth, bsDay] = bsDate.split('-').map(Number);
    return `${nepaliMonths[bsMonth - 1]} ${bsDay}, ${bsYear}`;
  };

  const handlePrint = async () => {
    try {
      setIsGenerating(true);
      
      // Create the receipt content dynamically
      const receiptElement = document.createElement('div');
      
      const currentEnrollment = payment.fee.student.enrollments?.[0];
      const studentClass = currentEnrollment?.class;
      const receiptNumber = `RCP-${payment.id}-${Date.now().toString().slice(-6)}`;
      
      receiptElement.innerHTML = `
        <div style="
          background: white; 
          border-radius: 8px; 
          box-shadow: 0 1px 3px rgba(0,0,0,0.1); 
          border: 1px solid #e5e7eb; 
          margin: 8px; 
          width: calc(100% - 16px); 
          min-width: 0; 
          font-size: 11px; 
          padding: 10px; 
          box-sizing: border-box;
        ">
          <!-- Header -->
          <div style="
            background: #9C27B0; 
            color: white; 
            padding: 8px; 
            border-radius: 6px 6px 0 0; 
            display: flex; 
            justify-content: space-between; 
            align-items: center;
          ">
            <div style="display: flex; align-items: center; gap: 8px;">
              <img 
                src="/school_logo.png" 
                alt="School Logo" 
                style="height: 32px; width: 32px; object-fit: contain;" 
                crossorigin="anonymous"
              />
              <div>
                <h1 style="font-size: 16px; font-weight: bold; margin: 0; line-height: 1.2;">Shree Narayani Gandaki</h1>
                <p style="font-size: 10px; color: #e9d5ff; margin: 2px 0 0 0; line-height: 1.2;">Excellence in Education</p>
              </div>
            </div>
            <div style="text-align: right;">
              <p style="font-size: 10px; color: #e9d5ff; margin: 0;">Receipt #${receiptNumber}</p>
              <p style="font-size: 10px; color: #e9d5ff; margin: 2px 0 0 0;">${formatBSDate(new Date())}</p>
            </div>
          </div>

          <!-- Student Info -->
          <div style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
            <h2 style="font-size: 14px; font-weight: 600; margin: 0 0 4px 0;">Student Information</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div>
                <p style="font-size: 12px; color: #4b5563; margin: 2px 0;">
                  <span style="font-weight: 500;">Name:</span> ${payment.fee.student.name} ${payment.fee.student.surname}
                </p>
                <p style="font-size: 12px; color: #4b5563; margin: 2px 0;">
                  <span style="font-weight: 500;">Class:</span> ${studentClass?.name || 'N/A'}
                </p>
                <p style="font-size: 12px; color: #4b5563; margin: 2px 0;">
                  <span style="font-weight: 500;">Student ID:</span> ${payment.fee.student.StudentId || 'N/A'}
                </p>
              </div>
              <div>
                <p style="font-size: 12px; color: #4b5563; margin: 2px 0;">
                  <span style="font-weight: 500;">Mother's Name:</span> ${payment.fee.student.motherName || 'N/A'}
                </p>
                <p style="font-size: 12px; color: #4b5563; margin: 2px 0;">
                  <span style="font-weight: 500;">Father's Name:</span> ${payment.fee.student.fatherName || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <!-- Payment Info -->
          <div style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
            <h2 style="font-size: 14px; font-weight: 600; margin: 0 0 4px 0;">Payment Information</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div>
                <p style="font-size: 12px; color: #4b5563; margin: 2px 0;">
                  <span style="font-weight: 500;">Payment ID:</span> ${payment.id}
                </p>
                <p style="font-size: 12px; color: #4b5563; margin: 2px 0;">
                  <span style="font-weight: 500;">Category:</span> ${getCategoryInHindi(payment.category)}
                </p>
                <p style="font-size: 12px; color: #4b5563; margin: 2px 0;">
                  <span style="font-weight: 500;">Payment Date:</span> ${formatBSDate(new Date(payment.date))}
                </p>
              </div>
              <div>
                <p style="font-size: 12px; color: #4b5563; margin: 2px 0;">
                  <span style="font-weight: 500;">Amount:</span> ${Number(payment.amount).toLocaleString()}
                </p>
                <p style="font-size: 12px; color: #4b5563; margin: 2px 0;">
                  <span style="font-weight: 500;">Method:</span> ${payment.method}
                </p>
                <p style="font-size: 12px; color: #4b5563; margin: 2px 0;">
                  <span style="font-weight: 500;">Transaction ID:</span> ${payment.transactionId || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <!-- Payment Details -->
          <div style="padding: 8px;">
            <h2 style="font-size: 14px; font-weight: 600; margin: 0 0 4px 0;">Payment Details</h2>
            <div style="overflow-x: auto;">
              <table style="min-width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead style="background: #f9fafb;">
                  <tr>
                    <th style="padding: 4px; text-align: left; font-weight: 500; color: #6b7280; text-transform: uppercase;">Category</th>
                    <th style="padding: 4px; text-align: left; font-weight: 500; color: #6b7280; text-transform: uppercase;">Method</th>
                    <th style="padding: 4px; text-align: left; font-weight: 500; color: #6b7280; text-transform: uppercase;">Reference</th>
                    <th style="padding: 4px; text-align: right; font-weight: 500; color: #6b7280; text-transform: uppercase;">Amount</th>
                  </tr>
                </thead>
                <tbody style="background: white;">
                  <tr>
                    <td style="padding: 4px; border-top: 1px solid #e5e7eb;">${getCategoryInHindi(payment.category)}</td>
                    <td style="padding: 4px; border-top: 1px solid #e5e7eb;">${payment.method}</td>
                    <td style="padding: 4px; border-top: 1px solid #e5e7eb;">${payment.reference || 'N/A'}</td>
                    <td style="padding: 4px; text-align: right; border-top: 1px solid #e5e7eb;">${Number(payment.amount).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Footer -->
          <div style="padding: 8px; background: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 6px 6px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="font-size: 12px; color: #4b5563;">
                <p style="margin: 0;">Generated on ${formatBSDate(new Date())}</p>
                <p style="margin: 2px 0 0 0;">Academix Cloud School Management System</p>
              </div>
              <div style="text-align: right;">
                <p style="font-size: 12px; font-weight: 500; color: #111827; margin: 0;">Total Paid: ${Number(payment.amount).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      `;

      // Append to a temporary container
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '794px';
      tempContainer.style.height = '1123px';
      tempContainer.style.background = 'white';
      tempContainer.style.padding = '12px';
      tempContainer.style.boxSizing = 'border-box';
      
      // Add both receipts (duplicate for cutting)
      const receipt1 = receiptElement.cloneNode(true);
      const receipt2 = receiptElement.cloneNode(true);
      tempContainer.appendChild(receipt1);
      tempContainer.appendChild(receipt2);
      
      document.body.appendChild(tempContainer);
      
      // Wait for images to load
      const images = Array.from(tempContainer.querySelectorAll('img'));
      await Promise.all(
        images.map((img: any) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })
      );
      
      // Add delay for rendering
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const opt = {
        margin: [0, 0],
        filename: `payment_receipt_${payment.id}.pdf`,
        image: { 
          type: 'jpeg', 
          quality: 1
        },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          letterRendering: true,
          imageTimeout: 0,
          backgroundColor: '#ffffff',
          windowWidth: 794,
          windowHeight: 1123
        },
        jsPDF: { 
          unit: 'px', 
          format: [794, 1123],
          orientation: 'portrait',
          compress: true,
          hotfixes: ["px_scaling"]
        }
      };
      
      // Generate and save the PDF
      await html2pdf().set(opt).from(tempContainer).save();
      
      // Clean up
      document.body.removeChild(tempContainer);
      
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('There was an error generating the PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handlePrint}
      disabled={isGenerating}
      className="w-7 h-7 flex items-center justify-center rounded-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400"
      title="Print Receipt"
    >
      <Image 
        src="/view.png" 
        alt="Print" 
        width={14} 
        height={14} 
        className="object-contain"
      />
    </button>
  );
};

export default PrintReceiptButton;
