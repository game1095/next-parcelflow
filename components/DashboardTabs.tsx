"use client";

import { useState, useMemo } from "react";
import DataTable from "./DataTable";
import NoPhotoNameTable from "./NoPhotoNameTable";
import NoPhotoUserChart from "./NoPhotoUserChart";
import ExecutiveAnalytics from "./ExecutiveAnalytics";

type DashboardTabsProps = {
  rawData: any[];
};

export default function DashboardTabs({ rawData }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "nophoto" | "userchart"
  >("overview");

  // Global Filters
  const [globalPlatform, setGlobalPlatform] = useState<string>("all");
  const [globalProvince, setGlobalProvince] = useState<string>("all");

  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [globalStartDate, setGlobalStartDate] =
    useState<string>(getTodayString());
  const [globalEndDate, setGlobalEndDate] = useState<string>(getTodayString());

  const PROVINCE_GROUPS: Record<string, string[]> = useMemo(
    () => ({
      "ปจ.นครสวรรค์": [
        "60000",
        "60001",
        "60002",
        "60110",
        "60120",
        "60130",
        "60140",
        "60150",
        "60160",
        "60170",
        "60180",
        "60190",
        "60210",
        "60220",
        "60230",
        "60240",
        "60250",
        "60260",
        "428",
      ],
      "ปจ.อุทัยธานี": [
        "61000",
        "61110",
        "61120",
        "61130",
        "61140",
        "61150",
        "61160",
        "61170",
        "61180",
      ],
      "ปจ.กำแพงเพชร": [
        "62000",
        "62110",
        "62120",
        "62130",
        "62140",
        "62150",
        "62160",
        "62170",
        "62180",
        "62190",
        "62210",
        "89",
      ],
      "ปจ.ตาก": [
        "63000",
        "63110",
        "63111",
        "63120",
        "63130",
        "63140",
        "63150",
        "63160",
        "63170",
        "63180",
        "58",
        "154",
      ],
      "ปจ.สุโขทัย": [
        "64000",
        "64110",
        "64120",
        "64130",
        "64140",
        "64150",
        "64160",
        "64170",
        "64180",
        "64190",
        "64210",
        "64220",
        "64230",
      ],
      "ปจ.พิษณุโลก": [
        "65000",
        "65001",
        "65110",
        "65120",
        "65130",
        "65140",
        "65150",
        "65160",
        "65170",
        "65180",
        "65190",
        "65210",
        "65220",
        "65230",
        "65240",
        "36",
        "61",
        "112",
        "287",
        "303",
      ],
      "ปจ.พิจิตร": [
        "66000",
        "66110",
        "66120",
        "66130",
        "66140",
        "66150",
        "66160",
        "66170",
        "66180",
        "66190",
        "66210",
        "66220",
        "66230",
      ],
      "ปจ.เพชรบูรณ์": [
        "67000",
        "67110",
        "67120",
        "67130",
        "67140",
        "67150",
        "67160",
        "67170",
        "67180",
        "67190",
        "67210",
        "67220",
        "67230",
        "67240",
        "67250",
        "67260",
        "67270",
        "67280",
      ],
    }),
    [],
  );

  const {
    summaryData,
    noPhotoNameData,
    noPhotoRawItems,
    monthNoPhotoItems,
    kpiData,
  } = useMemo(() => {
    let filteredData = rawData;

    // 1. Apply Global Platform Filter
    if (globalPlatform !== "all") {
      filteredData = filteredData.filter((row) => {
        const platform = (row.file_key || "").toLowerCase();
        return platform === globalPlatform;
      });
    }

    // 2. Apply Global Province Filter
    if (globalProvince !== "all") {
      const allowedPostCodes = PROVINCE_GROUPS[globalProvince] || [];
      filteredData = filteredData.filter((row) => {
        return allowedPostCodes.includes(row.post_code?.toString());
      });
    }

    const baseFilteredData = filteredData;

    // Extract Month No Photo Items (ignores the exact day range, uses the month of globalStartDate)
    const targetMonth = globalStartDate
      ? globalStartDate.substring(0, 7)
      : getTodayString().substring(0, 7);
    const monthItems: any[] = [];

    baseFilteredData.forEach((row) => {
      if (row.report_date && row.report_date.startsWith(targetMonth)) {
        const status = (row.status || "").toLowerCase().trim();
        if (
          status.includes("no photo") ||
          status.includes("nophoto") ||
          status === "no photo" ||
          status === "nophoto"
        ) {
          monthItems.push({
            barcode: row.barcode || "-",
            user_name: row.user_name || "-",
            name:
              row.name && row.name.trim() !== "-"
                ? row.name
                : "ไม่ระบุชื่อเจ้าหน้าที่",
            file_key: row.file_key || "Unknown",
            office: row.office || "ไม่ระบุ",
            report_date: row.report_date,
          });
        }
      }
    });

    // 3. Apply Global Date Range Filter for Tables & KPIs
    if (globalStartDate || globalEndDate) {
      filteredData = filteredData.filter((row) => {
        if (!row.report_date) return false;
        const rowDate = row.report_date.split("T")[0];
        let isValid = true;
        if (globalStartDate && rowDate < globalStartDate) isValid = false;
        if (globalEndDate && rowDate > globalEndDate) isValid = false;
        return isValid;
      });
    }

    // 3. Aggregate Filtered Data
    const summaryMap: Record<string, any> = {};
    const noPhotoNameSummary: Record<string, any> = {};
    const rawItems: any[] = [];

    let totalParcels = filteredData.length;
    let totalNoPhoto = 0;

    filteredData.forEach((row) => {
      const office = row.office || "ไม่ระบุ";
      const post_code = row.post_code || "ไม่ระบุ";
      const key = `${office}_${post_code}`;

      if (!summaryMap[key]) {
        summaryMap[key] = {
          office,
          post_code,
          total: 0,
          no_photo: 0,
          no_photo_details: { tiktok: 0, shopee: 0, lazada: 0, other: 0 },
          no_photo_items: [],
          waiting: 0,
          completed: 0,
          report_date: row.report_date || null,
        };
      } else if (!summaryMap[key].report_date && row.report_date) {
        summaryMap[key].report_date = row.report_date;
      } else if (
        row.report_date &&
        summaryMap[key].report_date &&
        new Date(row.report_date) > new Date(summaryMap[key].report_date)
      ) {
        summaryMap[key].report_date = row.report_date;
      }

      summaryMap[key].total++;

      const status = (row.status || "").toLowerCase().trim();

      if (
        status.includes("no photo") ||
        status.includes("nophoto") ||
        status === "no photo" ||
        status === "nophoto"
      ) {
        summaryMap[key].no_photo++;
        totalNoPhoto++;

        const platform = (row.file_key || "").toLowerCase();
        if (platform === "tiktok") summaryMap[key].no_photo_details.tiktok++;
        else if (platform === "shopee")
          summaryMap[key].no_photo_details.shopee++;
        else if (platform === "lazada")
          summaryMap[key].no_photo_details.lazada++;
        else summaryMap[key].no_photo_details.other++;

        summaryMap[key].no_photo_items.push({
          barcode: row.barcode || "-",
          user_name: row.user_name || "-",
          name: row.name || "-",
          file_key: row.file_key || "Unknown",
          office: row.office || "ไม่ระบุ",
          report_date: row.report_date || null,
        });

        const customerName = row.name || "ไม่ระบุชื่อ";
        if (!noPhotoNameSummary[customerName]) {
          noPhotoNameSummary[customerName] = {
            name: customerName,
            count: 0,
            offices: new Set(),
            items: [],
          };
        }
        noPhotoNameSummary[customerName].count++;
        noPhotoNameSummary[customerName].offices.add(row.office || "ไม่ระบุ");

        const itemObj = {
          barcode: row.barcode || "-",
          user_name: row.user_name || "-",
          name: customerName,
          file_key: row.file_key || "Unknown",
          office: row.office || "ไม่ระบุ",
          report_date: row.report_date || null,
        };

        noPhotoNameSummary[customerName].items.push(itemObj);
        rawItems.push(itemObj);
      } else if (status === "waiting" || status.includes("waiting")) {
        summaryMap[key].waiting++;
      } else if (status === "completed" || status.includes("completed")) {
        summaryMap[key].completed++;
      }
    });

    const errorRate =
      totalParcels > 0
        ? ((totalNoPhoto / totalParcels) * 100).toFixed(2)
        : "0.00";

    let maxOffice = "ไม่มีข้อมูล";
    let maxCount = 0;
    Object.values(summaryMap).forEach((val: any) => {
      if (val.no_photo > maxCount) {
        maxCount = val.no_photo;
        maxOffice = val.office;
      }
    });

    return {
      summaryData: Object.values(summaryMap).sort(
        (a, b) => b.no_photo - a.no_photo,
      ),
      noPhotoNameData: Object.values(noPhotoNameSummary)
        .map((item: any) => ({
          ...item,
          offices: Array.from(item.offices),
        }))
        .sort((a: any, b: any) => b.count - a.count),
      noPhotoRawItems: rawItems,
      monthNoPhotoItems: monthItems,
      kpiData: {
        totalParcels,
        totalNoPhoto,
        errorRate,
        mostProblematicOffice: maxOffice,
        maxOfficeCount: maxCount,
      },
    };
  }, [
    rawData,
    globalPlatform,
    globalProvince,
    globalStartDate,
    globalEndDate,
    PROVINCE_GROUPS,
  ]);

  return (
    <div className="space-y-6">
      {/* Global Control Bar */}
      <div className="backdrop-blur-xl bg-white/80 dark:bg-[#161a24]/80 p-5 rounded-2xl shadow-sm border border-gray-200/60 dark:border-gray-700/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3 text-gray-800 dark:text-gray-200">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-lg shadow-indigo-500/20">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
          </div>
          <span className="font-bold text-sm tracking-tight">
            ตัวกรองข้อมูล
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
          <div className="relative w-full sm:w-48">
            <select
              className="block w-full p-2.5 pl-3 pr-10 text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl bg-gray-50/80 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 dark:bg-gray-800/80 dark:border-gray-600 dark:text-gray-300 appearance-none cursor-pointer transition-all"
              value={globalProvince}
              onChange={(e) => setGlobalProvince(e.target.value)}
            >
              <option value="all">ทุกพื้นที่ (ปจ.)</option>
              {Object.keys(PROVINCE_GROUPS).map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </div>
          </div>
          <div className="relative w-full sm:w-40">
            <select
              className="block w-full p-2.5 pl-3 pr-10 text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl bg-gray-50/80 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 dark:bg-gray-800/80 dark:border-gray-600 dark:text-gray-300 appearance-none cursor-pointer transition-all"
              value={globalPlatform}
              onChange={(e) => setGlobalPlatform(e.target.value)}
            >
              <option value="all">ทุกแพลตฟอร์ม</option>
              <option value="tiktok">Tiktok</option>
              <option value="shopee">Shopee</option>
              <option value="lazada">Lazada</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <input
              type="date"
              className="block w-full sm:w-36 p-2.5 text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl bg-gray-50/80 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 dark:bg-gray-800/80 dark:border-gray-600 dark:text-gray-300 outline-none transition-all"
              value={globalStartDate}
              onChange={(e) => setGlobalStartDate(e.target.value)}
            />
            <span className="text-gray-300 dark:text-gray-600 font-bold text-xs">
              →
            </span>
            <input
              type="date"
              className="block w-full sm:w-36 p-2.5 text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl bg-gray-50/80 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 dark:bg-gray-800/80 dark:border-gray-600 dark:text-gray-300 outline-none transition-all"
              value={globalEndDate}
              onChange={(e) => setGlobalEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="group relative overflow-hidden bg-white dark:bg-[#161a24] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-0.5 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-bl-full" />
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              พัสดุทั้งหมด
            </p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {kpiData.totalParcels.toLocaleString()}{" "}
              <span className="text-sm font-normal text-gray-500">ชิ้น</span>
            </h3>
          </div>
        </div>

        {/* Card 2: Total No Photos */}
        <div className="group relative overflow-hidden bg-white dark:bg-[#161a24] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4 hover:shadow-lg hover:shadow-red-500/5 hover:-translate-y-0.5 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-red-500/5 to-transparent rounded-bl-full" />
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shrink-0 shadow-lg shadow-red-500/25 group-hover:shadow-red-500/40 transition-shadow">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <line
                x1="6"
                y1="6"
                x2="18"
                y2="18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              ลืมถ่ายรูป (No Photo)
            </p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {kpiData.totalNoPhoto.toLocaleString()}{" "}
              <span className="text-sm font-normal text-gray-500">ครั้ง</span>
            </h3>
          </div>
        </div>

        {/* Card 3: Error Rate */}
        <div className="group relative overflow-hidden bg-white dark:bg-[#161a24] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4 hover:shadow-lg hover:shadow-orange-500/5 hover:-translate-y-0.5 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-orange-500/5 to-transparent rounded-bl-full" />
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/25 group-hover:shadow-orange-500/40 transition-shadow">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              อัตราส่วนความผิดพลาด
            </p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {kpiData.errorRate}%{" "}
              <span className="text-sm font-normal text-gray-500">
                ของทั้งหมด
              </span>
            </h3>
          </div>
        </div>

        {/* Card 4: Most Problematic Office */}
        <div className="group relative overflow-hidden bg-white dark:bg-[#161a24] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4 hover:shadow-lg hover:shadow-purple-500/5 hover:-translate-y-0.5 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-500/5 to-transparent rounded-bl-full" />
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-shadow">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
              ที่ทำการที่พบปัญหาเยอะสุด
            </p>
            <h3
              className="text-lg font-bold text-gray-900 dark:text-white truncate"
              title={kpiData.mostProblematicOffice}
            >
              {kpiData.mostProblematicOffice}
            </h3>
            {kpiData.maxOfficeCount > 0 && (
              <p className="text-xs text-red-500 font-medium">
                พลาด {kpiData.maxOfficeCount.toLocaleString()} ครั้ง
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-1.5 bg-white dark:bg-[#161a24] rounded-2xl p-2 border border-gray-100 dark:border-gray-800 shadow-sm">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 py-3 px-5 text-sm font-semibold rounded-xl transition-all duration-200 ${activeTab === "overview" ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"}`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          ภาพรวมตามที่ทำการ
        </button>
        <button
          onClick={() => setActiveTab("nophoto")}
          className={`flex items-center gap-2 py-3 px-5 text-sm font-semibold rounded-xl transition-all duration-200 ${activeTab === "nophoto" ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/25" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"}`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          ตรวจสอบเจ้าหน้าที่ไม่ถ่ายภาพ (No Photo) บ่อย
        </button>
        <button
          onClick={() => setActiveTab("userchart")}
          className={`flex items-center gap-2 py-3 px-5 text-sm font-semibold rounded-xl transition-all duration-200 ${activeTab === "userchart" ? "bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/25" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"}`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          กราฟวิเคราะห์
        </button>
      </div>

      {/* Tab Content */}
      <main className="bg-white dark:bg-[#161a24] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-1 mt-2">
        {activeTab === "overview" && <DataTable data={summaryData} />}
        {activeTab === "nophoto" && <NoPhotoNameTable data={noPhotoNameData} />}
        {activeTab === "userchart" && (
          <div className="animate-fadeIn space-y-6">
            <NoPhotoUserChart items={monthNoPhotoItems} />
            <ExecutiveAnalytics items={noPhotoRawItems} />
          </div>
        )}
      </main>
    </div>
  );
}
