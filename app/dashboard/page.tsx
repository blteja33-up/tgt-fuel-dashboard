import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getPricesForUser } from "@/lib/pricing";
import Header from "@/components/Header";
import DashboardClient from "@/components/DashboardClient";

// Force dynamic rendering — always fetch fresh data from Neon
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  const groups = await getPricesForUser(user.id, user.role === "admin");
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/New_York",
  });

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <Header
        title="Fuel Cost Dashboard"
        subtitle={today}
        displayName={user.display_name || user.username}
        role={user.role}
      />
      <DashboardClient groups={groups} />
      <footer className="bg-[#1a1a2e] py-5 text-center mt-10">
        <div className="text-xs font-extrabold text-white tracking-[2px]">
          TRUE GRADE TRANSPORT
        </div>
        <div className="text-[11px] text-slate-500 mt-1">
          All prices include $0.85/gal freight
        </div>
      </footer>
    </div>
  );
}
