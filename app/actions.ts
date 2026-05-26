"use server";

import { supabase } from "@/lib/supabase";
import { PROVINCE_GROUPS } from "@/lib/constants";

export async function fetchDashboardData(
  globalStartDate: string,
  globalEndDate: string,
  globalPlatform: string,
  globalProvince: string
) {
  const pageSize = 1000;
  // We only need these columns to build the KPI cards and tables
  const columnsToSelect = "office, post_code, status, file_key, report_date, barcode, user_name, name";

  // Compute month bounds
  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const targetMonth = globalStartDate ? globalStartDate.substring(0, 7) : getTodayString().substring(0, 7);
  const year = parseInt(targetMonth.split("-")[0]);
  const month = parseInt(targetMonth.split("-")[1]);
  const endOfMonthDate = new Date(year, month, 0);
  const endOfMonthStr = `${year}-${String(month).padStart(2, '0')}-${String(endOfMonthDate.getDate()).padStart(2, '0')}T23:59:59`;
  const startOfMonthStr = `${year}-${String(month).padStart(2, '0')}-01T00:00:00`;

  // --- 1. Prepare Count Queries ---
  let mainCountQuery = supabase.from("parcelFlow").select("*", { count: "exact", head: true });
  if (globalPlatform !== "all") mainCountQuery = mainCountQuery.ilike("file_key", globalPlatform);
  if (globalProvince !== "all") mainCountQuery = mainCountQuery.in("post_code", PROVINCE_GROUPS[globalProvince] || []);
  if (globalStartDate) mainCountQuery = mainCountQuery.gte("report_date", `${globalStartDate}T00:00:00`);
  if (globalEndDate) mainCountQuery = mainCountQuery.lte("report_date", `${globalEndDate}T23:59:59`);

  let monthCountQuery = supabase.from("parcelFlow")
    .select("*", { count: "exact", head: true })
    .gte("report_date", startOfMonthStr)
    .lte("report_date", endOfMonthStr)
    .or("status.ilike.%no photo%,status.ilike.%nophoto%");
  
  if (globalPlatform !== "all") monthCountQuery = monthCountQuery.ilike("file_key", globalPlatform);
  if (globalProvince !== "all") monthCountQuery = monthCountQuery.in("post_code", PROVINCE_GROUPS[globalProvince] || []);

  // Fetch counts concurrently
  const [mainCountRes, monthCountRes] = await Promise.all([
    mainCountQuery,
    monthCountQuery
  ]);

  const mainCount = mainCountRes.count || 0;
  const monthCount = monthCountRes.count || 0;

  // --- 2. Prepare Concurrent Data Fetch Promises ---
  const fetchPromiseFactories = [];

  const mainTotalPages = Math.ceil(mainCount / pageSize);
  for (let i = 0; i < mainTotalPages; i++) {
    fetchPromiseFactories.push(async () => {
      let q = supabase.from("parcelFlow").select(columnsToSelect);
      if (globalPlatform !== "all") q = q.ilike("file_key", globalPlatform);
      if (globalProvince !== "all") q = q.in("post_code", PROVINCE_GROUPS[globalProvince] || []);
      if (globalStartDate) q = q.gte("report_date", `${globalStartDate}T00:00:00`);
      if (globalEndDate) q = q.lte("report_date", `${globalEndDate}T23:59:59`);
      
      // MUST order by id for deterministic pagination
      q = q.order("report_date", { ascending: false }).order("id", { ascending: true }).range(i * pageSize, (i + 1) * pageSize - 1);
      const res = await q;
      if (res.error) console.error("Main Fetch Error:", res.error);
      return { type: 'main', data: res.data || [] };
    });
  }

  const monthTotalPages = Math.ceil(monthCount / pageSize);
  for (let i = 0; i < monthTotalPages; i++) {
    fetchPromiseFactories.push(async () => {
      let q = supabase.from("parcelFlow")
        .select(columnsToSelect)
        .gte("report_date", startOfMonthStr)
        .lte("report_date", endOfMonthStr)
        .or("status.ilike.%no photo%,status.ilike.%nophoto%");
      
      if (globalPlatform !== "all") q = q.ilike("file_key", globalPlatform);
      if (globalProvince !== "all") q = q.in("post_code", PROVINCE_GROUPS[globalProvince] || []);
      
      q = q.order("report_date", { ascending: false }).order("id", { ascending: true }).range(i * pageSize, (i + 1) * pageSize - 1);
      const res = await q;
      if (res.error) console.error("Month Fetch Error:", res.error);
      return { type: 'month', data: res.data || [] };
    });
  }

  // Execute fetches in batches of 5 to avoid Supabase rate limits
  const allResponses = [];
  const batchSize = 5;
  for (let i = 0; i < fetchPromiseFactories.length; i += batchSize) {
    const batch = fetchPromiseFactories.slice(i, i + batchSize);
    const results = await Promise.all(batch.map(factory => factory()));
    allResponses.push(...results);
  }

  // Aggregate raw results
  let allFiltered: any[] = [];
  let allMonthItems: any[] = [];

  for (const res of allResponses) {
    if (res.type === 'main') {
      allFiltered.push(...res.data);
    } else if (res.type === 'month') {
      allMonthItems.push(...res.data);
    }
  }

  // Format month items
  const formattedMonthItems = allMonthItems.map(row => ({
    barcode: row.barcode || "-",
    user_name: row.user_name || "-",
    name: row.name && row.name.trim() !== "-" ? row.name : "ไม่ระบุชื่อเจ้าหน้าที่",
    file_key: row.file_key || "Unknown",
    office: row.office || "ไม่ระบุ",
    report_date: row.report_date,
  }));

  // --- 3. Run JS Aggregations on the Server Side ---
  const summaryMap: Record<string, any> = {};
  const noPhotoNameSummary: Record<string, any> = {};
  const rawItems: any[] = [];

  let totalParcels = allFiltered.length;
  let totalNoPhoto = 0;

  allFiltered.forEach((row) => {
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

  const summaryData = Object.values(summaryMap).sort((a, b) => b.no_photo - a.no_photo);
  const noPhotoNameData = Object.values(noPhotoNameSummary)
    .map((item: any) => ({
      ...item,
      offices: Array.from(item.offices),
    }))
    .sort((a: any, b: any) => b.count - a.count);

  return {
    summaryData,
    noPhotoNameData,
    noPhotoRawItems: rawItems,
    monthNoPhotoItems: formattedMonthItems,
    kpiData: {
      totalParcels,
      totalNoPhoto,
      errorRate,
      mostProblematicOffice: maxOffice,
      maxOfficeCount: maxCount,
    }
  };
}
