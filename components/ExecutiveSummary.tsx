"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type SummaryRow = {
  office: string;
  no_photo: number;
  no_photo_details: {
    tiktok: number;
    shopee: number;
    lazada: number;
    other: number;
  };
  file_type_details: {
    tiktok: number;
    shopee: number;
    lazada: number;
    other: number;
  };
  completed: number;
  waiting: number;
  total: number;
};
type NoPhotoNameRow = { name: string; count: number; offices: string[] };
type NoPhotoItem = {
  barcode: string;
  user_name: string;
  name: string;
  file_key: string;
  office: string;
  report_date: string | null;
};
type KpiData = {
  totalParcels: number;
  totalNoPhoto: number;
  errorRate: string;
  mostProblematicOffice: string;
  maxOfficeCount: number;
};

interface Props {
  summaryData: SummaryRow[];
  noPhotoNameData: NoPhotoNameRow[];
  noPhotoRawItems: NoPhotoItem[];
  kpiData: KpiData;
  isLoading: boolean;
}

const PLATFORM_COLORS: Record<string, string> = {
  tiktok: "#64748b", // Slate
  shopee: "#fb923c", // Soft Orange
  lazada: "#60a5fa", // Soft Blue
  other: "#9ca3af",
};

const tipStyle = {
  borderRadius: "14px",
  border: "none",
  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
  backgroundColor: "rgba(255,255,255,0.96)",
  backdropFilter: "blur(8px)",
  padding: "10px 14px",
  fontSize: "12px",
};

// Shared card class matching DashboardClient KPI cards
const cardCls =
  "relative overflow-hidden bg-white dark:bg-white/[0.02] backdrop-blur-xl rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group";
const chartCardCls =
  "bg-white dark:bg-white/[0.02] backdrop-blur-xl rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-white/5";

