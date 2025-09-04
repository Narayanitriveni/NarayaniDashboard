"use client";

import { useRef, useState } from "react";
import { Printer, ArrowLeft } from "lucide-react";
import { ADToBS } from "bikram-sambat-js";
import { FeeCategory, FeeStatus } from "@prisma/client";

interface PrintFeeReportProps {
  data: {
    records: any[];
    groupedByClass: any[];
    groupedByStatus: any[];
    summary: {
      totalAmount: number;
      totalPaid: number;
      totalDue: number;
      totalRecords: number;
      dateRange: {
        from?: string;
        to?: string;
        type?: string;
      };
      filters: {
        classId?: string;
        className?: string;
        status?: string;
        category?: string;
        fromDateBS?: string;
        toDateBS?: string;
      };
    };
    generatedAt: Date;
  };
  onClose: () => void;
  onBack: () => void;
}

const feeCategoryNepali: Record<FeeCategory, string> = {
  PARENT_SUPPORT: "अभिभावक सहयोग",
  PARENT_SUPPORT_MONTHLY: "अभिभावक सहयोग मासिक",
  TUITION_FEE: "शिक्षण शुल्क",
  DEPOSIT_FEE: "धरौटी शुल्क",
  ELECTRICITY_TRANSPORT: "विद्युत/यातायात शुल्क",
  LIBRARY_FEE: "पुस्तकालय शुल्क",
  REGISTRATION_FEE: "रजिष्ट्रेशन शुल्क",
  IDENTITY_SPORTS: "परिचय पत्र तथा खेलकुद",
  EXAM_FEE_1: "। परीक्षा शुल्क",
  EXAM_FEE_2: "|| परीक्षा शुल्क",
  EXAM_FEE_3: "||| परीक्षा शुल्क",
  EXAM_FEE_4: "|||| परीक्षा शुल्क",
  SEE_EXAM_FEE: "SEE परीक्षा",
  BUILDING_MISC_FEE: "भवन एवं विविध शुल्क",
  CERTIFICATE_FEE: "प्रमाण पत्र शुल्क",
  GRADE_SHEET: "लब्धाङ्क पत्र",
  TIE_BELT: "टाई बेल्ट",
};

const feeStatusNepali: Record<FeeStatus, string> = {
  PAID: "भुक्तान गरिएको",
  UNPAID: "भुक्तान नगरिएको",
  PARTIAL: "आंशिक भुक्तान",
  OVERDUE: "समय सकिएको",
  WAIVED: "माफ गरिएको",
};

