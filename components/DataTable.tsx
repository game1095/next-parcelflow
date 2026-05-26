"use client";

import { useState, useMemo, useEffect, useEffect as useReactEffect } from "react";
import { createPortal } from "react-dom";

type NoPhotoItem = {
  barcode: string;
  user_name: string;
  name: string;
  file_key: string;
  report_date: string | null;
};

type SummaryRow = {
  office: string;
  post_code: string;
  total: number;
  no_photo: number;
  no_photo_details: {
    tiktok: number;
    shopee: number;
    lazada: number;
    other: number;
  };
  no_photo_items: NoPhotoItem[];
  waiting: number;
  completed: number;
  report_date: string | null;
};

export default function DataTable({ data }: { data: SummaryRow[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof SummaryRow;
    direction: "asc" | "desc";
  } | null>({ key: "no_photo", direction: "desc" });

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [selectedNoPhotoRow, setSelectedNoPhotoRow] =
    useState<SummaryRow | null>(null);
  const [mounted, setMounted] = useState(false);

  useReactEffect(() => {
    setMounted(true);
  }, []);

  // Reset to page 1 when searching or sorting changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortConfig]);

  // Group No Photo Items for Modal
  const groupedNoPhotoItems = useMemo(() => {
    if (!selectedNoPhotoRow?.no_photo_items) return [];

    // Group by raw date string
    const groups: Record<string, NoPhotoItem[]> = {};
    selectedNoPhotoRow.no_photo_items.forEach((item) => {
      const rawDate = item.report_date
        ? item.report_date.split("T")[0]
        : "ไม่ระบุวันที่";
      if (!groups[rawDate]) groups[rawDate] = [];
      groups[rawDate].push(item);
    });

    // Sort groups descending (newest first)
    return Object.keys(groups)
      .sort((a, b) => {
        if (a === "ไม่ระบุวันที่") return 1;
        if (b === "ไม่ระบุวันที่") return -1;
        return b.localeCompare(a);
      })
      .map((dateKey) => ({
        date:
          dateKey === "ไม่ระบุวันที่"
            ? "ไม่ระบุวันที่"
            : new Date(dateKey).toLocaleDateString("th-TH", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
        items: groups[dateKey],
      }));
  }, [selectedNoPhotoRow]);

  // Sorting and Filtering Logic
  const filteredAndSortedData = useMemo(() => {
    let processData = [...data];

    // Filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      processData = processData.filter(
        (row) =>
          row.office.toLowerCase().includes(lowerSearch) ||
          row.post_code.toLowerCase().includes(lowerSearch),
      );
    }

    // Sort
    if (sortConfig !== null) {
      processData.sort((a, b) => {
        let valA = a[sortConfig.key] as any;
        let valB = b[sortConfig.key] as any;

        if (sortConfig.key === "office") {
          valA = a.post_code + a.office;
          valB = b.post_code + b.office;
        }

        if (valA < valB) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return processData;
  }, [data, searchTerm, sortConfig]);

  const requestSort = (key: keyof SummaryRow) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof SummaryRow) => {
    if (sortConfig?.key === key) {
      return sortConfig.direction === "asc" ? "↑" : "↓";
    }
    return "↕";
  };

  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize);
  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div className="w-full">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 rounded-t-2xl">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          สรุปจำนวนพัสดุแยกตามที่ทำการ (Office)
        </h2>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-xl bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500 transition-all outline-none"
            placeholder="ค้นหาที่ทำการ หรือรหัสไปรษณีย์..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-b-2xl">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 border-y border-gray-200 dark:border-gray-700">
            <tr>
              <th
                className="px-4 py-3 font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                onClick={() => requestSort("office")}
              >
                <div className="flex items-center gap-2">
                  ที่ทำการ
                  <span className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                    {getSortIcon("office")}
                  </span>
                </div>
              </th>
              <th
                className="px-4 py-3 font-medium text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                onClick={() => requestSort("report_date")}
              >
                <div className="flex items-center justify-center gap-2">
                  วันที่รายงาน
                  <span className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                    {getSortIcon("report_date")}
                  </span>
                </div>
              </th>
              <th
                className="px-4 py-3 font-medium text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                onClick={() => requestSort("total")}
              >
                <div className="flex items-center justify-center gap-2">
                  รวมทั้งหมด (Total)
                  <span className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                    {getSortIcon("total")}
                  </span>
                </div>
              </th>
              <th
                className="px-4 py-3 font-medium text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                onClick={() => requestSort("no_photo")}
              >
                <div className="flex items-center justify-center gap-2">
                  No Photo
                  <span className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                    {getSortIcon("no_photo")}
                  </span>
                </div>
              </th>
              <th
                className="px-4 py-3 font-medium text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                onClick={() => requestSort("waiting")}
              >
                <div className="flex items-center justify-center gap-2">
                  Waiting
                  <span className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                    {getSortIcon("waiting")}
                  </span>
                </div>
              </th>
              <th
                className="px-4 py-3 font-medium text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                onClick={() => requestSort("completed")}
              >
                <div className="flex items-center justify-center gap-2">
                  Completed
                  <span className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                    {getSortIcon("completed")}
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, index) => (
                <tr
                  key={`${row.office}_${row.post_code}_${index}`}
                  className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {row.office}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {row.post_code}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      {row.report_date
                        ? new Date(row.report_date).toLocaleDateString("th-TH")
                        : "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-bold text-gray-800 dark:text-gray-200">
                      {row.total}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center align-middle">
                    <button
                      onClick={() =>
                        row.no_photo > 0 && setSelectedNoPhotoRow(row)
                      }
                      className={`group relative flex flex-col items-center justify-center w-full p-2 rounded-2xl transition-all duration-300 ${
                        row.no_photo > 0
                          ? "hover:bg-red-50/80 dark:hover:bg-red-900/10 border border-transparent hover:border-red-100 dark:hover:border-red-900/30 cursor-pointer"
                          : "cursor-default"
                      }`}
                    >
                      {/* Main Badge */}
                      <div className="flex items-center justify-center gap-1.5">
                        <span
                          className={`inline-flex items-center justify-center min-w-[2.5rem] px-3 py-1 rounded-lg text-sm font-bold transition-all duration-300 ${
                            row.no_photo > 0
                              ? "bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-md shadow-red-500/20 group-hover:shadow-red-500/40 group-hover:scale-105 group-hover:-translate-y-0.5"
                              : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                          }`}
                        >
                          {row.no_photo > 0 ? row.no_photo : "-"}
                        </span>
                        {row.no_photo > 0 && (
                          <svg
                            className="w-4 h-4 text-red-500 dark:text-red-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </div>

                      {/* Platform Breakdown */}
                      {row.no_photo > 0 && (
                        <div className="flex flex-wrap items-center justify-center gap-1 mt-2">
                          {row.no_photo_details.tiktok > 0 && (
                            <div
                              className="flex items-center gap-1 bg-[#000000] text-white px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider shadow-sm group-hover:scale-105 transition-transform duration-300"
                              title="Tiktok"
                            >
                              <span className="w-1 h-1 rounded-full bg-[#00f2fe] shadow-[0_0_4px_#00f2fe] animate-pulse"></span>
                              Tiktok : {row.no_photo_details.tiktok}
                            </div>
                          )}
                          {row.no_photo_details.shopee > 0 && (
                            <div
                              className="flex items-center gap-1 bg-gradient-to-r from-[#ee4d2d] to-[#ff7337] text-white px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider shadow-sm group-hover:scale-105 transition-transform duration-300"
                              title="Shopee"
                            >
                              <span className="w-1 h-1 rounded-full bg-white shadow-[0_0_4px_#fff]"></span>
                              Shopee : {row.no_photo_details.shopee}
                            </div>
                          )}
                          {row.no_photo_details.lazada > 0 && (
                            <div
                              className="flex items-center gap-1 bg-gradient-to-r from-[#0f146d] to-[#1a237e] text-white px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider shadow-sm group-hover:scale-105 transition-transform duration-300"
                              title="Lazada"
                            >
                              <span className="w-1 h-1 rounded-full bg-pink-400 shadow-[0_0_4px_#f472b6]"></span>
                              Lazada : {row.no_photo_details.lazada}
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        row.waiting > 0
                          ? "bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800"
                          : "text-gray-400"
                      }`}
                    >
                      {row.waiting > 0 ? row.waiting : "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        row.completed > 0
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800"
                          : "text-gray-400"
                      }`}
                    >
                      {row.completed > 0 ? row.completed : "-"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                >
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <svg
                      className="w-10 h-10 text-gray-300 dark:text-gray-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                      />
                    </svg>
                    <p>ไม่พบข้อมูลที่ค้นหา</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination summary */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-b-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          แสดงข้อมูล{" "}
          {filteredAndSortedData.length > 0
            ? (currentPage - 1) * pageSize + 1
            : 0}{" "}
          ถึง {Math.min(currentPage * pageSize, filteredAndSortedData.length)}{" "}
          จากทั้งหมด {filteredAndSortedData.length} รายการ
        </span>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors shadow-sm"
            >
              ก่อนหน้า
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium px-2">
              หน้า {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors shadow-sm"
            >
              ถัดไป
            </button>
          </div>
        )}
      </div>
      {/* Modal for No Photo Details */}
      {mounted && selectedNoPhotoRow && createPortal(
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-gray-900/60 backdrop-blur-sm modal-active"
          onClick={() => setSelectedNoPhotoRow(null)}
        >
          <div
            className="bg-gray-50 dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden transform transition-all border border-gray-200 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:px-8 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 relative">
              <div className="flex items-center gap-4 w-full">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/40 flex items-center justify-center border border-indigo-100 dark:border-indigo-800 shrink-0 shadow-inner">
                  <svg className="w-7 h-7 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0 pr-8 sm:pr-0">
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-1 truncate">
                    รายการ No Photo: <span className="text-indigo-600 dark:text-indigo-400">ที่ทำการ{selectedNoPhotoRow.office}</span>
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-md">
                      รวมทั้งหมด {selectedNoPhotoRow.no_photo} ครั้ง
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span className="font-medium bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                      รหัส ปณ. {selectedNoPhotoRow.post_code}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedNoPhotoRow(null)}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 absolute sm:static top-5 right-5 bg-white dark:bg-gray-800 sm:bg-transparent shadow-sm sm:shadow-none border border-gray-100 dark:border-gray-700 sm:border-transparent"
                title="ปิดหน้าต่าง"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 relative scroll-smooth">
              {groupedNoPhotoItems.length > 0 ? (
                <div className="space-y-8 pb-4">
                  {groupedNoPhotoItems.map((group, groupIdx) => (
                    <div key={groupIdx} className="relative">
                      {/* Date Header */}
                      <div className="relative flex items-center gap-3 mb-4 bg-gray-50/95 dark:bg-gray-900/95 py-2.5 px-2 -mx-2 rounded-xl border border-transparent">
                        <div className="w-1.5 h-6 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full shadow-sm"></div>
                        <h4 className="font-extrabold text-gray-800 dark:text-gray-100 text-lg tracking-tight">
                          {group.date}
                        </h4>
                        <div className="flex-1 border-t border-dashed border-gray-300 dark:border-gray-700 mx-2"></div>
                        <span className="text-xs font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full shadow-sm">
                          {group.items.length} รายการ
                        </span>
                      </div>
                      
                      {/* Grid of Items */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {group.items.map((item, idx) => {
                          const platform = item.file_key.toLowerCase();
                          let bgClass = "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300";
                          let borderClass = "border-gray-200 dark:border-gray-700 hover:border-gray-300";
                          let leftLineClass = "bg-gray-300 dark:bg-gray-600";
                          
                          if (platform === "tiktok") {
                            bgClass = "bg-black text-white";
                            leftLineClass = "bg-black dark:bg-gray-400";
                          } else if (platform === "shopee") {
                            bgClass = "bg-[#ee4d2d] text-white";
                            leftLineClass = "bg-[#ee4d2d]";
                          } else if (platform === "lazada") {
                            bgClass = "bg-[#0f146d] text-white";
                            leftLineClass = "bg-[#0f146d] dark:bg-blue-400";
                          }

                          return (
                            <div
                              key={idx}
                              className={`bg-white dark:bg-gray-800 border ${borderClass} rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col gap-3 relative group overflow-hidden`}
                            >
                              {/* Left Edge Decoration */}
                              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${leftLineClass} opacity-80 group-hover:opacity-100 transition-opacity`}></div>
                              
                              <div className="flex justify-between items-start gap-3 pl-1.5">
                                <div className="flex-1 min-w-0">
                                  <a
                                    href={`https://qms.thailandpost.com/Web/Tracking/singleTracking.aspx?type=item&id=${item.barcode}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-mono font-black text-gray-900 dark:text-white text-lg hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline flex items-center gap-1.5 transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate"
                                    title="คลิกเพื่อตรวจสอบสถานะพัสดุ"
                                  >
                                    {item.barcode}
                                    <svg
                                      className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all text-indigo-500 shrink-0"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                  </a>
                                </div>
                                <span className={`inline-flex justify-center shrink-0 min-w-[75px] text-[11px] px-3 py-1.5 rounded-lg shadow-sm font-bold tracking-wider uppercase ${bgClass}`}>
                                  {item.file_key || "Unknown"}
                                </span>
                              </div>
                              
                              <div className="pl-1.5 flex flex-col gap-2.5 mt-1 border-t border-gray-100 dark:border-gray-700/50 pt-3">
                                <div className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300">
                                  <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                    <svg className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                  </div>
                                  <span className="truncate font-medium" title={item.name}>
                                    <span className="text-gray-900 dark:text-gray-100">{item.name || "-"}</span>
                                  </span>
                                </div>
                                <div className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300">
                                  <div className="w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                                    <svg className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                    </svg>
                                  </div>
                                  <span className="truncate font-medium" title={item.user_name}>
                                    ID: <span className="text-gray-900 dark:text-gray-100">{item.user_name || "-"}</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-5">
                    <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-xl font-bold text-gray-700 dark:text-gray-300">ไม่มีรายละเอียดข้อมูล</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 flex justify-end">
              <button
                onClick={() => setSelectedNoPhotoRow(null)}
                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 rounded-xl font-bold transition-all shadow-sm hover:shadow active:scale-95 flex items-center gap-2"
              >
                <span>ปิดหน้าต่าง</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
