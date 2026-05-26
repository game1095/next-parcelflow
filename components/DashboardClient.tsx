"use client";

import { useState, useEffect } from "react";
import DataTable from "./DataTable";
import NoPhotoNameTable from "./NoPhotoNameTable";
import ExecutiveAnalytics from "./ExecutiveAnalytics";
import IndividualAnalytics from "./IndividualAnalytics";
import ExecutiveSummary from "./ExecutiveSummary";
import { PROVINCE_GROUPS } from "@/lib/constants";
import { fetchDashboardData } from "@/app/actions";
import UploadModal from "./UploadModal";
import LogoutButton from "./LogoutButton";
import { ThemeToggle } from "./ThemeToggle";

interface DashboardClientProps {
  isSetup: boolean;
}

export default function DashboardClient({ isSetup }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "nophoto" | "analytics" | "individual" | "execsummary"
  >("overview");

  // Global Filters
  const [globalPlatform, setGlobalPlatform] = useState<string>("all");
  const [globalProvince, setGlobalProvince] = useState<string>("all");

  const getMonthStartString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}-01`;
  };

  const getMonthEndString = () => {
    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const year = lastDay.getFullYear();
    const month = String(lastDay.getMonth() + 1).padStart(2, "0");
    const day = String(lastDay.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [globalStartDate, setGlobalStartDate] = useState<string>(
    getMonthStartString(),
  );
  const [globalEndDate, setGlobalEndDate] =
    useState<string>(getMonthEndString());

  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  // Sidebar mobile toggle
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sidebar desktop collapse
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await fetchDashboardData(
          globalStartDate,
          globalEndDate,
          globalPlatform,
          globalProvince,
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
  const kpiData = dashboardData?.kpiData || {
    totalParcels: 0,
    totalNoPhoto: 0,
    errorRate: "0.00",
    mostProblematicOffice: "ไม่มีข้อมูล",
    maxOfficeCount: 0,
  };

  const navItems = [
    {
      id: "execsummary",
      label: "สรุปผู้บริหาร",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      id: "overview",
      label: "ภาพรวมที่ทำการ",
      icon: (
        <svg
          className="w-5 h-5"
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
      ),
    },
    {
      id: "nophoto",
      label: "ตรวจสอบรายบุคคล (No Photo)",
      icon: (
        <svg
          className="w-5 h-5"
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
      ),
    },
    {
      id: "analytics",
      label: "กราฟวิเคราะห์",
      icon: (
        <svg
          className="w-5 h-5"
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
      ),
    },
    {
      id: "individual",
      label: "วิเคราะห์รายบุคคล",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
  ] as const;

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 ${isCollapsed ? "w-20" : "w-72"} bg-white dark:bg-[#161a24] border-r border-gray-200/60 dark:border-gray-800/60 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 transition-all duration-300 flex flex-col group`}
      >
        {/* Toggle Collapse Button (Desktop) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-6 z-50 w-6 h-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full items-center justify-center text-gray-400 hover:text-indigo-500 shadow-sm transition-transform hover:scale-110"
        >
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Logo Section */}
        <div
          className={`h-16 flex items-center ${isCollapsed ? "justify-center px-0" : "gap-3 px-5"} border-b border-gray-100 dark:border-gray-800/60 shrink-0 transition-all duration-300`}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          {!isCollapsed && (
            <div className="animate-fadeIn truncate">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
                ParcelFlow
              </h1>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                พัฒนาโดยเจ้าหน้าที่ รป. ท่านหนึ่งค่ะ
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav
          className={`flex-1 ${isCollapsed ? "p-2" : "p-3"} space-y-1 overflow-y-auto transition-all duration-300`}
        >
          {!isCollapsed && (
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2 mt-1">
              Menu
            </p>
          )}
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center ${isCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"} rounded-xl font-semibold transition-all duration-200 group relative ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 dark:from-indigo-500/20 dark:to-cyan-500/20 text-indigo-700 dark:text-indigo-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <div
                  className={`transition-transform duration-300 shrink-0 ${isActive ? "scale-110" : "group-hover:scale-110"}`}
                >
                  {item.icon}
                </div>
                {!isCollapsed && (
                  <span className="text-sm truncate">{item.label}</span>
                )}
                {isActive && !isCollapsed && (
                  <div className="ml-auto w-1 h-5 bg-gradient-to-b from-indigo-500 to-cyan-400 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                )}
                {isActive && isCollapsed && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gradient-to-b from-indigo-500 to-cyan-400 rounded-r-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div
          className={`p-3 border-t border-gray-100 dark:border-gray-800/60 ${isCollapsed ? "flex flex-col gap-2 items-center" : "space-y-2"} shrink-0 transition-all duration-300`}
        >
          <div
            className={`flex ${isCollapsed ? "flex-col" : "items-center"} gap-2 w-full`}
          >
            {isCollapsed ? (
              <button
                onClick={() => setIsCollapsed(false)}
                className="w-full flex justify-center py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400"
                title="อัปโหลดไฟล์ (Excel)"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
              </button>
            ) : (
              <UploadModal />
            )}
            <div className={isCollapsed ? "flex justify-center w-full" : ""}>
              <ThemeToggle />
            </div>
          </div>
          <LogoutButton isCollapsed={isCollapsed} />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white dark:bg-[#161a24] border-b border-gray-200/60 dark:border-gray-800/60 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <span className="font-bold text-gray-900 dark:text-white">
              ParcelFlow
            </span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </header>

        {/* Scrollable Dashboard Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6 space-y-4">
          {/* Setup Warning */}
          {!isSetup && (
            <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 px-4 py-3 rounded-2xl text-xs font-medium border border-amber-200 dark:border-amber-800/50 flex items-center gap-2 shadow-sm">
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              รอการตั้งค่า Supabase URL และ Key ใน .env.local
            </div>
          )}
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                สวัสดีค่ะส่วน รป.ปข.6 ขอต้อนรับสู่ Dashboard ParcelFlow ค่ะ👋
              </h2>
            </div>
          </div>
          {/* Global Filter Bar */}
          <div className="backdrop-blur-xl bg-white/60 dark:bg-[#161a24]/60 p-3 rounded-2xl shadow-sm border border-gray-200/60 dark:border-gray-800/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200 font-bold text-sm tracking-tight px-1">
              <svg
                className="w-4 h-4 text-indigo-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              กรองข้อมูล
            </div>
            <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
              <select
                className="block w-full md:w-40 p-2 px-3 text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 outline-none transition-all shadow-sm"
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

              <select
                className="block w-full md:w-36 p-2 px-3 text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 outline-none transition-all shadow-sm"
                value={globalPlatform}
                onChange={(e) => setGlobalPlatform(e.target.value)}
              >
                <option value="all">ทุกแพลตฟอร์ม</option>
                <option value="tiktok">Tiktok</option>
                <option value="shopee">Shopee</option>
                <option value="lazada">Lazada</option>
              </select>

              <div className="flex items-center gap-1.5 w-full md:w-auto bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <input
                  type="date"
                  className="block w-full md:w-[130px] p-1 text-xs font-semibold text-gray-700 bg-transparent dark:text-gray-300 outline-none"
                  value={globalStartDate}
                  onChange={(e) => setGlobalStartDate(e.target.value)}
                />
                <span className="text-gray-300 dark:text-gray-600 font-bold text-[10px]">
                  -
                </span>
                <input
                  type="date"
                  className="block w-full md:w-[130px] p-1 text-xs font-semibold text-gray-700 bg-transparent dark:text-gray-300 outline-none"
                  value={globalEndDate}
                  onChange={(e) => setGlobalEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>
          {/* KPI Cards (Hidden on Executive Summary tab as it has its own comprehensive KPIs) */}
          {activeTab !== "execsummary" && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 animate-fadeIn">
              {/* Card 1 */}
              <div className="relative overflow-hidden bg-white dark:bg-white/[0.02] backdrop-blur-xl rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5 flex flex-col sm:flex-row items-start sm:items-center gap-3 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-xl -mr-6 -mt-6 transition-transform group-hover:scale-110" />
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <div className="relative z-10">
                  <p className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    พัสดุทั้งหมด
                  </p>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                      {isLoading
                        ? "..."
                        : kpiData.totalParcels.toLocaleString()}
                    </h3>
                    <span className="text-[10px] sm:text-xs font-medium text-gray-500">
                      ชิ้น
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="relative overflow-hidden bg-white dark:bg-white/[0.02] backdrop-blur-xl rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5 flex flex-col sm:flex-row items-start sm:items-center gap-3 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 dark:bg-rose-500/5 rounded-full blur-xl -mr-6 -mt-6 transition-transform group-hover:scale-110" />
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/20">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
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
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="relative z-10">
                  <p className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide truncate">
                    ไม่ได้ถ่ายภาพ (No Photo)
                  </p>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                      {isLoading
                        ? "..."
                        : kpiData.totalNoPhoto.toLocaleString()}
                    </h3>
                    <span className="text-[10px] sm:text-xs font-medium text-gray-500">
                      ครั้ง
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="relative overflow-hidden bg-white dark:bg-white/[0.02] backdrop-blur-xl rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5 flex flex-col sm:flex-row items-start sm:items-center gap-3 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-xl -mr-6 -mt-6 transition-transform group-hover:scale-110" />
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                    />
                  </svg>
                </div>
                <div className="relative z-10">
                  <p className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide truncate">
                    อัตราผิดพลาด
                  </p>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                      {isLoading ? "..." : kpiData.errorRate}%
                    </h3>
                  </div>
                </div>
              </div>

              {/* Card 4 */}
              <div className="relative overflow-hidden bg-white dark:bg-white/[0.02] backdrop-blur-xl rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5 flex flex-col sm:flex-row items-start sm:items-center gap-3 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-xl -mr-6 -mt-6 transition-transform group-hover:scale-110" />
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <div className="relative z-10 overflow-hidden min-w-0 flex-1">
                  <p className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide truncate">
                    ที่ทำการพบปัญหา
                  </p>
                  <h3
                    className="text-sm sm:text-base font-bold text-gray-900 dark:text-white tracking-tight truncate leading-tight mt-0.5"
                    title={kpiData.mostProblematicOffice}
                  >
                    {isLoading ? "..." : kpiData.mostProblematicOffice}
                  </h3>
                  {kpiData.maxOfficeCount > 0 && !isLoading && (
                    <p className="text-[10px] text-rose-500 dark:text-rose-400 font-medium">
                      พลาด {kpiData.maxOfficeCount.toLocaleString()} ครั้ง
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          {/* Main Content Area */}
          <div className="bg-white dark:bg-white/[0.02] backdrop-blur-xl rounded-[1.5rem] shadow-sm border border-gray-100 dark:border-white/5 min-h-[500px] relative overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-[#0c0e14]/50 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                    กำลังโหลดข้อมูลล่าสุด...
                  </p>
                </div>
              </div>
            )}

            <div className="p-1 md:p-2 h-full">
              {activeTab === "overview" && (
                <div className="animate-fadeIn">
                  <DataTable data={summaryData} />
                </div>
              )}
              {activeTab === "nophoto" && (
                <div className="animate-fadeIn">
                  <NoPhotoNameTable data={noPhotoNameData} />
                </div>
              )}
              {activeTab === "analytics" && (
                <div className="animate-fadeIn p-4">
                  <ExecutiveAnalytics items={noPhotoRawItems} />
                </div>
              )}
              {activeTab === "individual" && (
                <div className="animate-fadeIn p-4">
                  <IndividualAnalytics items={noPhotoRawItems} />
                </div>
              )}
              {activeTab === "execsummary" && (
                <div className="animate-fadeIn">
                  <ExecutiveSummary
                    summaryData={summaryData}
                    noPhotoNameData={noPhotoNameData}
                    noPhotoRawItems={noPhotoRawItems}
                    kpiData={kpiData}
                    isLoading={isLoading}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="h-8" /> {/* Bottom padding */}
        </div>
      </main>
    </>
  );
}