const PrintFeeReport = ({ data, onClose, onBack }: PrintFeeReportProps) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const nepaliMonths = [
    'बैशाख', 'जेठ', 'आषाढ', 'श्रावण', 'भाद्र', 'आश्विन',
    'कार्तिक', 'मंसिर', 'पौष', 'माघ', 'फाल्गुन', 'चैत्र'
  ];

  const formatBSDate = (date: Date) => {
    const bsDate = ADToBS(date.toISOString().split('T')[0]);
    const [year, month, day] = bsDate.split('-').map(Number);
    return `${nepaliMonths[month - 1]} ${day}, ${year}`;
  };

  const formatBSDateDisplay = (bsDateString?: string) => {
    if (!bsDateString) return "";
    const [year, month, day] = bsDateString.split('-').map(Number);
    return `${nepaliMonths[month - 1]} ${day}, ${year}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'text-green-700';
      case 'UNPAID': return 'text-red-700';
      case 'PARTIAL': return 'text-yellow-700';
      case 'OVERDUE': return 'text-orange-700';
      case 'WAIVED': return 'text-blue-700';
      default: return 'text-gray-700';
    }
  };

  const handlePrint = async () => {
    if (!printRef.current) return;
    
    setIsPrinting(true);
    
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow popups to print the report');
        return;
      }

      const printContent = printRef.current.innerHTML;
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>शुल्क रिपोर्ट - श्री नारायणी गण्डकी साधारण तथा संस्कृत मा. वि.</title>
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              
              body {
                font-family: 'Times New Roman', serif;
                line-height: 1.2;
                color: #000;
                background: white;
                font-size: 11px;
              }
              
              .print-content {
                padding: 10px;
                max-width: 100%;
                margin: 0;
              }
              
              .header {
                text-align: center;
                margin-bottom: 15px;
                border-bottom: 1px solid #000;
                padding-bottom: 8px;
              }
              
              .header h1 {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 3px;
                color: #1a1a1a;
              }
              
              .header h2 {
                font-size: 14px;
                margin-bottom: 3px;
                color: #333;
              }
              
              .header p {
                font-size: 10px;
                margin: 1px 0;
                color: #666;
              }
              
              .summary-section {
                margin-bottom: 8px;
              }
              
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 8px;
                font-size: 8px;
                border: 2px solid #000;
              }
              
              th, td {
                border: 1px solid #666;
                padding: 2px 4px;
                text-align: left;
                vertical-align: top;
              }
              
              th {
                background: #e5e5e5;
                font-weight: bold;
                font-size: 8px;
                text-align: center;
                padding: 3px 4px;
              }
              
              tbody tr:nth-child(even) {
                background: #f9f9f9;
              }
              
              tbody tr:nth-child(odd) {
                background: white;
              }
              
              .text-right { text-align: right; }
              .text-center { text-align: center; }
              
              .no-records {
                text-align: center;
                padding: 15px;
                color: #666;
                font-style: italic;
                font-size: 10px;
              }
              
              @media print {
                body { 
                  font-size: 10px !important; 
                  background: white !important;
                  margin: 0 !important;
                }
                .print-content { 
                  padding: 5px !important; 
                  box-shadow: none;
                  margin: 0 !important;
                }
                .header {
                  margin-bottom: 10px !important;
                  padding-bottom: 5px !important;
                }
                .summary-section {
                  margin-bottom: 5px !important;
                }
                table {
                  margin-bottom: 5px !important;
                  font-size: 7px !important;
                  border: 1px solid #000 !important;
                }
                th, td {
                  padding: 1px 2px !important;
                  border: 1px solid #666 !important;
                }
                th {
                  font-size: 7px !important;
                  background: #e5e5e5 !important;
                  font-weight: bold !important;
                }
                .header h1 {
                  font-size: 14px !important;
                }
                .header h2 {
                  font-size: 12px !important;
                }
                .header p {
                  font-size: 9px !important;
                }
              }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `);
      
      printWindow.document.close();
      
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      };
      
    } catch (error) {
      console.error('Print error:', error);
      alert('Failed to print the report');
    } finally {
      setIsPrinting(false);
    }
  };

  const { summary, records, generatedAt } = data;

  return (
    <div className="flex flex-col gap-4">
      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          पछाडि फर्कनुहोस् (Back)
        </button>
        
        <button
          onClick={handlePrint}
          disabled={isPrinting}
          className="flex items-center gap-2 bg-lamaYellow hover:bg-lamaYellow/80 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Printer className="h-4 w-4" />
          {isPrinting ? 'प्रिन्ट गर्दै...' : 'प्रिन्ट गर्नुहोस् (Print)'}
        </button>
      </div>

      {/* Print Preview */}
      <div className="border border-gray-300 bg-white max-h-[80vh] overflow-y-auto">
        <div ref={printRef} className="print-content p-4 text-xs">
          {/* Header */}
          <div className="header">
            <h1>श्री नारायणी गण्डकी साधारण तथा संस्कृत मा. वि.</h1>
            <h2>शुल्क रिपोर्ट (Fee Report)</h2>
            <p>
              रिपोर्ट प्रकार: {summary.filters.status === "ALL" ? "सबै" : feeStatusNepali[summary.filters.status as FeeStatus]}
              {summary.filters.category && ` | श्रेणी: ${feeCategoryNepali[summary.filters.category as FeeCategory]}`}
              {summary.filters.className && ` | कक्षा: ${summary.filters.className}`}
            </p>
            {(summary.filters.fromDateBS || summary.filters.toDateBS) && (
              <p>
                मिति: {summary.filters.fromDateBS ? formatBSDateDisplay(summary.filters.fromDateBS) : "सुरु"} देखि {summary.filters.toDateBS ? formatBSDateDisplay(summary.filters.toDateBS) : "अन्त"} (बि.स.)
              </p>
            )}
            <p>रिपोर्ट जेनेरेट मिति: {formatBSDate(new Date(generatedAt))}</p>
          </div>

          {/* Compact Summary Section */}
          <div className="mb-3">
            <table className="w-full text-xs" style={{borderCollapse: "collapse", border: "2px solid #000"}}>
              <thead>
                <tr style={{backgroundColor: "#e5e5e5"}}>
                  <th colSpan={2} style={{border: "1px solid #666", padding: "2px 4px", textAlign: "left", fontSize: "11px", fontWeight: "bold"}}>
                    सारांश (Summary)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr style={{backgroundColor: "white"}}>
                  <td style={{border: "1px solid #666", padding: "2px 8px", fontSize: "10px", textAlign: "right", fontWeight: "normal"}}>कुल शुल्क रकम</td>
                  <td style={{border: "1px solid #666", padding: "2px 8px", fontSize: "10px", textAlign: "right", fontWeight: "bold"}}>₹{summary.totalAmount.toLocaleString()}</td>
                </tr>
                <tr style={{backgroundColor: "#f9f9f9"}}>
                  <td style={{border: "1px solid #666", padding: "2px 8px", fontSize: "10px", textAlign: "right", fontWeight: "normal"}}>कुल भुक्तान गरिएको</td>
                  <td style={{border: "1px solid #666", padding: "2px 8px", fontSize: "10px", textAlign: "right", fontWeight: "bold"}}>₹{summary.totalPaid.toLocaleString()}</td>
                </tr>
                <tr style={{backgroundColor: "white"}}>
                  <td style={{border: "1px solid #666", padding: "2px 8px", fontSize: "10px", textAlign: "right", fontWeight: "normal"}}>कुल बाँकी रकम</td>
                  <td style={{border: "1px solid #666", padding: "2px 8px", fontSize: "10px", textAlign: "right", fontWeight: "bold"}}>₹{summary.totalDue.toLocaleString()}</td>
                </tr>
                <tr style={{backgroundColor: "#f9f9f9"}}>
                  <td style={{border: "1px solid #666", padding: "2px 8px", fontSize: "10px", textAlign: "right", fontWeight: "normal"}}>कुल रेकर्ड</td>
                  <td style={{border: "1px solid #666", padding: "2px 8px", fontSize: "10px", textAlign: "right", fontWeight: "bold"}}>{summary.totalRecords}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* All Records in Single Table */}
          {records.length > 0 ? (
            <div>
              <h3 className="text-sm font-semibold mb-2">शुल्क रेकर्ड सूची (Fee Records List)</h3>
              
              <table className="w-full text-xs" style={{borderCollapse: "collapse", border: "2px solid #000"}}>
                <thead>
                  <tr style={{backgroundColor: "#e5e5e5"}}>
                    <th style={{border: "1px solid #666", padding: "3px 4px", textAlign: "center", width: "4%", fontSize: "11px", fontWeight: "bold"}}>क्र.सं.</th>
                    <th style={{border: "1px solid #666", padding: "3px 4px", textAlign: "center", width: "12%", fontSize: "11px", fontWeight: "bold"}}>विद्यार्थी ID</th>
                    <th style={{border: "1px solid #666", padding: "3px 4px", textAlign: "center", width: "15%", fontSize: "11px", fontWeight: "bold"}}>विद्यार्थी नाम</th>
                    <th style={{border: "1px solid #666", padding: "3px 4px", textAlign: "center", width: "12%", fontSize: "11px", fontWeight: "bold"}}>बुबाको नाम</th>
                    <th style={{border: "1px solid #666", padding: "3px 4px", textAlign: "center", width: "12%", fontSize: "11px", fontWeight: "bold"}}>आमाको नाम</th>
                    <th style={{border: "1px solid #666", padding: "3px 4px", textAlign: "center", width: "10%", fontSize: "11px", fontWeight: "bold"}}>फोन नम्बर</th>
                    <th style={{border: "1px solid #666", padding: "3px 4px", textAlign: "center", width: "6%", fontSize: "11px", fontWeight: "bold"}}>कक्षा</th>
                    <th style={{border: "1px solid #666", padding: "3px 4px", textAlign: "center", width: "10%", fontSize: "11px", fontWeight: "bold"}}>श्रेणी</th>
                    <th style={{border: "1px solid #666", padding: "3px 4px", textAlign: "center", width: "8%", fontSize: "11px", fontWeight: "bold"}}>कुल रकम</th>
                    <th style={{border: "1px solid #666", padding: "3px 4px", textAlign: "center", width: "8%", fontSize: "11px", fontWeight: "bold"}}>बाँकी रकम</th>
                    <th style={{border: "1px solid #666", padding: "3px 4px", textAlign: "center", width: "7%", fontSize: "11px", fontWeight: "bold"}}>स्थिति</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record: any, index: number) => (
                    <tr key={record.id} style={{backgroundColor: index % 2 === 0 ? "white" : "#f9f9f9"}}>
                      <td style={{border: "1px solid #666", padding: "2px 4px", textAlign: "center", fontSize: "10px"}}>{index + 1}</td>
                      <td style={{border: "1px solid #666", padding: "2px 4px", textAlign: "center", fontSize: "10px"}}>{record.student?.StudentId || "-"}</td>
                      <td style={{border: "1px solid #666", padding: "2px 4px", fontSize: "10px"}}>{record.student?.name} {record.student?.surname}</td>
                      <td style={{border: "1px solid #666", padding: "2px 4px", fontSize: "10px"}}>{record.student?.fatherName || "-"}</td>
                      <td style={{border: "1px solid #666", padding: "2px 4px", fontSize: "10px"}}>{record.student?.motherName || "-"}</td>
                      <td style={{border: "1px solid #666", padding: "2px 4px", textAlign: "center", fontSize: "10px"}}>{record.student?.phone || "-"}</td>
                      <td style={{border: "1px solid #666", padding: "2px 4px", textAlign: "center", fontSize: "10px"}}>
                        {record.student?.enrollments?.[0]?.class?.name || record.class?.name || "-"}
                      </td>
                      <td style={{border: "1px solid #666", padding: "2px 4px", fontSize: "10px"}}>
                        {feeCategoryNepali[record.category as FeeCategory] || record.category}
                      </td>
                      <td style={{border: "1px solid #666", padding: "2px 4px", textAlign: "right", fontSize: "10px", fontWeight: "500"}}>
                        ₹{Number(record.totalAmount).toLocaleString()}
                      </td>
                      <td style={{border: "1px solid #666", padding: "2px 4px", textAlign: "right", fontSize: "10px", fontWeight: "500"}}>
                        ₹{(Number(record.totalAmount) - Number(record.paidAmount)).toLocaleString()}
                      </td>
                      <td style={{border: "1px solid #666", padding: "2px 4px", textAlign: "center", fontSize: "10px"}}>
                        <span className={getStatusColor(record.status)}>
                          {feeStatusNepali[record.status as FeeStatus] || record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-records">
              कुनै रेकर्ड फेला परेन (No records found)
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrintFeeReport;
