"use client";

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
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

// Colors for individual lines
const CHART_COLORS = [
  "#3b82f6", // Blue
  "#ec4899", // Pink
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#8b5cf6", // Purple
  "#ef4444", // Red
  "#06b6d4", // Cyan
  "#f97316", // Orange
  "#6366f1", // Indigo
  "#14b8a6", // Teal
];

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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 max-w-[320px]">
        <p className="font-bold text-gray-800 dark:text-gray-200 mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">
          {label}
        </p>
        <div className="space-y-4">
          {payload.map((entry: any, index: number) => {
            const name = entry.dataKey;
            const details = entry.payload[`${name}_details`];
            return (
              <div key={index} className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: entry.color }}
                  ></span>
                  <span
                    className="font-semibold text-sm text-gray-700 dark:text-gray-300"
                    style={{ color: entry.color }}
                  >
                    {name}: <span className="font-bold">{entry.value}</span>{" "}
                    ครั้ง
                  </span>
                </div>
                {details && entry.value > 0 && (
                  <div className="pl-5 flex flex-wrap gap-2 text-[10px] mt-1.5 font-bold tracking-wide">
                    {details.tiktok > 0 && (
                      <span className="text-[#00f2fe] bg-[#00f2fe]/10 px-1.5 py-0.5 rounded">
                        Tiktok: {details.tiktok}
                      </span>
                    )}
                    {details.shopee > 0 && (
                      <span className="text-[#ff7337] bg-[#ff7337]/10 px-1.5 py-0.5 rounded">
                        Shopee: {details.shopee}
                      </span>
                    )}
                    {details.lazada > 0 && (
                      <span className="text-[#f472b6] bg-[#f472b6]/10 px-1.5 py-0.5 rounded">
                        Lazada: {details.lazada}
                      </span>
                    )}
                    {details.other > 0 && (
                      <span className="text-gray-500 bg-gray-500/10 px-1.5 py-0.5 rounded">
                        อื่น ๆ: {details.other}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

export default function IndividualAnalytics({
  items,
}: {
  items: NoPhotoItem[];
}) {
  // 1. Find all unique names and their total counts to set the default selected name
  const nameStats = useMemo(() => {
    const map: Record<
      string,
      { count: number; dates: Record<string, number> }
    > = {};
    items.forEach((item) => {
      const name =
        item.name && item.name.trim() !== "-" ? item.name : "ไม่ระบุชื่อ";
      const office = item.office || "ไม่ระบุสาขา";
      const dateStr = item.report_date ? item.report_date.split("T")[0] : null;

      if (name !== "ไม่ระบุชื่อ") {
        const key = `${name} (${office})`;
        if (!map[key]) map[key] = { count: 0, dates: {} };
        map[key].count += 1;

        if (dateStr) {
          map[key].dates[dateStr] = (map[key].dates[dateStr] || 0) + 1;
        }
      }
    });

    const sortedNames = Object.entries(map)
      .sort((a, b) => b[1].count - a[1].count)
      .map(([name, data]) => {
        // Calculate simple trend based on dates
        const dates = Object.keys(data.dates).sort();
        let trend: "worsening" | "improving" | "stable" = "stable";

        if (dates.length >= 2) {
          const mid = Math.floor(dates.length / 2);
          let firstHalf = 0;
          let secondHalf = 0;

          dates.slice(0, mid).forEach((d) => (firstHalf += data.dates[d]));
          dates.slice(mid).forEach((d) => (secondHalf += data.dates[d]));

          // Normalize by days if uneven split
          const firstHalfAvg = firstHalf / mid;
          const secondHalfAvg = secondHalf / (dates.length - mid);

          if (secondHalfAvg > firstHalfAvg * 1.2) trend = "worsening";
          else if (secondHalfAvg < firstHalfAvg * 0.8) trend = "improving";
        }

        return { name, count: data.count, trend };
      });

    return sortedNames;
  }, [items]);

  // Default to the person with the most errors
  const [selectedNames, setSelectedNames] = useState<string[]>(
    nameStats.length > 0 ? [nameStats[0].name] : [],
  );

  // Search query for the multi-select
  const [searchQuery, setSearchQuery] = useState("");

  const toggleName = (name: string) => {
    setSelectedNames((prev) => {
      if (prev.includes(name)) {
        return prev.filter((n) => n !== name);
      } else {
        return [...prev, name];
      }
    });
  };

  const resetToDefault = () => {
    setSelectedNames(nameStats.length > 0 ? [nameStats[0].name] : []);
    setSearchQuery("");
  };

  // 2. Prepare data for the Line Chart based on selected names
  const chartData = useMemo(() => {
    if (selectedNames.length === 0) return [];

    // Group by report_date
    const dateMap: Record<string, Record<string, any>> = {};
    const sysDateMap: Record<string, number> = {};

    // Find min and max dates from ALL items to show a continuous timeline
    let minDate: Date | null = null;
    let maxDate: Date | null = null;

    items.forEach((item) => {
      const dateStr = item.report_date ? item.report_date.split("T")[0] : null;
      if (dateStr) {
        sysDateMap[dateStr] = (sysDateMap[dateStr] || 0) + 1;
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
          if (!minDate || d < minDate) minDate = d;
          if (!maxDate || d > maxDate) maxDate = d;
        }
      }
    });

    const allDates = new Set<string>();

    // Fill all dates between min and max
    if (minDate && maxDate) {
      let current = new Date(minDate);
      while (current <= maxDate) {
        allDates.add(current.toISOString().split("T")[0]);
        current.setDate(current.getDate() + 1);
      }
    }

    items.forEach((item) => {
      const dateStr = item.report_date
        ? item.report_date.split("T")[0]
        : "ไม่ระบุวันที่";
      const rawName =
        item.name && item.name.trim() !== "-" ? item.name : "ไม่ระบุชื่อ";
      const office = item.office || "ไม่ระบุสาขา";
      const nameWithOffice = `${rawName} (${office})`;
      const platform = (item.file_key || "other").toLowerCase();

      if (
        dateStr !== "ไม่ระบุวันที่" &&
        selectedNames.includes(nameWithOffice)
      ) {
        if (!dateMap[dateStr]) {
          dateMap[dateStr] = {};
        }

        if (!dateMap[dateStr][nameWithOffice]) {
          dateMap[dateStr][nameWithOffice] = {
            total: 0,
            details: { tiktok: 0, shopee: 0, lazada: 0, other: 0 },
          };
        }

        dateMap[dateStr][nameWithOffice].total += 1;

        if (platform === "tiktok")
          dateMap[dateStr][nameWithOffice].details.tiktok += 1;
        else if (platform === "shopee")
          dateMap[dateStr][nameWithOffice].details.shopee += 1;
        else if (platform === "lazada")
          dateMap[dateStr][nameWithOffice].details.lazada += 1;
        else dateMap[dateStr][nameWithOffice].details.other += 1;
      }
    });

    // Convert to array and sort by date
    const sortedDates = Array.from(allDates).sort();
    const totalUsers = Math.max(1, nameStats.length);

    return sortedDates.map((date) => {
      const point: any = {
        date: new Date(date).toLocaleDateString("th-TH", {
          day: "numeric",
          month: "short",
        }),
      };

      const sysDailyTotal = sysDateMap[date] || 0;
      point["ค่าเฉลี่ยระบบ"] = Number((sysDailyTotal / totalUsers).toFixed(2));

      // Ensure all selected names have a value (0 if not present) for smooth lines
      selectedNames.forEach((name) => {
        const data = dateMap[date]?.[name];
        point[name] = data ? data.total : 0;
        point[`${name}_details`] = data
          ? data.details
          : { tiktok: 0, shopee: 0, lazada: 0, other: 0 };
      });

      return point;
    });
  }, [items, selectedNames, nameStats.length]);

  // 3. Prepare data for Day of Week Bar Chart based on selected names
  const dayOfWeekData = useMemo(() => {
    if (selectedNames.length === 0) return [];

    const days = [
      {
        id: 0,
        name: "อาทิตย์",
        count: 0,
        fillId: "url(#gradDay0Ind)",
        color: "#f87171",
      },
      {
        id: 1,
        name: "จันทร์",
        count: 0,
        fillId: "url(#gradDay1Ind)",
        color: "#facc15",
      },
      {
        id: 2,
        name: "อังคาร",
        count: 0,
        fillId: "url(#gradDay2Ind)",
        color: "#f472b6",
      },
      {
        id: 3,
        name: "พุธ",
        count: 0,
        fillId: "url(#gradDay3Ind)",
        color: "#4ade80",
      },
      {
        id: 4,
        name: "พฤหัสฯ",
        count: 0,
        fillId: "url(#gradDay4Ind)",
        color: "#fb923c",
      },
      {
        id: 5,
        name: "ศุกร์",
        count: 0,
        fillId: "url(#gradDay5Ind)",
        color: "#60a5fa",
      },
      {
        id: 6,
        name: "เสาร์",
        count: 0,
        fillId: "url(#gradDay6Ind)",
        color: "#c084fc",
      },
    ];

    items.forEach((item) => {
      const rawName =
        item.name && item.name.trim() !== "-" ? item.name : "ไม่ระบุชื่อ";
      const office = item.office || "ไม่ระบุสาขา";
      const nameWithOffice = `${rawName} (${office})`;

      if (
        selectedNames.includes(nameWithOffice) &&
        item.report_date &&
        item.report_date !== "ไม่ระบุวันที่"
      ) {
        const dateObj = new Date(item.report_date.split("T")[0]);
        if (!isNaN(dateObj.getTime())) {
          const dayIndex = dateObj.getDay();
          days[dayIndex].count++;
        }
      }
    });

    return [days[1], days[2], days[3], days[4], days[5], days[6], days[0]];
  }, [items, selectedNames]);

  // Filter available names based on search query
  const filteredNames = nameStats.filter((n) =>
    n.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (items.length === 0) return null;

  return (
    <div className="w-full space-y-6 mt-6 animate-fadeIn">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Column: Selector */}
        <div className="w-full lg:w-1/4 xl:w-[28%] bg-white dark:bg-[#161a24] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-[500px]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              เลือกรายชื่อ
            </h3>
            {selectedNames.length > 0 && (
              <button
                onClick={resetToDefault}
                className="text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                รีเซ็ต
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            ค้นหาและเลือกเจ้าหน้าที่เพื่อเปรียบเทียบแนวโน้มข้อผิดพลาด
          </p>

          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="ค้นหารายชื่อ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-gray-200"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
            {filteredNames.length === 0 ? (
              <div className="text-center text-sm text-gray-400 py-6">
                ไม่พบรายชื่อที่ค้นหา
              </div>
            ) : (
              filteredNames.map((stat, idx) => {
                const isSelected = selectedNames.includes(stat.name);
                const colorIndex = selectedNames.indexOf(stat.name);
                const color = isSelected
                  ? CHART_COLORS[colorIndex % CHART_COLORS.length]
                  : "transparent";

                return (
                  <button
                    key={idx}
                    onClick={() => toggleName(stat.name)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 text-left border ${
                      isSelected
                        ? "bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/50 shadow-sm"
                        : "bg-white dark:bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div
                        className={`w-3 h-3 rounded-full shrink-0 transition-colors ${!isSelected && "border-2 border-gray-300 dark:border-gray-600"}`}
                        style={{
                          backgroundColor: isSelected ? color : "transparent",
                        }}
                      />
                      <div className="flex flex-col items-start min-w-0">
                        <span
                          className={`text-sm truncate font-medium ${isSelected ? "text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-400"}`}
                        >
                          {stat.name}
                        </span>
                        <div className="flex items-center mt-0.5">
                          {stat.trend === "worsening" && (
                            <span className="text-[9px] font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-1 rounded flex items-center gap-0.5">
                              <svg
                                className="w-2.5 h-2.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={3}
                                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                />
                              </svg>
                              แนวโน้มแย่ลง
                            </span>
                          )}
                          {stat.trend === "improving" && (
                            <span className="text-[9px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-1 rounded flex items-center gap-0.5">
                              <svg
                                className="w-2.5 h-2.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={3}
                                  d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                                />
                              </svg>
                              แนวโน้มดีขึ้น
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md shrink-0">
                      {stat.count}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Charts side by side */}
        <div className="w-full lg:w-3/4 xl:w-[72%] grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
          {/* Line Chart */}
          <div className="bg-white dark:bg-[#161a24] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 h-[500px] xl:col-span-2 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  กราฟแนวโน้มข้อผิดพลาด (No Photo)
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  แสดงจำนวนครั้งที่ไม่ได้ถ่ายรูปในแต่ละวันของบุคคลที่เลือก
                </p>
              </div>
              <div className="text-xs font-medium bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
                เลือกเปรียบเทียบแล้ว {selectedNames.length} คน
              </div>
            </div>

            <div className="flex-1 w-full min-h-0">
              {selectedNames.length === 0 ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 space-y-3">
                  <svg
                    className="w-12 h-12 text-gray-300 dark:text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-sm font-medium">
                    กรุณาเลือกรายชื่ออย่างน้อย 1 คนเพื่อแสดงกราฟ
                  </p>
                </div>
              ) : chartData.length === 0 ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 space-y-3">
                  <p className="text-sm font-medium">
                    ไม่พบข้อมูลในวันที่มีการรายงาน
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f0f0f0"
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#9ca3af", fontSize: 12, fontWeight: 500 }}
                      axisLine={false}
                      tickLine={false}
                      dy={10}
                    />
                    <YAxis
                      tick={{ fill: "#9ca3af", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      dx={-10}
                      allowDecimals={false}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{
                        stroke: "rgba(99,102,241,0.2)",
                        strokeWidth: 2,
                        strokeDasharray: "4 4",
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      height={40}
                      iconType="circle"
                      wrapperStyle={{
                        fontSize: "12px",
                        fontWeight: 600,
                        paddingBottom: "20px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="ค่าเฉลี่ยระบบ"
                      stroke="#9ca3af"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      activeDot={{ r: 4 }}
                      animationDuration={1500}
                    />
                    {selectedNames.map((name, index) => (
                      <Line
                        key={name}
                        type="monotone"
                        dataKey={name}
                        stroke={CHART_COLORS[index % CHART_COLORS.length]}
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                        animationDuration={1500}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Day of Week Pie Chart */}
          {selectedNames.length > 0 && chartData.length > 0 && (
            <div className="bg-white dark:bg-[#161a24] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 h-[500px] xl:col-span-1 flex flex-col">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">
                  วิเคราะห์วันในสัปดาห์ (Day of Week)
                </h3>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-4">
                  สัดส่วนปัญหาแยกตามวัน
                </p>
              </div>
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dayOfWeekData.filter((d) => d.count > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={105}
                      dataKey="count"
                      nameKey="name"
                      paddingAngle={3}
                      strokeWidth={0}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {dayOfWeekData
                        .filter((d) => d.count > 0)
                        .map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value: any, name: any) => [
                        `${value} ครั้ง`,
                        name,
                      ]}
                    />
                    <Legend
                      iconType="circle"
                      wrapperStyle={{ fontSize: "12px", fontWeight: 600 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
