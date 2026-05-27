"use client";

import React, { useMemo } from "react";

interface SummaryItem {
  office: string;
  post_code: string;
  total: number;
  no_photo: number;
  completed: number;
  waiting: number;
}

interface LeaderboardProps {
  data: SummaryItem[];
}

export default function Leaderboard({ data }: LeaderboardProps) {
  const { topPerformers, needsImprovement } = useMemo(() => {
    // Filter out items with very low volume to prevent skewed rates (e.g. 0% error on 1 item)
    // and calculate error rate
    const validData = data
      .filter((d) => d.total >= 5) // At least 5 parcels to qualify
      .map((d) => ({
        ...d,
        errorRate: (d.no_photo / d.total) * 100,
      }));

    // Sort for Top Performers: Lowest error rate first, then Highest total
    const top = [...validData]
      .sort((a, b) => {
        if (a.errorRate !== b.errorRate) {
          return a.errorRate - b.errorRate;
        }
        return b.total - a.total;
      })
      .slice(0, 10);

    // Sort for Needs Improvement: Highest error rate first, then Highest total
    const bottom = [...validData]
      .sort((a, b) => {
        if (b.errorRate !== a.errorRate) {
          return b.errorRate - a.errorRate;
        }
        return b.total - a.total;
      })
      .filter((d) => d.errorRate > 0) // Only show if they actually have errors
      .slice(0, 10);

    return { topPerformers: top, needsImprovement: bottom };
  }, [data]);

  const renderRankIcon = (index: number) => {
    if (index === 0)
      return (
        <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center font-black shadow-inner shadow-yellow-500/30 border border-yellow-200">
          1
        </div>
      );
    if (index === 1)
      return (
        <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-black shadow-inner shadow-gray-400/30 border border-gray-300">
          2
        </div>
      );
    if (index === 2)
      return (
        <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-black shadow-inner shadow-orange-600/30 border border-orange-200">
          3
        </div>
      );
    return (
      <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 flex items-center justify-center font-bold border border-gray-100 dark:border-gray-700">
        {index + 1}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">กระดานผู้นำ (Leaderboard)</h2>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">จัดอันดับที่ทำการดีเด่นและที่ต้องปรับปรุง</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">ที่ทำการผลงานดีเด่น (Top 10)</h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">อัตราผิดพลาดต่ำสุด (พัสดุรวม 5 ชิ้นขึ้นไป)</p>
            </div>
          </div>
          <div className="p-2 flex-1">
            {topPerformers.length > 0 ? (
              <div className="space-y-1">
                {topPerformers.map((item, idx) => (
                  <div key={item.office + item.post_code} className="flex items-center p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                    <div className="shrink-0 mr-4">
                      {renderRankIcon(idx)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                        {item.office} <span className="text-gray-400 dark:text-gray-500 font-medium text-xs">({item.post_code})</span>
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        สำเร็จ <span className="font-semibold text-emerald-600 dark:text-emerald-400">{item.total - item.no_photo}</span> / {item.total} ชิ้น
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <div className="text-lg font-black text-emerald-500">
                        {item.errorRate.toFixed(2)}%
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Error Rate</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-gray-400">
                <p>ไม่มีข้อมูลเพียงพอ</p>
              </div>
            )}
          </div>
        </div>

        {/* Needs Improvement */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/10 dark:to-pink-900/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">ที่ทำการที่ต้องปรับปรุง (Top 10)</h3>
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">อัตราผิดพลาดสูงสุด</p>
            </div>
          </div>
          <div className="p-2 flex-1">
            {needsImprovement.length > 0 ? (
              <div className="space-y-1">
                {needsImprovement.map((item, idx) => (
                  <div key={item.office + item.post_code} className="flex items-center p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                    <div className="shrink-0 mr-4">
                      {renderRankIcon(idx)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                        {item.office} <span className="text-gray-400 dark:text-gray-500 font-medium text-xs">({item.post_code})</span>
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        พลาด <span className="font-semibold text-rose-600 dark:text-rose-400">{item.no_photo}</span> / {item.total} ชิ้น
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <div className="text-lg font-black text-rose-500">
                        {item.errorRate.toFixed(2)}%
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Error Rate</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-gray-400">
                <p>ไม่มีข้อมูลเพียงพอ</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
