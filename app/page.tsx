import { supabase } from "@/lib/supabase";
import DashboardClient from "@/components/DashboardClient";
import AuthGuard from "@/components/AuthGuard";

export const revalidate = 0; // Disable cache for real-time data

export default async function Home() {
  // Check if env variables are set
  const isSetup =
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "your_supabase_url_here" &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== undefined;

  return (
    <AuthGuard>
      <style dangerouslySetInnerHTML={{__html: `
        body:has(.modal-active) aside {
          z-index: 0 !important;
        }
      `}} />
      <div className="flex h-screen bg-[#f0f2f5] dark:bg-[#0c0e14] overflow-hidden">
        <DashboardClient isSetup={isSetup} />
      </div>
    </AuthGuard>
  );
}
