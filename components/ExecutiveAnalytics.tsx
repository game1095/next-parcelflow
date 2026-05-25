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

// Brand Colors for Platforms (more vibrant)
const PLATFORM_COLORS = {
  tiktok: "#25F4EE",
  shopee: "#ee4d2d",
  lazada: "#1a1aff",
  other: "#9ca3af",
};

const TIKTOK_DARK = "#161616";

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
      },
      {
        id: "shopee",
        baseName: "Shopee",
        value: s,
        color: PLATFORM_COLORS.shopee,
      },
      {
        id: "lazada",
        baseName: "Lazada",
        value: l,
        color: PLATFORM_COLORS.lazada,
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
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  wrapperStyle={{ fontSize: "12px", fontWeight: 600 }}
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
                  height={36}
                  wrapperStyle={{ fontSize: "11px", fontWeight: 600 }}
                />
                <Bar
                  dataKey="tiktok"
                  name="Tiktok"
                  stackId="a"
                  fill={TIKTOK_DARK}
                  radius={[0, 0, 4, 4]}
                />
                <Bar
                  dataKey="shopee"
                  name="Shopee"
                  stackId="a"
                  fill={PLATFORM_COLORS.shopee}
                />
                <Bar
                  dataKey="lazada"
                  name="Lazada"
                  stackId="a"
                  fill={PLATFORM_COLORS.lazada}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Top 10 Customers */}
      <div className="group relative overflow-hidden bg-white dark:bg-[#161a24] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-violet-500/5 to-transparent rounded-bl-full" />
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">
          10 อันดับลูกค้าที่พบปัญหา No Photo บ่อยที่สุด
        </h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
          จัดอันดับเจ้าหน้าที่ที่มีประวัติไม่มีรูปถ่ายมากที่สุด
        </p>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={staffData}
              layout="vertical"
              margin={{ top: 20, right: 40, left: 40, bottom: 20 }}
            >
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#a78bfa" />
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
                cursor={{ fill: "rgba(124,58,237,0.04)" }}
                contentStyle={tooltipStyle}
                formatter={(value: any) => [`${value} ครั้ง`, "จำนวนที่พลาด"]}
              />
              <Bar
                dataKey="count"
                fill="url(#barGradient)"
                radius={[0, 8, 8, 0]}
                barSize={22}
                label={{
                  position: "right",
                  fill: "#7c3aed",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
