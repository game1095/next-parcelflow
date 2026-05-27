"use client";

import React, { useState } from "react";
import * as XLSX from "xlsx";

interface ReportsExportProps {
  summaryData: any[];
  noPhotoNameData: any[];
  noPhotoRawItems: any[];
}

export default function ReportsExport({
  summaryData,
  noPhotoNameData,
  noPhotoRawItems,
}: ReportsExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportSummary = () => {
    setIsExporting(true);
    try {
      const data = summaryData.map((d) => ({
        "ที่ทำการ": d.office,
        "รหัสไปรษณีย์": d.post_code,
        "พัสดุทั้งหมด": d.total,
        "ไม่มีรูปถ่าย (No Photo)": d.no_photo,
        "รอคอย (Waiting)": d.waiting,
        "เสร็จสิ้น (Completed)": d.completed,
        "อัตราผิดพลาด (%)": d.total > 0 ? ((d.no_photo / d.total) * 100).toFixed(2) : "0.00",
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Summary");
      XLSX.writeFile(wb, "ParcelFlow_Summary_Report.xlsx");
    } catch (error) {
      console.error("Export failed", error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportNoPhotoNames = () => {
    setIsExporting(true);
    try {
      const data = noPhotoNameData.map((d) => ({
        "ชื่อเจ้าหน้าที่": d.name,
        "จำนวนพัสดุที่ไม่มีรูป": d.count,
        "ที่ทำการที่เกี่ยวข้อง": (d.offices || []).join(", "),
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "NoPhoto_Staff");
      XLSX.writeFile(wb, "ParcelFlow_Staff_NoPhoto_Report.xlsx");
    } catch (error) {
      console.error("Export failed", error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportRawItems = () => {
    setIsExporting(true);
    try {
      const data = noPhotoRawItems.map((d) => ({
        "บาร์โค้ด": d.barcode,
        "ชื่อเจ้าหน้าที่": d.name,
        "รหัสเจ้าหน้าที่": d.user_name,
        "แพลตฟอร์ม": d.file_key,
        "ที่ทำการ": d.office,
        "วันที่": d.report_date ? new Date(d.report_date).toLocaleString("th-TH") : "-",
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Raw_Items");
      XLSX.writeFile(wb, "ParcelFlow_Raw_NoPhoto_Items.xlsx");
    } catch (error) {
      console.error("Export failed", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">รายงานและการส่งออกข้อมูล</h2>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">ส่งออกข้อมูลในรูปแบบไฟล์ Excel (XLSX)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Summary Export */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-125" />
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 relative z-10">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 relative z-10">รายงานสรุปภาพรวม</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex-1 relative z-10">
            ส่งออกข้อมูลสรุปการนำจ่ายพัสดุ (Total, No Photo, อัตราผิดพลาด) แยกตามที่ทำการ
          </p>
          <button
            onClick={exportSummary}
            disabled={isExporting}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors shadow-sm shadow-blue-500/30 relative z-10 disabled:opacity-50"
          >
            ดาวน์โหลด Excel
          </button>
        </div>

        {/* Staff Export */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-125" />
          <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 relative z-10">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 relative z-10">สรุปพนักงาน (No Photo)</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex-1 relative z-10">
            ส่งออกจำนวนพัสดุที่ไม่ถ่ายรูป แยกตามรายชื่อเจ้าหน้าที่ที่พบปัญหา
          </p>
          <button
            onClick={exportNoPhotoNames}
            disabled={isExporting}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-colors shadow-sm shadow-purple-500/30 relative z-10 disabled:opacity-50"
          >
            ดาวน์โหลด Excel
          </button>
        </div>

        {/* Raw Data Export */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-125" />
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 relative z-10">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 relative z-10">ข้อมูลดิบ (No Photo)</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex-1 relative z-10">
            ข้อมูลพัสดุรายชิ้นทั้งหมดที่ไม่มีรูปถ่าย พร้อมรายละเอียดบาร์โค้ดและแพลตฟอร์ม
          </p>
          <button
            onClick={exportRawItems}
            disabled={isExporting}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors shadow-sm shadow-emerald-500/30 relative z-10 disabled:opacity-50"
          >
            ดาวน์โหลด Excel
          </button>
        </div>
      </div>
    </div>
  );
}
