import { supabase } from "@/lib/supabase";
import UploadModal from "@/components/UploadModal";
import DashboardTabs from "@/components/DashboardTabs";
import AuthGuard from "@/components/AuthGuard";
import LogoutButton from "@/components/LogoutButton";

export const revalidate = 0; // Disable cache for real-time data

export default async function Home() {
  // Check if env variables are set
  const isSetup =
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "your_supabase_url_here" &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== undefined;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#0c0e14]">
        {/* Top Navigation Bar */}
        <nav className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-[#161a24]/80 border-b border-gray-200/60 dark:border-gray-800/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Left: Logo */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
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
                <div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
                    ParcelFlow @ Reg6
                  </h1>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium -mt-0.5">
                    Developed by Megamind
                  </p>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2">
                <UploadModal />
                <LogoutButton />
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Setup Warning */}
          {!isSetup && (
            <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 px-5 py-4 rounded-2xl text-sm font-medium border border-amber-200 dark:border-amber-800/50 flex items-center gap-3 shadow-sm">
              <svg
                className="w-5 h-5 shrink-0"
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

          <DashboardTabs />
        </main>
      </div>
    </AuthGuard>
  );
}