export default function ExecutiveSummary({
  summaryData,
  noPhotoNameData,
  noPhotoRawItems,
  kpiData,
  isLoading,
}: Props) {
  const platformData = useMemo(() => {
    const m = { tiktok: 0, shopee: 0, lazada: 0, other: 0 };
    summaryData.forEach((r) => {
      m.tiktok += r.no_photo_details.tiktok;
      m.shopee += r.no_photo_details.shopee;
      m.lazada += r.no_photo_details.lazada;
      m.other += r.no_photo_details.other;
    });
    return [
      { name: "Tiktok", value: m.tiktok, color: PLATFORM_COLORS.tiktok },
      { name: "Shopee", value: m.shopee, color: PLATFORM_COLORS.shopee },
      { name: "Lazada", value: m.lazada, color: PLATFORM_COLORS.lazada },
      { name: "อื่น ๆ", value: m.other, color: PLATFORM_COLORS.other },
    ].filter((d) => d.value > 0);
  }, [summaryData]);

  const totalPlatformData = useMemo(() => {
    const m = { tiktok: 0, shopee: 0, lazada: 0, other: 0 };
    summaryData.forEach((r) => {
      m.tiktok += r.file_type_details?.tiktok || 0;
      m.shopee += r.file_type_details?.shopee || 0;
      m.lazada += r.file_type_details?.lazada || 0;
      m.other += r.file_type_details?.other || 0;
    });
    return [
      { name: "Tiktok", value: m.tiktok, color: PLATFORM_COLORS.tiktok },
      { name: "Shopee", value: m.shopee, color: PLATFORM_COLORS.shopee },
      { name: "Lazada", value: m.lazada, color: PLATFORM_COLORS.lazada },
      { name: "อื่น ๆ", value: m.other, color: PLATFORM_COLORS.other },
    ].filter((d) => d.value > 0);
  }, [summaryData]);

  const workStatusData = useMemo(() => {
    let completed = 0,
      waiting = 0,
      noPhoto = 0;
    summaryData.forEach((r) => {
      completed += r.completed || 0;
      waiting += r.waiting || 0;
      noPhoto += r.no_photo || 0;
    });
    return [
      { name: "สำเร็จ", value: completed, color: "#10b981" }, // Emerald 500
      { name: "รอดำเนินการ", value: waiting, color: "#f59e0b" }, // Amber 500
      { name: "มีปัญหา (No Photo)", value: noPhoto, color: "#ef4444" }, // Red 500
    ].filter((d) => d.value > 0);
  }, [summaryData]);

  const top5Offices = useMemo(
    () =>
      [...summaryData]
        .sort((a, b) => b.no_photo - a.no_photo)
        .slice(0, 5)
        .map((r) => ({ name: r.office, value: r.no_photo })),
    [summaryData],
  );
  const top5People = useMemo(
    () => [...noPhotoNameData].slice(0, 5),
    [noPhotoNameData],
  );

  const dayOfWeekData = useMemo(() => {
    const days = [
      {
        id: 1,
        name: "จันทร์",
        count: 0,
        fillId: "url(#gradDay1Sum)",
        color: "#facc15",
      },
      {
        id: 2,
        name: "อังคาร",
        count: 0,
        fillId: "url(#gradDay2Sum)",
        color: "#f472b6",
      },
      {
        id: 3,
        name: "พุธ",
        count: 0,
        fillId: "url(#gradDay3Sum)",
        color: "#4ade80",
      },
      {
        id: 4,
        name: "พฤหัสฯ",
        count: 0,
        fillId: "url(#gradDay4Sum)",
        color: "#fb923c",
      },
      {
        id: 5,
        name: "ศุกร์",
        count: 0,
        fillId: "url(#gradDay5Sum)",
        color: "#60a5fa",
      },
      {
        id: 6,
        name: "เสาร์",
        count: 0,
        fillId: "url(#gradDay6Sum)",
        color: "#c084fc",
      },
      {
        id: 0,
        name: "อาทิตย์",
        count: 0,
        fillId: "url(#gradDay0Sum)",
        color: "#f87171",
      },
    ];
    noPhotoRawItems.forEach((item) => {
      if (!item.report_date) return;
      const d = new Date(item.report_date.split("T")[0]);
      if (isNaN(d.getTime())) return;
      const js = d.getDay();
      days[js === 0 ? 6 : js - 1].count++;
    });
    return days;
  }, [noPhotoRawItems]);

  const peakDay = useMemo(() => {
    let m = dayOfWeekData[0];
    dayOfWeekData.forEach((d) => {
      if (d.count > m.count) m = d;
    });
    return m;
  }, [dayOfWeekData]);

  const trendInsight = useMemo(() => {
    const dm: Record<string, number> = {};
    noPhotoRawItems.forEach((i) => {
      if (!i.report_date) return;
      const ds = i.report_date.split("T")[0];
      dm[ds] = (dm[ds] || 0) + 1;
    });
    const dates = Object.keys(dm).sort();
    if (dates.length < 2) return null;
    const mid = Math.floor(dates.length / 2);
    let f = 0,
      s = 0;
    dates.slice(0, mid).forEach((d) => (f += dm[d]));
    dates.slice(mid).forEach((d) => (s += dm[d]));
    const fa = f / mid,
      sa = s / (dates.length - mid);
    const pct = ((sa - fa) / Math.max(fa, 1)) * 100;
    return { fa, sa, pct, dir: pct > 5 ? "up" : pct < -5 ? "down" : "stable" };
  }, [noPhotoRawItems]);

  if (isLoading) return null;

  return (
    <div className="p-4 sm:p-6 space-y-5 animate-fadeIn">
      {/* KPI Insight Cards — same style as dashboard KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* Total Parcels */}
        <div className={cardCls}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-xl -mr-6 -mt-6 transition-transform group-hover:scale-110" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
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
                จำนวนรวมพัสดุ
              </p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                  {kpiData.totalParcels.toLocaleString()}
                </h3>
              </div>
              <p className="text-[9px] text-gray-400 mt-0.5">
                ชิ้นงานทั้งหมดที่รายงาน
              </p>
            </div>
          </div>
        </div>

        {/* Total No Photo */}
        <div className={cardCls}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 dark:bg-pink-500/5 rounded-full blur-xl -mr-6 -mt-6 transition-transform group-hover:scale-110" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-rose-600 flex items-center justify-center shrink-0 shadow-lg shadow-pink-500/20">
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
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="relative z-10">
              <p className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                ไม่ได้ถ่ายภาพ (No Photo)
              </p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                  {kpiData.totalNoPhoto.toLocaleString()}
                </h3>
              </div>
              <p className="text-[9px] text-gray-400 mt-0.5">
                ครั้งที่เกิดปัญหา
              </p>
            </div>
          </div>
        </div>

        {/* Error Rate */}
        <div className={cardCls}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-xl -mr-6 -mt-6 transition-transform group-hover:scale-110" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
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
              <p className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                อัตราผิดพลาด
              </p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                  {kpiData.errorRate}%
                </h3>
              </div>
              <p className="text-[9px] text-gray-400 mt-0.5">
                {kpiData.totalNoPhoto.toLocaleString()} /{" "}
                {kpiData.totalParcels.toLocaleString()} ชิ้น
              </p>
            </div>
          </div>
        </div>

        {/* Problematic Office */}
        <div className={cardCls}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 dark:bg-rose-500/5 rounded-full blur-xl -mr-6 -mt-6 transition-transform group-hover:scale-110" />
          <div className="flex items-center gap-3">
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <div className="relative z-10 overflow-hidden min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide truncate">
                ที่ทำการปัญหาสูงสุด
              </p>
              <h3
                className="text-sm sm:text-base font-bold text-gray-900 dark:text-white tracking-tight truncate leading-tight mt-0.5"
                title={kpiData.mostProblematicOffice}
              >
                {kpiData.mostProblematicOffice}
              </h3>
              <p className="text-[9px] text-rose-500 font-medium">
                พลาด {kpiData.maxOfficeCount.toLocaleString()} ครั้ง
              </p>
            </div>
          </div>
        </div>

        {/* Peak Day */}
        <div className={cardCls}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-xl -mr-6 -mt-6 transition-transform group-hover:scale-110" />
          <div className="flex items-center gap-3">
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="relative z-10">
              <p className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                วันที่พลาดบ่อยสุด
              </p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                  {peakDay.name}
                </h3>
              </div>
              <p className="text-[9px] text-gray-400 mt-0.5">
                รวม {peakDay.count.toLocaleString()} ครั้ง
              </p>
            </div>
          </div>
        </div>

        {/* Trend */}
        <div className={cardCls}>
          <div
            className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-xl -mr-6 -mt-6 transition-transform group-hover:scale-110 ${trendInsight?.dir === "up" ? "bg-red-500/10 dark:bg-red-500/5" : trendInsight?.dir === "down" ? "bg-emerald-500/10 dark:bg-emerald-500/5" : "bg-slate-500/10 dark:bg-slate-500/5"}`}
          />
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${trendInsight?.dir === "up" ? "bg-gradient-to-br from-red-400 to-red-600 shadow-red-500/20" : trendInsight?.dir === "down" ? "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/20" : "bg-gradient-to-br from-slate-400 to-slate-600 shadow-slate-500/20"}`}
            >
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
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-1">
                <p className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  แนวโน้ม
                </p>
                <div className="group/tooltip relative flex items-center justify-center">
                  <svg
                    className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-[10px] rounded-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-50 shadow-xl pointer-events-none">
                    คำนวณโดยเปรียบเทียบค่าเฉลี่ยจำนวนครั้งที่เกิดปัญหาต่อวัน
                    ระหว่างช่วงครึ่งหลังกับครึ่งแรกของวันที่เลือก
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
              {trendInsight ? (
                <>
                  <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white tracking-tight leading-none mt-0.5">
                    {trendInsight.dir === "up"
                      ? "แย่ลง 📈"
                      : trendInsight.dir === "down"
                        ? "ดีขึ้น 📉"
                        : "คงที่ ➡️"}
                  </h3>
                  <p className="text-[9px] text-gray-400 mt-0.5">
                    {trendInsight.pct > 0 ? "+" : ""}
                    {trendInsight.pct.toFixed(0)}%{" "}
                    <span className="hidden sm:inline">เทียบครึ่งแรก</span>
                  </p>
                </>
              ) : (
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                  ข้อมูลไม่เพียงพอ
                </h3>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Work Status Donut */}
        <div className={chartCardCls}>
          <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">
            สถานะชิ้นงานทั้งหมด
          </h4>
          <p className="text-[10px] text-gray-400 mb-3">
            ภาพรวมชิ้นงานแยกตามสถานะการทำงาน
          </p>
          <div className="h-[260px]">
            {workStatusData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                ไม่มีข้อมูล
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={workStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={95}
                    dataKey="value"
                    paddingAngle={4}
                    strokeWidth={0}
                  >
                    {workStatusData.map((e, i) => (
                      <Cell key={i} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tipStyle}
                    formatter={(v: any) => [`${v.toLocaleString()} ชิ้น`]}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: "12px", fontWeight: 600 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Total Parcels by Platform Pie */}
        <div className={chartCardCls}>
          <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">
            ปริมาณงานตามแพลตฟอร์ม
          </h4>
          <p className="text-[10px] text-gray-400 mb-3">
            สัดส่วนจำนวนพัสดุทั้งหมดแยกตาม Platform
          </p>
          <div className="h-[260px]">
            {totalPlatformData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                ไม่มีข้อมูล
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={totalPlatformData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={95}
                    dataKey="value"
                    paddingAngle={4}
                    strokeWidth={0}
                  >
                    {totalPlatformData.map((e, i) => (
                      <Cell key={i} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tipStyle}
                    formatter={(v: any) => [`${v.toLocaleString()} ชิ้น`]}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: "12px", fontWeight: 600 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Platform Pie (No Photo) */}
        <div className={chartCardCls}>
          <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">
            สัดส่วน No Photo ตามแพลตฟอร์ม
          </h4>
          <p className="text-[10px] text-gray-400 mb-3">
            แยกตาม Platform ที่เกิดปัญหา
          </p>
          <div className="h-[260px]">
            {platformData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                ไม่มีข้อมูล
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={95}
                    dataKey="value"
                    paddingAngle={4}
                    strokeWidth={0}
                  >
                    {platformData.map((e, i) => (
                      <Cell key={i} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tipStyle}
                    formatter={(v: any) => [`${v} ครั้ง`]}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: "12px", fontWeight: 600 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className={chartCardCls}>
          <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">
            Top 5 ที่ทำการปัญหาสูงสุด
          </h4>
          <p className="text-[10px] text-gray-400 mb-3">
            จัดอันดับตามจำนวน No Photo
          </p>
          <div className="h-[260px]">
            {top5Offices.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                ไม่มีข้อมูล
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={top5Offices}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="officeGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#818cf8" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="#f0f0f0"
                  />
                  <XAxis
                    type="number"
                    tick={{ fill: "#9ca3af", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: "#6b7280", fontSize: 11, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    width={120}
                  />
                  <Tooltip
                    contentStyle={tipStyle}
                    formatter={(v: any) => [`${v} ครั้ง`, "No Photo"]}
                  />
                  <Bar
                    dataKey="value"
                    fill="url(#officeGrad)"
                    radius={[0, 6, 6, 0]}
                    barSize={20}
                    label={{
                      position: "right",
                      fill: "#4b5563",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top 5 People */}
        <div className={chartCardCls}>
          <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">
            Top 5 เจ้าหน้าที่ที่ต้องพัฒนา
          </h4>
          <p className="text-[10px] text-gray-400 mb-3">
            จัดอันดับตามจำนวน No Photo สูงสุด
          </p>
          {top5People.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">
              ไม่มีข้อมูล
            </div>
          ) : (
            <div className="space-y-3">
              {top5People.map((p, i) => {
                const max = top5People[0]?.count || 1;
                const pct = (p.count / max) * 100;
                const medals = ["🥇", "🥈", "🥉"];
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                        <span className="text-base">
                          {medals[i] || `#${i + 1}`}
                        </span>
                        {p.name}
                      </span>
                      <span className="text-xs font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                        {p.count} ครั้ง
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-rose-400 to-rose-600 transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {p.offices.length > 0 && (
                      <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                        สังกัด: {p.offices.join(", ")}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Day of Week */}
        <div className={chartCardCls}>
          <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">
            วิเคราะห์วันในสัปดาห์
          </h4>
          <p className="text-[10px] text-gray-400 mb-3">
            วันไหนเกิดปัญหามากที่สุด?
          </p>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dayOfWeekData}
                margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="gradDay0Sum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fca5a5" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                  <linearGradient id="gradDay1Sum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="100%" stopColor="#eab308" />
                  </linearGradient>
                  <linearGradient id="gradDay2Sum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fbcfe8" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                  <linearGradient id="gradDay3Sum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#86efac" />
                    <stop offset="100%" stopColor="#22c55e" />
                  </linearGradient>
                  <linearGradient id="gradDay4Sum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fdba74" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>
                  <linearGradient id="gradDay5Sum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#93c5fd" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                  <linearGradient id="gradDay6Sum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d8b4fe" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#9ca3af", fontSize: 11, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={tipStyle}
                  formatter={(v: any) => [`${v} ครั้ง`, "No Photo"]}
                />
                <Bar
                  dataKey="count"
                  radius={[6, 6, 0, 0]}
                  barSize={35}
                  label={{
                    position: "top",
                    fill: "#4b5563",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {dayOfWeekData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fillId} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
