"use client";

import { useState, useMemo, useEffect } from "react";

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
                className="px-6 py-4 font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
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
                className="px-6 py-4 font-medium text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
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
                className="px-6 py-4 font-medium text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
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
                className="px-6 py-4 font-medium text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
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
                className="px-6 py-4 font-medium text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
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
                className="px-6 py-4 font-medium text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
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
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {row.office}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {row.post_code}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      {row.report_date
                        ? new Date(row.report_date).toLocaleDateString("th-TH")
                        : "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-bold text-gray-800 dark:text-gray-200">
                      {row.total}
                    </span>
                  </td>
                  <td className="px-6 py-2 text-center">
                    <button
                      onClick={() =>
                        row.no_photo > 0 && setSelectedNoPhotoRow(row)
                      }
                      className={`flex flex-col items-center gap-1.5 w-full p-2 rounded-lg transition-colors ${
                        row.no_photo > 0
                          ? "hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                          : "cursor-default"
                      }`}
                    >
                      <span
                        className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold ${
                          row.no_photo > 0
                            ? "bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800"
                            : "text-gray-400"
                        }`}
                      >
                        {row.no_photo > 0 ? row.no_photo : "-"}
                      </span>
                      {row.no_photo > 0 && (
                        <div className="flex items-center gap-1.5 text-[10px] mt-0.5">
                          {row.no_photo_details.tiktok > 0 && (
                            <span
                              className="bg-black text-white px-1.5 py-0.5 rounded shadow-sm"
                              title="Tiktok"
                            >
                              T: {row.no_photo_details.tiktok}
                            </span>
                          )}
                          {row.no_photo_details.shopee > 0 && (
                            <span
                              className="bg-[#ee4d2d] text-white px-1.5 py-0.5 rounded shadow-sm"
                              title="Shopee"
                            >
                              S: {row.no_photo_details.shopee}
                            </span>
                          )}
                          {row.no_photo_details.lazada > 0 && (
                            <span
                              className="bg-[#0f146d] text-white px-1.5 py-0.5 rounded shadow-sm"
                              title="Lazada"
                            >
                              L: {row.no_photo_details.lazada}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold ${
                        row.waiting > 0
                          ? "bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800"
                          : "text-gray-400"
                      }`}
                    >
                      {row.waiting > 0 ? row.waiting : "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold ${
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
      {selectedNoPhotoRow && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm"
          onClick={() => setSelectedNoPhotoRow(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/80 dark:bg-gray-800/80">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                <span className="bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400 p-2 rounded-xl">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </span>
                รายการ No Photo - ที่ทำการ {selectedNoPhotoRow.office}
              </h3>
              <button
                onClick={() => setSelectedNoPhotoRow(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 bg-gray-50/30 dark:bg-gray-900/30">
              {groupedNoPhotoItems.length > 0 ? (
                <div className="space-y-6">
                  {groupedNoPhotoItems.map((group, groupIdx) => (
                    <div key={groupIdx} className="space-y-3 relative">
                      <div className="sticky top-0 z-10 -mx-4 px-4 py-2 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-md border-y border-gray-200 dark:border-gray-700 flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-indigo-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <h4 className="font-bold text-gray-800 dark:text-gray-200">
                          {group.date}
                        </h4>
                        <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                          {group.items.length} รายการ
                        </span>
                      </div>

                      <div className="space-y-3">
                        {group.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-100 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="flex-shrink-0 pt-0.5">
                              {item.file_key.toLowerCase() === "tiktok" && (
                                <span className="inline-flex justify-center min-w-[70px] bg-black text-white text-xs px-2.5 py-1.5 rounded-lg shadow-sm font-semibold">
                                  Tiktok
                                </span>
                              )}
                              {item.file_key.toLowerCase() === "shopee" && (
                                <span className="inline-flex justify-center min-w-[70px] bg-[#ee4d2d] text-white text-xs px-2.5 py-1.5 rounded-lg shadow-sm font-semibold">
                                  Shopee
                                </span>
                              )}
                              {item.file_key.toLowerCase() === "lazada" && (
                                <span className="inline-flex justify-center min-w-[70px] bg-[#0f146d] text-white text-xs px-2.5 py-1.5 rounded-lg shadow-sm font-semibold">
                                  Lazada
                                </span>
                              )}
                              {!["tiktok", "shopee", "lazada"].includes(
                                item.file_key.toLowerCase(),
                              ) && (
                                <span className="inline-flex justify-center min-w-[70px] bg-gray-200 text-gray-800 text-xs px-2.5 py-1.5 rounded-lg shadow-sm font-semibold">
                                  {item.file_key || "Unknown"}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                                <a
                                  href={`https://qms.thailandpost.com/Web/Tracking/singleTracking.aspx?type=item&id=${item.barcode}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-base hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline flex items-center gap-1 transition-colors"
                                  title="คลิกเพื่อตรวจสอบสถานะพัสดุ"
                                >
                                  {item.barcode}
                                  <svg
                                    className="w-4 h-4 opacity-70"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                    />
                                  </svg>
                                </a>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-gray-300">
                                <div className="flex items-start gap-1.5">
                                  <span className="text-gray-400 dark:text-gray-500 w-16 flex-shrink-0">
                                    user:
                                  </span>
                                  <span className="font-medium text-gray-800 dark:text-gray-200 break-words">
                                    {item.user_name}
                                  </span>
                                </div>
                                <div className="flex items-start gap-1.5">
                                  <span className="text-gray-400 dark:text-gray-500 w-16 flex-shrink-0">
                                    ชื่อเจ้าหน้าที่:
                                  </span>
                                  <span className="font-medium text-gray-800 dark:text-gray-200 break-words">
                                    {item.name}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                  ไม่มีรายละเอียด
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/80 flex justify-end">
              <button
                onClick={() => setSelectedNoPhotoRow(null)}
                className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 rounded-xl font-semibold transition-colors"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
