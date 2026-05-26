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
  Legend,
  ResponsiveContainer,
} from "recharts";

type NoPhotoItem = {
  barcode: string;
  user_name: string;
  name: string;
  file_key: string;
  office: string;
  report_date: string | null;
};

// Brand Colors for Platforms (Soft Tones for Fallback/Text)
const PLATFORM_COLORS = {
  tiktok: "#64748b", // Slate
  shopee: "#fb923c", // Soft Orange
  lazada: "#60a5fa", // Soft Blue
  other: "#9ca3af",
};

const PlatformGradients = () => (
  <defs>
    <linearGradient id="gradTiktok" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#cbd5e1" />
      <stop offset="100%" stopColor="#64748b" />
    </linearGradient>
    <linearGradient id="gradShopee" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#fdba74" />
      <stop offset="100%" stopColor="#ea580c" />
    </linearGradient>
    <linearGradient id="gradLazada" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#93c5fd" />
      <stop offset="100%" stopColor="#2563eb" />
    </linearGradient>
  </defs>
);

// Premium tooltip style
const tooltipStyle = {
  borderRadius: "16px",
  border: "none",
  boxShadow:
    "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
  backgroundColor: "rgba(255,255,255,0.95)",
  backdropFilter: "blur(8px)",
  padding: "12px 16px",
};

