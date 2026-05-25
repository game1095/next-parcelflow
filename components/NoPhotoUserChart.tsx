"use client";

import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CHART_COLORS = [
  "#ef4444", // Red
  "#f97316", // Orange
  "#eab308", // Yellow
  "#22c55e", // Green
  "#14b8a6", // Teal
  "#0ea5e9", // Sky
  "#3b82f6", // Blue
  "#6366f1", // Indigo
  "#a855f7", // Purple
  "#ec4899", // Pink
];

const tooltipStyle = {
  borderRadius: "16px",
  border: "none",
  boxShadow:
    "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
  backgroundColor: "rgba(255,255,255,0.95)",
  backdropFilter: "blur(8px)",
  padding: "12px 16px",
};

type NoPhotoItem = {
  barcode: string;
  user_name: string;
  name: string;
  file_key: string;
  office: string;
  report_date: string | null;
};

export default function NoPhotoUserChart({ items }: { items: NoPhotoItem[] }) {
  const [selectedName, setSelectedName] = useState<string>("all");

  const displayMonth = useMemo(() => {
    if (!items || items.length === 0) return "";
    let latestDateStr = "";
    for (const item of items) {
      if (item.report_date) {
        if (!latestDateStr || item.report_date > latestDateStr) {
          latestDateStr = item.report_date;
        }
      }
    }
    if (latestDateStr) {
      const date = new Date(latestDateStr);
      return date.toLocaleDateString("th-TH", {
        month: "long",
        year: "numeric",
      });
    }
    return "";
  }, [items]);

  // Extract unique names and count for the dropdown
  const availableNames = useMemo(() => {
    const nameMap: Record<
      string,
      { baseName: string; office: string; count: number }
    > = {};

    items.forEach((item) => {
      const name =
        item.name && item.name.trim() !== "-"
          ? item.name
          : "ไม่ระบุชื่อเจ้าหน้าที่";
      const office = item.office || "ไม่ระบุสาขา";
      const key = `${name}_${office}`;

      if (!nameMap[key]) {
        nameMap[key] = { baseName: name, office, count: 0 };
      }
      nameMap[key].count++;
    });

    // Format as "Name (Count) (Office)" and sort by count descending
    return Object.values(nameMap)
      .sort((a, b) => b.count - a.count)
      .map((entry) => ({
        value: `${entry.baseName} (${entry.office})`,
        label: `${entry.baseName} (${entry.count}) (${entry.office})`,
      }));
  }, [items]);

  // Find top 10 names if "all" is selected
  const top10Names = useMemo(() => {
    if (selectedName !== "all") return [];

    const countMap: Record<string, number> = {};
    items.forEach((item) => {
      const name =
        item.name && item.name.trim() !== "-"
          ? item.name
          : "ไม่ระบุชื่อเจ้าหน้าท่";
      const office = item.office || "ไม่ระบุสาขา";
      const key = `${name} (${office})`;
      countMap[key] = (countMap[key] || 0) + 1;
    });

    return Object.entries(countMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map((entry) => entry[0]);
  }, [items, selectedName]);

  // Aggregate data by date
  const chartData = useMemo(() => {
    let filteredItems = items;

    if (selectedName !== "all") {
      // 1. Single Customer Area Chart
      filteredItems = filteredItems.filter((item) => {
        const name =
          item.name && item.name.trim() !== "-"
            ? item.name
            : "ไม่ระบุชื่อเจ้าหน้าที่";
        const office = item.office || "ไม่ระบุที่ทำการ";
        return `${name} (${office})` === selectedName;
      });

      const dateMap: Record<string, number> = {};
      filteredItems.forEach((item) => {
        const dateKey = item.report_date
          ? item.report_date.split("T")[0]
          : "ไม่ระบุวันที่";
        if (!dateMap[dateKey]) dateMap[dateKey] = 0;
        dateMap[dateKey]++;
      });

      const dataArray = Object.entries(dateMap).map(([date, count]) => ({
        date,
        count,
        formattedDate:
          date === "ไม่ระบุวันที่" ? date : new Date(date).getDate().toString(),
      }));

      return dataArray.sort((a, b) => {
        if (a.date === "ไม่ระบุวันที่") return -1;
        if (b.date === "ไม่ระบุวันที่") return 1;
        return a.date > b.date ? 1 : -1;
      });
    } else {
      // 2. Top 10 Multi-line Chart
      let filteredItems = items.filter((item) => {
        const name =
          item.name && item.name.trim() !== "-"
            ? item.name
            : "ไม่ระบุชื่อเจ้าหน้าที่";
        const office = item.office || "ไม่ระบุสาขา";
        return top10Names.includes(`${name} (${office})`);
      });

      const dateMap: Record<string, any> = {};

      filteredItems.forEach((item) => {
        const dateKey = item.report_date
          ? item.report_date.split("T")[0]
          : "ไม่ระบุวันที่";
        const name =
          item.name && item.name.trim() !== "-"
            ? item.name
            : "ไม่ระบุชื่อเจ้าหน้าที่";
        const office = item.office || "ไม่ระบุสาขา";
        const nameKey = `${name} (${office})`;

        if (!dateMap[dateKey]) {
          dateMap[dateKey] = { date: dateKey };
        }

        if (!dateMap[dateKey][nameKey]) dateMap[dateKey][nameKey] = 0;
        dateMap[dateKey][nameKey]++;
      });

      const dataArray = Object.values(dateMap).map((row) => {
        // Ensure all top 10 names have a value (even if 0) for each date
        top10Names.forEach((name) => {
          if (row[name] === undefined) row[name] = 0;
        });

        return {
          ...row,
          formattedDate:
            row.date === "ไม่ระบุวันที่"
              ? row.date
              : new Date(row.date).toLocaleDateString("th-TH", {
                  month: "short",
                  day: "numeric",
                }),
        };
      });

      return dataArray.sort((a, b) => {
        if (a.date === "ไม่ระบุวันที่") return -1;
        if (b.date === "ไม่ระบุวันที่") return 1;
        return a.date > b.date ? 1 : -1;
      });
    }
  }, [items, selectedName, top10Names]);

  // We use standard Tooltip for the line chart but limit to top 15 in case there are too many names on one day
  const renderLineTooltip = (props: any) => {
    const { active, payload, label } = props;
    if (active && payload && payload.length) {
      const activeData = payload
        .filter((entry: any) => entry.value > 0)
        .sort((a: any, b: any) => b.value - a.value);

      const showData = activeData.slice(0, 15);
      const hiddenCount = activeData.length - showData.length;

      return (
        <div style={tooltipStyle}>
          <p style={{ color: "#374151", fontWeight: 700, marginBottom: "8px" }}>
            วันที่: {label}
          </p>
          <div className="space-y-1">
            {showData.map((entry: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4 text-xs"
              >
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-sm"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-gray-700 font-medium truncate max-w-[150px]">
                    {entry.name}
                  </span>
                </span>
                <span className="font-bold" style={{ color: entry.color }}>
                  {entry.value}
                </span>
              </div>
            ))}
            {hiddenCount > 0 && (
              <div className="text-xs text-gray-400 font-medium pt-1 border-t border-gray-100 mt-1">
                และอื่นๆ อีก {hiddenCount} รายการ...
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full group relative overflow-hidden bg-white dark:bg-[#161a24] rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all duration-300">
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-teal-500/5 to-transparent rounded-bl-full" />
      <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
            แนวโน้มปัญหา No Photo รายเจ้าหน้าที่ (รายวัน){" "}
            {selectedName === "all" ? "- Top 10" : ""}
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-2">
            <span>ติดตามพฤติกรรม No Photo ของเจ้าหน้าที่แต่ละราย</span>
            {displayMonth && (
              <span className="px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 font-semibold border border-teal-100 dark:border-teal-500/20">
                ข้อมูล ณ {displayMonth}
              </span>
            )}
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <select
            className="block w-full p-2.5 text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl bg-gray-50/80 focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 dark:bg-gray-800/80 dark:border-gray-600 dark:text-gray-300 appearance-none cursor-pointer transition-all"
            value={selectedName}
            onChange={(e) => setSelectedName(e.target.value)}
          >
            <option value="all">ภาพรวมทุกคน (All Customers)</option>
            {availableNames.map((nameObj) => (
              <option key={nameObj.value} value={nameObj.value}>
                {nameObj.label}
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
      </div>

      <div className="p-6">
        {chartData.length > 0 ? (
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {selectedName === "all" ? (
                <LineChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f0f0f0"
                  />
                  <XAxis
                    dataKey="formattedDate"
                    tick={{ fill: "#9ca3af", fontSize: 11, fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: "#9ca3af", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    dx={-10}
                  />
                  <Tooltip content={renderLineTooltip} />
                  <Legend
                    verticalAlign="top"
                    height={40}
                    wrapperStyle={{
                      fontSize: "13px",
                      paddingTop: "10px",
                      paddingBottom: "20px",
                    }}
                  />

                  {top10Names.map((name, index) => {
                    return (
                      <Line
                        key={name}
                        type="monotone"
                        dataKey={name}
                        name={name}
                        stroke={CHART_COLORS[index % CHART_COLORS.length]}
                        strokeWidth={2}
                        dot={{ r: 3, strokeWidth: 1 }}
                        activeDot={{ r: 5, strokeWidth: 0 }}
                      />
                    );
                  })}
                </LineChart>
              ) : (
                <AreaChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f0f0f0"
                  />
                  <XAxis
                    dataKey="formattedDate"
                    tick={{ fill: "#9ca3af", fontSize: 11, fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: "#9ca3af", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    dx={-10}
                  />
                  <Tooltip
                    cursor={{
                      stroke: "#0d9488",
                      strokeWidth: 2,
                      strokeDasharray: "5 5",
                    }}
                    contentStyle={tooltipStyle}
                    itemStyle={{ color: "#0d9488", fontWeight: 700 }}
                    labelStyle={{
                      color: "#374151",
                      fontWeight: 700,
                      marginBottom: "4px",
                    }}
                    labelFormatter={(label) => `วันที่: ${label}`}
                    formatter={(value: any) => [
                      `${value} ครั้ง`,
                      "จำนวน No Photo",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#0d9488"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorCount)"
                    activeDot={{ r: 6, strokeWidth: 0, fill: "#0f766e" }}
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <svg
              className="w-12 h-12 mb-4 text-gray-300 dark:text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <p className="text-lg">
              ไม่มีข้อมูลในช่วงเวลาหรือเจ้าหน้าที่ที่เลือก
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
