"use client";

import { useRouter } from "next/navigation";
import { LogOut, Shield, LayoutDashboard } from "lucide-react";
import Link from "next/link";

type HeaderProps = {
  title: string;
  subtitle?: string;
  displayName: string;
  role: "admin" | "client";
};

export default function Header({ title, subtitle, displayName, role }: HeaderProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login?loggedout=1");
    router.refresh();
  }

  return (
    <div className="bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]">
      <div className="max-w-6xl mx-auto px-6 py-5 flex justify-between items-center flex-wrap gap-4">
        <div>
          <div className="text-[11px] tracking-[4px] text-[#e94560] font-extrabold uppercase">
            True Grade Transport
          </div>
          <div className="text-[22px] font-bold text-white mt-1">{title}</div>
          {subtitle && <div className="text-xs text-slate-400 mt-0.5">{subtitle}</div>}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right mr-2">
            <div className="text-[13px] text-slate-400">Welcome,</div>
            <div className="text-[15px] font-bold text-white">{displayName}</div>
          </div>
          {role === "admin" && (
            <>
              <Link
                href="/admin"
                className="flex items-center gap-1.5 bg-white/10 text-slate-300 px-4 py-2 rounded-lg text-[13px] no-underline hover:bg-white/20 transition-colors"
              >
                <Shield size={14} /> Admin
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 bg-white/10 text-slate-300 px-4 py-2 rounded-lg text-[13px] no-underline hover:bg-white/20 transition-colors"
              >
                <LayoutDashboard size={14} /> Dashboard
              </Link>
            </>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 bg-[#e94560]/15 border border-[#e94560]/30 text-[#e94560] px-4 py-2 rounded-lg text-[13px] font-semibold hover:bg-[#e94560]/25 transition-colors"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>
    </div>
  );
}