export default function ExecutiveAnalytics({
  items,
}: {
  items: NoPhotoItem[];
}) {
  // Filter out 'other' platforms
  const mainPlatformItems = useMemo(() => {
    return items.filter((item) => {
      const key = (item.file_key || "").toLowerCase();
      return key === "tiktok" || key === "shopee" || key === "lazada";
    });
  }, [items]);

  // 1. Platform Distribution Data
  const platformData = useMemo(() => {
    let t = 0,
      s = 0,
      l = 0;
    mainPlatformItems.forEach((item) => {
      const key = (item.file_key || "").toLowerCase();
      if (key === "tiktok") t++;
      else if (key === "shopee") s++;
      else if (key === "lazada") l++;
    });

    return [
      {
        id: "tiktok",
        baseName: "Tiktok",
        value: t,
        color: PLATFORM_COLORS.tiktok,
        fillId: "url(#gradTiktok)",
      },
      {
        id: "shopee",
        baseName: "Shopee",
        value: s,
        color: PLATFORM_COLORS.shopee,
        fillId: "url(#gradShopee)",
      },
      {
        id: "lazada",
        baseName: "Lazada",
        value: l,
        color: PLATFORM_COLORS.lazada,
        fillId: "url(#gradLazada)",
      },
    ]
      .filter((d) => d.value > 0)
      .map((d) => ({
        ...d,
        name: `${d.baseName} (${d.value})`,
      }));
  }, [items]);

  // 2. Top Offices Data (Stacked Bar)
  const officeData = useMemo(() => {
    const map: Record<
      string,
      {
        office: string;
        tiktok: number;
        shopee: number;
        lazada: number;
        total: number;
      }
    > = {};

    mainPlatformItems.forEach((item) => {
      const office = item.office || "ไม่ระบุสาขา";
      if (!map[office]) {
        map[office] = { office, tiktok: 0, shopee: 0, lazada: 0, total: 0 };
      }

      const key = (item.file_key || "").toLowerCase();
      if (key === "tiktok") map[office].tiktok++;
      else if (key === "shopee") map[office].shopee++;
      else if (key === "lazada") map[office].lazada++;

      map[office].total++;
    });

    return Object.values(map)
      .sort((a, b) => b.total - a.total)
      .slice(0, 7); // Top 7 offices
  }, [mainPlatformItems]);

  // 3. Top Customer Data (Horizontal Bar)
  const staffData = useMemo(() => {
    const map: Record<string, number> = {};

    mainPlatformItems.forEach((item) => {
      const customerName =
        item.name && item.name.trim() !== "-" ? item.name : "ไม่ระบุชื่อลูกค้า";
      const office = item.office || "ไม่ระบุสาขา";
      const key = `${customerName} (${office})`;
      map[key] = (map[key] || 0) + 1;
    });

    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10) // Top 10 customers
      .map(([name, count]) => ({ name, count }));
  }, [mainPlatformItems]);

  // 4. Day of Week Data
  const dayOfWeekData = useMemo(() => {
    const days = [
      { id: 0, name: "อาทิตย์", count: 0, fillId: "url(#gradDay0)", color: "#f87171" }, // Red
      { id: 1, name: "จันทร์", count: 0, fillId: "url(#gradDay1)", color: "#facc15" }, // Yellow
      { id: 2, name: "อังคาร", count: 0, fillId: "url(#gradDay2)", color: "#f472b6" }, // Pink
      { id: 3, name: "พุธ", count: 0, fillId: "url(#gradDay3)", color: "#4ade80" }, // Green
      { id: 4, name: "พฤหัสฯ", count: 0, fillId: "url(#gradDay4)", color: "#fb923c" }, // Orange
      { id: 5, name: "ศุกร์", count: 0, fillId: "url(#gradDay5)", color: "#60a5fa" }, // Blue
      { id: 6, name: "เสาร์", count: 0, fillId: "url(#gradDay6)", color: "#c084fc" }, // Purple
    ];

    items.forEach((item) => {
      if (item.report_date && item.report_date !== "ไม่ระบุวันที่") {
        const dateObj = new Date(item.report_date.split("T")[0]);
        if (!isNaN(dateObj.getTime())) {
          const dayIndex = dateObj.getDay();
          days[dayIndex].count++;
        }
      }
    });

    // Reorder to start with Monday
    return [
      days[1], days[2], days[3], days[4], days[5], days[6], days[0]
    ];
  }, [items]);

  // Custom Tooltip for PieChart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
          <p className="font-bold text-gray-800 dark:text-gray-200">
            {payload[0].payload.baseName}
          </p>
          <p
            className="text-sm font-semibold"
            style={{ color: payload[0].payload.color }}
          >
            {payload[0].value} รายการ
          </p>
        </div>
      );
    }
    return null;
  };

  if (items.length === 0) return null;

  return (
    <div className="w-full space-y-6 mt-6">
      {/* Row 1: Donut & Top Offices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platform Distribution Donut */}
        <div className="group relative overflow-hidden bg-white dark:bg-[#161a24] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-500/5 to-transparent rounded-bl-full" />
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">
            สัดส่วนแพลตฟอร์ม
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
            วิเคราะห์ No Photo แยกตามแพลตฟอร์ม
          </p>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <PlatformGradients />
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={105}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={6}
                >
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fillId} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={40}
                  iconType="circle"
                  wrapperStyle={{ fontSize: "13px", fontWeight: 700, color: "#4b5563" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 7 Offices Stacked Bar */}
        <div className="lg:col-span-2 group relative overflow-hidden bg-white dark:bg-[#161a24] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/5 to-transparent rounded-bl-full" />
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">
            7 อันดับที่ทำการที่พบปัญหามากที่สุด
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
            ยอดรวม No Photo แยกตามที่ทำการและแพลตฟอร์ม
          </p>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={officeData}
                margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
              >
                <PlatformGradients />
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />
                <XAxis
                  dataKey="office"
                  tick={{ fill: "#9ca3af", fontSize: 11, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  dx={-10}
                />
                <Tooltip
                  cursor={{ fill: "rgba(99,102,241,0.04)" }}
                  contentStyle={tooltipStyle}
                />
                <Legend
                  verticalAlign="top"
                  height={40}
                  iconType="circle"
                  wrapperStyle={{ fontSize: "12px", fontWeight: 700, paddingBottom: "10px" }}
                />
                <Bar
                  dataKey="tiktok"
                  name="Tiktok"
                  stackId="a"
                  fill="url(#gradTiktok)"
                  radius={[0, 0, 4, 4]}
                />
                <Bar
                  dataKey="shopee"
                  name="Shopee"
                  stackId="a"
                  fill="url(#gradShopee)"
                />
                <Bar
                  dataKey="lazada"
                  name="Lazada"
                  stackId="a"
                  fill="url(#gradLazada)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Top 10 Customers & Day of Week */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 Customers */}
        <div className="group relative overflow-hidden bg-white dark:bg-[#161a24] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-violet-500/5 to-transparent rounded-bl-full" />
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">
            10 อันดับเจ้าหน้าที่ที่พบปัญหาบ่อยที่สุด
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
            จัดอันดับเจ้าหน้าที่ที่มีประวัติไม่มีรูปถ่ายมากที่สุด
          </p>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={staffData}
                layout="vertical"
                margin={{ top: 10, right: 40, left: 20, bottom: 10 }}
              >
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#c4b5fd" />
                    <stop offset="100%" stopColor="#8b5cf6" />
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
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: "#6b7280", fontSize: 11, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  width={140}
                />
                <Tooltip
                  cursor={{ fill: "rgba(124,58,237,0.06)" }}
                  contentStyle={tooltipStyle}
                  formatter={(value: any) => [`${value} ครั้ง`, "จำนวนที่พลาด"]}
                />
                <Bar
                  dataKey="count"
                  fill="url(#barGradient)"
                  radius={[0, 10, 10, 0]}
                  barSize={24}
                  label={{
                    position: "right",
                    fill: "#7c3aed",
                    fontSize: 13,
                    fontWeight: 800,
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Day of Week Analysis */}
        <div className="group relative overflow-hidden bg-white dark:bg-[#161a24] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-pink-500/5 to-transparent rounded-bl-full" />
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">
            วิเคราะห์ตามวันในสัปดาห์ (Day of Week)
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
            ค้นหาวันที่มีความผิดพลาด No Photo เกิดขึ้นมากที่สุด
          </p>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dayOfWeekData}
                margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
              >
                <defs>
                  <linearGradient id="gradDay0" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fca5a5" /><stop offset="100%" stopColor="#ef4444" /></linearGradient>
                  <linearGradient id="gradDay1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fef08a" /><stop offset="100%" stopColor="#eab308" /></linearGradient>
                  <linearGradient id="gradDay2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fbcfe8" /><stop offset="100%" stopColor="#ec4899" /></linearGradient>
                  <linearGradient id="gradDay3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#86efac" /><stop offset="100%" stopColor="#22c55e" /></linearGradient>
                  <linearGradient id="gradDay4" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fdba74" /><stop offset="100%" stopColor="#f97316" /></linearGradient>
                  <linearGradient id="gradDay5" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#93c5fd" /><stop offset="100%" stopColor="#3b82f6" /></linearGradient>
                  <linearGradient id="gradDay6" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#d8b4fe" /><stop offset="100%" stopColor="#a855f7" /></linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#9ca3af", fontSize: 12, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  dx={-10}
                />
                <Tooltip
                  cursor={{ fill: "rgba(236,72,153,0.06)" }}
                  contentStyle={tooltipStyle}
                  formatter={(value: any) => [`${value} ครั้ง`, "จำนวน No Photo"]}
                />
                <Bar
                  dataKey="count"
                  radius={[8, 8, 0, 0]}
                  barSize={45}
                  label={{
                    position: "top",
                    fill: "#4b5563",
                    fontSize: 13,
                    fontWeight: 800,
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
