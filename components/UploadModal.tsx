"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import * as XLSX from "xlsx";
import { supabase } from "@/lib/supabase";

export default function UploadModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [reportDate, setReportDate] = useState(() => {
    const today = new Date();
    const offset = today.getTimezoneOffset() * 60000;
    return new Date(today.getTime() - offset).toISOString().split('T')[0];
  });
  const [isUploading, setIsUploading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Check if current user is admin
  useEffect(() => {
    setMounted(true);
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email === 'admin@email.com') {
        setIsAdmin(true);
      }
    };
    checkAdmin();
  }, []);
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    tiktok: null,
    shopee: null,
    lazada: null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, platform: string) => {
    if (e.target.files && e.target.files[0]) {
      setFiles({ ...files, [platform]: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      // Check if data for this date already exists
      const { data: existingData, error: checkError } = await supabase
        .from('parcelFlow')
        .select('id')
        .eq('report_date', reportDate)
        .limit(1);

      if (checkError) throw checkError;

      if (existingData && existingData.length > 0) {
        alert(`มีข้อมูลรายงานประจำวันที่ ${reportDate} อยู่ในระบบแล้ว ไม่สามารถอัปโหลดซ้ำได้ครับ`);
        setIsUploading(false);
        return;
      }

      const allRecords: any[] = [];

      for (const [platform, file] of Object.entries(files)) {
        if (!file) continue;

        const fileKey = platform.charAt(0).toUpperCase() + platform.slice(1);

        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Use header: 1 to get array of arrays
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Skip the first row (header)
        for (let i = 1; i < rows.length; i++) {
          const row: any = rows[i];
          
          // Skip empty rows (no barcode in Column B)
          if (!row || !row[1]) continue;

          allRecords.push({
            file_key: fileKey,
            report_date: reportDate,
            barcode: row[1]?.toString() || null,       // Column B
            post_code: row[3]?.toString() || null,     // Column D
            office: row[4]?.toString() || null,        // Column E
            user_name: row[9]?.toString() || null,     // Column J
            name: row[10]?.toString() || null,         // Column K
            status: row[12]?.toString() || null,       // Column M
          });
        }
      }

      if (allRecords.length === 0) {
        alert("ไม่พบข้อมูลที่จะอัปโหลด หรือไฟล์ไม่ได้เลือก โปรดตรวจสอบไฟล์ Excel");
        setIsUploading(false);
        return;
      }

      // Insert to Supabase in batches if necessary, but try all at once first
      const { error } = await supabase.from('parcelFlow').insert(allRecords);

      if (error) {
        throw error;
      }

      alert(`อัปโหลดและประมวลผลข้อมูลสำเร็จจำนวน ${allRecords.length} รายการ!`);
      setIsOpen(false);
      window.location.reload(); // Refresh to show new data
      
    } catch (error: any) {
      console.error("Error uploading:", error);
      alert("เกิดข้อผิดพลาดในการอัปโหลด: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-indigo-200 dark:shadow-none"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        อัปโหลดไฟล์ (Excel)
      </button>

      {mounted && isOpen && createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-gray-900/40 backdrop-blur-md transition-all">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[95vh] border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700 shrink-0">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                อัปโหลดไฟล์ข้อมูล (Excel)
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
              {/* Date Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  รายงานประจำวันที่
                </label>
                <input
                  type="date"
                  required
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              {/* File Uploads */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  เลือกไฟล์สำหรับแต่ละแพลตฟอร์ม
                </label>

                {/* Tiktok */}
                <div className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50">
                  <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white shrink-0">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Tiktok</p>
                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={(e) => handleFileChange(e, "tiktok")}
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 dark:file:bg-gray-700 dark:file:text-gray-300 dark:hover:file:bg-gray-600"
                    />
                  </div>
                </div>

                {/* Shopee */}
                <div className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50">
                  <div className="w-10 h-10 rounded-full bg-[#ee4d2d] flex items-center justify-center text-white shrink-0">
                    <span className="font-bold text-lg">S</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Shopee</p>
                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={(e) => handleFileChange(e, "shopee")}
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#ee4d2d]/10 file:text-[#ee4d2d] hover:file:bg-[#ee4d2d]/20 dark:file:bg-[#ee4d2d]/20 dark:hover:file:bg-[#ee4d2d]/30"
                    />
                  </div>
                </div>

                {/* Lazada */}
                <div className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50">
                  <div className="w-10 h-10 rounded-full bg-[#0f146d] flex items-center justify-center text-white shrink-0">
                    <span className="font-bold text-lg font-serif">L</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Lazada</p>
                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={(e) => handleFileChange(e, "lazada")}
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#0f146d]/10 file:text-[#0f146d] hover:file:bg-[#0f146d]/20 dark:file:bg-[#0f146d]/20 dark:hover:file:bg-[#0f146d]/30"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex gap-3 justify-end border-t border-gray-100 dark:border-gray-700 shrink-0 mt-auto">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-xl transition-colors shadow-sm shadow-indigo-200 dark:shadow-none flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      กำลังประมวลผล...
                    </>
                  ) : (
                    'ยืนยันอัปโหลด'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
