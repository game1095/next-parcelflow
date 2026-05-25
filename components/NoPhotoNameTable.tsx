"use client";

import { useState, useMemo, useEffect } from "react";

type NoPhotoItem = {
  barcode: string;
  user_name: string;
  name: string;
  file_key: string;
  office: string;
  report_date: string | null;
};

type NoPhotoNameRow = {
  name: string;
  count: number;
  offices: string[];
  items: NoPhotoItem[];
  trend?: "worsening" | "improving" | "stable";
};

export default function NoPhotoNameTable({ data }: { data: NoPhotoNameRow[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [selectedRow, setSelectedRow] = useState<NoPhotoNameRow | null>(null);
  
  const [sortConfig, setSortConfig] = useState<{
    key: "name" | "count";
    direction: "asc" | "desc";
  } | null>({ key: "count", direction: "desc" });

  // Reset to page 1 when filters or sorting change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortConfig]);


  // Filtering and Sorting Logic
  const processedData = useMemo(() => {
    let result: NoPhotoNameRow[] = [];

    // 1. Recompute counts and offices (Since data is already globally filtered)
    data.forEach(row => {
      let filteredItems = row.items;

      if (filteredItems.length > 0) {
        // Recompute offices from filtered items
        const newOffices = new Set<string>();
        filteredItems.forEach(item => newOffices.add(item.office));

        // Calculate Trend
        let trendStatus: "worsening" | "improving" | "stable" = "stable";
        
        const validDates = filteredItems
          .map(item => item.report_date)
          .filter((d): d is string => d !== null)
          .map(d => new Date(d.split('T')[0]).getTime());
          
        if (validDates.length > 1) {
           const minTime = Math.min(...validDates);
           const maxTime = Math.max(...validDates);
           
           if (maxTime > minTime) {
             const midTime = minTime + (maxTime - minTime) / 2;
             
             let firstHalfCount = 0;
             let secondHalfCount = 0;
             
             validDates.forEach(time => {
                if (time <= midTime) firstHalfCount++;
                else secondHalfCount++;
             });
             
             if (secondHalfCount > firstHalfCount) trendStatus = "worsening";
             else if (secondHalfCount < firstHalfCount) trendStatus = "improving";
           }
        }

        result.push({
          name: row.name,
          count: filteredItems.length,
          offices: Array.from(newOffices),
          items: filteredItems,
          trend: trendStatus
        });
      }
    });

    // 2. Search text
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(
        (row) =>
          row.name.toLowerCase().includes(lowerSearch) ||
          row.offices.some(office => office.toLowerCase().includes(lowerSearch))
      );
    }

    // 3. Sort
    if (sortConfig !== null) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, sortConfig]);

  const requestSort = (key: "name" | "count") => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: "name" | "count") => {
    if (sortConfig?.key === key) {
      return sortConfig.direction === "asc" ? "↑" : "↓";
    }
    return "↕";
  };

  const totalPages = Math.ceil(processedData.length / pageSize);
  const paginatedData = processedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="w-full">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 rounded-t-2xl">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 whitespace-nowrap">
          ตรวจสอบลูกค้าที่มีสถานะ No Photo บ่อย
        </h2>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
              </svg>
            </div>
            <input 
              type="text" 
              className="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-xl bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500 transition-all outline-none" 
              placeholder="ค้นหาชื่อลูกค้า หรือสาขา..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-b-2xl">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 border-y border-gray-200 dark:border-gray-700">
            <tr>
              <th 
                className="px-6 py-4 font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                onClick={() => requestSort("name")}
              >
                <div className="flex items-center gap-2">
                  ชื่อลูกค้า (Name)
                  <span className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">{getSortIcon("name")}</span>
                </div>
              </th>
              <th 
                className="px-6 py-4 font-medium text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                onClick={() => requestSort("count")}
              >
                <div className="flex items-center justify-center gap-2">
                  จำนวนครั้งที่ No Photo
                  <span className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">{getSortIcon("count")}</span>
                </div>
              </th>
              <th className="px-6 py-4 font-medium text-center">แนวโน้ม</th>
              <th className="px-6 py-4 font-medium">ที่ทำการที่เกี่ยวข้อง (Offices)</th>
              <th className="px-6 py-4 font-medium text-center">รายละเอียด</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, index) => (
                <tr 
                  key={`${row.name}_${index}`} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-gray-100 whitespace-normal min-w-[200px]">
                      {row.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800 shadow-sm">
                      {row.count} ครั้ง
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {row.trend === "worsening" && (
                      <div className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-100 dark:border-red-800" title="แย่ลง: มีอัตราการทำ No Photo สูงขึ้นในช่วงหลัง">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                        <span className="text-xs font-semibold">แย่ลง</span>
                      </div>
                    )}
                    {row.trend === "improving" && (
                      <div className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800" title="ดีขึ้น: มีอัตราการทำ No Photo ลดลงในช่วงหลัง">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                        <span className="text-xs font-semibold">ดีขึ้น</span>
                      </div>
                    )}
                    {row.trend === "stable" && (
                      <div className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700" title="ทรงตัว: อัตราการเกิดปัญหาคงที่หรือไม่สามารถประเมินได้">
                        <span className="text-xs font-medium px-1">-</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5 max-w-[300px]">
                      {row.offices.map((office, idx) => (
                        <span key={idx} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs">
                          {office}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => setSelectedRow(row)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 rounded-lg text-sm font-medium transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      ดูรายการ
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <svg className="w-10 h-10 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
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
          แสดงข้อมูล {processedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} ถึง {Math.min(currentPage * pageSize, processedData.length)} จากทั้งหมด {processedData.length} รายการ
        </span>
        
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors shadow-sm"
            >
              ก่อนหน้า
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium px-2">
              หน้า {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors shadow-sm"
            >
              ถัดไป
            </button>
          </div>
        )}
      </div>

      {/* Modal for No Photo Details by Name */}
      {selectedRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm" onClick={() => setSelectedRow(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden transform transition-all" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/80 dark:bg-gray-800/80">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3 mb-1">
                  <span className="bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400 p-2 rounded-xl">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </span>
                  ประวัติ No Photo: {selectedRow.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 ml-11">
                  พบข้อมูล No Photo จำนวน {selectedRow.count} รายการ
                </p>
              </div>
              <button onClick={() => setSelectedRow(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 self-end sm:self-center">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1 bg-gray-50/30 dark:bg-gray-900/30">
              {selectedRow.items && selectedRow.items.length > 0 ? (
                <div className="space-y-3">
                  {selectedRow.items.map((item, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-100 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
                       <div className="flex-shrink-0 pt-0.5 flex flex-col gap-2">
                         {item.file_key.toLowerCase() === 'tiktok' && <span className="inline-flex justify-center min-w-[70px] bg-black text-white text-xs px-2.5 py-1.5 rounded-lg shadow-sm font-semibold">Tiktok</span>}
                         {item.file_key.toLowerCase() === 'shopee' && <span className="inline-flex justify-center min-w-[70px] bg-[#ee4d2d] text-white text-xs px-2.5 py-1.5 rounded-lg shadow-sm font-semibold">Shopee</span>}
                         {item.file_key.toLowerCase() === 'lazada' && <span className="inline-flex justify-center min-w-[70px] bg-[#0f146d] text-white text-xs px-2.5 py-1.5 rounded-lg shadow-sm font-semibold">Lazada</span>}
                         {!['tiktok', 'shopee', 'lazada'].includes(item.file_key.toLowerCase()) && <span className="inline-flex justify-center min-w-[70px] bg-gray-200 text-gray-800 text-xs px-2.5 py-1.5 rounded-lg shadow-sm font-semibold">{item.file_key || 'Unknown'}</span>}
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
                             <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                             </svg>
                           </a>
                           <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
                             {item.report_date ? new Date(item.report_date).toLocaleDateString('th-TH') : 'ไม่ระบุวันที่'}
                           </span>
                         </div>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-gray-300">
                           <div className="flex items-start gap-1.5">
                             <span className="text-gray-400 dark:text-gray-500 w-16 flex-shrink-0">สาขา:</span> 
                             <span className="font-medium text-gray-800 dark:text-gray-200 break-words bg-gray-100 dark:bg-gray-700 px-2 rounded-md">{item.office}</span>
                           </div>
                           <div className="flex items-start gap-1.5">
                             <span className="text-gray-400 dark:text-gray-500 w-16 flex-shrink-0">ชื่อลูกค้า:</span> 
                             <span className="font-medium text-gray-800 dark:text-gray-200 break-words">{item.name}</span>
                           </div>
                         </div>
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
              <button onClick={() => setSelectedRow(null)} className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 rounded-xl font-semibold transition-colors">
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
