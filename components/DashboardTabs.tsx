"use client";

import { useState, useEffect } from "react";
import DataTable from "./DataTable";
import NoPhotoNameTable from "./NoPhotoNameTable";
import NoPhotoUserChart from "./NoPhotoUserChart";
import ExecutiveAnalytics from "./ExecutiveAnalytics";
import { PROVINCE_GROUPS } from "@/lib/constants";
import { fetchDashboardData } from "@/app/actions";

export default function DashboardTabs() {
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

  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await fetchDashboardData(
          globalStartDate,
          globalEndDate,
          globalPlatform,
          globalProvince
        );
        setDashboardData(data);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [globalPlatform, globalProvince, globalStartDate, globalEndDate]);

  const summaryData = dashboardData?.summaryData || [];
  const noPhotoNameData = dashboardData?.noPhotoNameData || [];
  const noPhotoRawItems = dashboardData?.noPhotoRawItems || [];
  const monthNoPhotoItems = dashboardData?.monthNoPhotoItems || [];
  const kpiData = dashboardData?.kpiData || {
    totalParcels: 0,
    totalNoPhoto: 0,
    errorRate: "0.00",
    mostProblematicOffice: "ไม่มีข้อมูล",
    maxOfficeCount: 0,
  };

  return (
    <div className="space-y-6 relative">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-[#161a24]/50 backdrop-blur-sm rounded-3xl">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
              กำลังโหลดข้อมูล...
            </p>
          </div>
        </div>
      )}

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
      <div className="flex flex-wrap gap-1.5 bg-white dark:bg-[#161a24] rounded-2xl p-2 border border-gray-100 dark:border-gray-800 shadow-sm relative z-10">
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
      <main className="bg-white dark:bg-[#161a24] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-1 mt-2 relative z-10 min-h-[400px]">
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
