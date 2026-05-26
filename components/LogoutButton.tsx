"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };
  return (
    <button onClick={handleLogout} className="flex items-center justify-center w-full gap-2 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-xl transition-all" title="ออกจากระบบ">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
      <span className="hidden sm:inline">ออกจากระบบ</span>
    </button>
  );
}
