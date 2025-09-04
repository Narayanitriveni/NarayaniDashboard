"use client";

import { useRef, useState } from "react";
import { Printer, ArrowLeft } from "lucide-react";
import { ADToBS } from "bikram-sambat-js";
import { expenseCategoryNepali, incomeCategoryNepali } from "@/lib/categoryUtils";
import { ExpenseCategory, IncomeCategory } from "@prisma/client";

interface PrintFinanceReportProps {
  data: {
    records: any[];
    groupedByCategory: any[];
    summary: {
      totalIncome: number;
      totalExpense: number;
      netAmount: number;
      totalRecords: number;
      dateRange: {
        from?: string;
        to?: string;
        type?: string;
      };
              filters: {
          type?: string;
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

const PrintFinanceReport = ({ data, onClose, onBack }: PrintFinanceReportProps) => {
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

  const getCategoryNepaliName = (record: any): string => {
    if (record.type === "INCOME" && record.incomeCategory) {
      return incomeCategoryNepali[record.incomeCategory as IncomeCategory] || record.incomeCategory;
    } else if (record.type === "EXPENSE" && record.expenseCategory) {
      return expenseCategoryNepali[record.expenseCategory as ExpenseCategory] || record.expenseCategory;
    }
    return "अन्य (Other)";
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
            <title>वित्तीय रिपोर्ट - श्री नारायणी गण्डकी साधारण तथा संस्कृत मा. वि.</title>
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
              
              .amount.income { color: #059669; }
              .amount.expense { color: #dc2626; }
              .amount.profit { color: #2563eb; }
              .amount.loss { color: #ea580c; }
              
              .category-section {
                margin-bottom: 12px;
                page-break-inside: avoid;
              }
              
              .category-header {
                background: #1f2937;
                color: white;
                padding: 6px 8px;
                font-size: 11px;
                font-weight: bold;
                margin-bottom: 5px;
                display: flex;
                justify-content: space-between;
                align-items: center;
              }
              
              .category-summary {
                background: #f3f4f6;
                padding: 4px 8px;
                margin-bottom: 5px;
                font-size: 10px;
                border-left: 3px solid #6b7280;
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
                .category-section { 
                  page-break-inside: avoid;
                  margin-bottom: 8px !important;
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
                .category-header {
                  padding: 4px 6px !important;
                  font-size: 10px !important;
                }
                .category-summary {
                  padding: 3px 6px !important;
                  font-size: 9px !important;
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
                .summary-card .amount {
                  font-size: 10px !important;
                }
                .summary-card h3 {
                  font-size: 8px !important;
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

  const { summary, groupedByCategory, generatedAt } = data;

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
            <h2>वित्तीय रिपोर्ट (Finance Report)</h2>
            <p>
              रिपोर्ट प्रकार: {summary.filters.type === "ALL" ? "सबै" : summary.filters.type === "INCOME" ? "आय" : "व्यय"}
              {summary.filters.category && ` | श्रेणी: ${summary.filters.type === "INCOME" ? 
                incomeCategoryNepali[summary.filters.category as IncomeCategory] : 
                expenseCategoryNepali[summary.filters.category as ExpenseCategory]}`}
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
                  <td style={{border: "1px solid #666", padding: "2px 8px", fontSize: "10px", textAlign: "right", fontWeight: "normal"}}>कुल आय</td>
                  <td style={{border: "1px solid #666", padding: "2px 8px", fontSize: "10px", textAlign: "right", fontWeight: "bold"}}>₹{summary.totalIncome.toLocaleString()}</td>
                </tr>
                <tr style={{backgroundColor: "#f9f9f9"}}>
                  <td style={{border: "1px solid #666", padding: "2px 8px", fontSize: "10px", textAlign: "right", fontWeight: "normal"}}>कुल व्यय</td>
                  <td style={{border: "1px solid #666", padding: "2px 8px", fontSize: "10px", textAlign: "right", fontWeight: "bold"}}>₹{summary.totalExpense.toLocaleString()}</td>
                </tr>
                <tr style={{backgroundColor: "white"}}>
                  <td style={{border: "1px solid #666", padding: "2px 8px", fontSize: "10px", textAlign: "right", fontWeight: "normal"}}>
                    {summary.netAmount >= 0 ? 'कुल लाभ' : 'कुल हानि'}
                  </td>
                  <td style={{border: "1px solid #666", padding: "2px 8px", fontSize: "10px", textAlign: "right", fontWeight: "bold"}}>₹{Math.abs(summary.netAmount).toLocaleString()}</td>
                </tr>
                <tr style={{backgroundColor: "#f9f9f9"}}>
                  <td style={{border: "1px solid #666", padding: "2px 8px", fontSize: "10px", textAlign: "right", fontWeight: "normal"}}>कुल रेकर्ड</td>
                  <td style={{border: "1px solid #666", padding: "2px 8px", fontSize: "10px", textAlign: "right", fontWeight: "bold"}}>{summary.totalRecords}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* All Records in Single Table */}
          {data.records.length > 0 ? (
            <div>
              <h3 className="text-sm font-semibold mb-2">वित्तीय रेकर्ड सूची (Finance Records List)</h3>
              
              <table className="w-full text-xs" style={{borderCollapse: "collapse", border: "2px solid #000"}}>
                <thead>
                  <tr style={{backgroundColor: "#e5e5e5"}}>
                    <th style={{border: "1px solid #666", padding: "3px 4px", textAlign: "center", width: "5%", fontSize: "11px", fontWeight: "bold"}}>क्र.सं.</th>
                    <th style={{border: "1px solid #666", padding: "3px 4px", textAlign: "center", width: "8%", fontSize: "11px", fontWeight: "bold"}}>प्रकार</th>
                    <th style={{border: "1px solid #666", padding: "3px 4px", textAlign: "center", width: "25%", fontSize: "11px", fontWeight: "bold"}}>श्रेणी</th>
                    <th style={{border: "1px solid #666", padding: "3px 4px", textAlign: "center", width: "32%", fontSize: "11px", fontWeight: "bold"}}>विवरण</th>
                    <th style={{border: "1px solid #666", padding: "3px 4px", textAlign: "center", width: "15%", fontSize: "11px", fontWeight: "bold"}}>रकम</th>
                    <th style={{border: "1px solid #666", padding: "3px 4px", textAlign: "center", width: "15%", fontSize: "11px", fontWeight: "bold"}}>मिति (बि.स.)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.records.map((record: any, index: number) => (
                    <tr key={record.id} style={{backgroundColor: index % 2 === 0 ? "white" : "#f9f9f9"}}>
                      <td style={{border: "1px solid #666", padding: "2px 4px", textAlign: "center", fontSize: "10px"}}>{index + 1}</td>
                      <td style={{border: "1px solid #666", padding: "2px 4px", textAlign: "center", fontSize: "10px"}}>
                        {record.type === "INCOME" ? "आय" : "व्यय"}
                      </td>
                      <td style={{border: "1px solid #666", padding: "2px 4px", fontSize: "10px"}}>
                        {record.type === "INCOME" && record.incomeCategory
                          ? incomeCategoryNepali[record.incomeCategory as IncomeCategory] || record.incomeCategory
                          : record.type === "EXPENSE" && record.expenseCategory
                          ? expenseCategoryNepali[record.expenseCategory as ExpenseCategory] || record.expenseCategory
                          : "अन्य"
                        }
                      </td>
                      <td style={{border: "1px solid #666", padding: "2px 4px", fontSize: "10px"}}>{record.description || "-"}</td>
                      <td style={{border: "1px solid #666", padding: "2px 4px", textAlign: "right", fontSize: "10px", fontWeight: "500"}}>
                        ₹{Number(record.amount).toLocaleString()}
                      </td>
                      <td style={{border: "1px solid #666", padding: "2px 4px", textAlign: "center", fontSize: "10px"}}>
                        {formatBSDate(new Date(record.createdAt))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Category Summary at the end */}
              {groupedByCategory.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold mb-2">श्रेणी अनुसार सारांश (Category Summary)</h4>
                  <table className="w-full text-xs" style={{borderCollapse: "collapse", border: "2px solid #000"}}>
                    <thead>
                      <tr style={{backgroundColor: "#e5e5e5"}}>
                        <th style={{border: "1px solid #666", padding: "3px 4px", textAlign: "center", width: "5%", fontSize: "11px", fontWeight: "bold"}}>क्र.सं.</th>
                        <th style={{border: "1px solid #666", padding: "3px 4px", textAlign: "center", width: "10%", fontSize: "11px", fontWeight: "bold"}}>प्रकार</th>
                        <th style={{border: "1px solid #666", padding: "3px 4px", textAlign: "center", width: "45%", fontSize: "11px", fontWeight: "bold"}}>श्रेणी</th>
                        <th style={{border: "1px solid #666", padding: "3px 4px", textAlign: "center", width: "15%", fontSize: "11px", fontWeight: "bold"}}>रेकर्ड संख्या</th>
                        <th style={{border: "1px solid #666", padding: "3px 4px", textAlign: "center", width: "25%", fontSize: "11px", fontWeight: "bold"}}>कुल रकम</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedByCategory.map((categoryGroup: any, index: number) => (
                        <tr key={index} style={{backgroundColor: index % 2 === 0 ? "white" : "#f9f9f9"}}>
                          <td style={{border: "1px solid #666", padding: "2px 4px", textAlign: "center", fontSize: "10px"}}>{index + 1}</td>
                          <td style={{border: "1px solid #666", padding: "2px 4px", textAlign: "center", fontSize: "10px"}}>
                            {categoryGroup.type === "INCOME" ? "आय" : "व्यय"}
                          </td>
                          <td style={{border: "1px solid #666", padding: "2px 4px", fontSize: "10px"}}>
                            {categoryGroup.type === "INCOME" 
                              ? incomeCategoryNepali[categoryGroup.category as IncomeCategory] || categoryGroup.category
                              : expenseCategoryNepali[categoryGroup.category as ExpenseCategory] || categoryGroup.category
                            }
                          </td>
                          <td style={{border: "1px solid #666", padding: "2px 4px", textAlign: "center", fontSize: "10px"}}>{categoryGroup.count}</td>
                          <td style={{border: "1px solid #666", padding: "2px 4px", textAlign: "right", fontSize: "10px", fontWeight: "500"}}>
                            ₹{categoryGroup.totalAmount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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

export default PrintFinanceReport;
