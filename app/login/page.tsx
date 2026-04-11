import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import LoginForm from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; loggedout?: string };
}) {
  const user = await getSession();
  if (user) {
    redirect(user.role === "admin" ? "/admin" : "/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-gradient-to-br from-[#0f0f1a] via-[#1a1a2e] to-[#0f3460]">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-[70px] h-[70px] bg-gradient-to-br from-[#e94560] to-[#c62a47] rounded-2xl items-center justify-center mb-4 shadow-[0_8px_32px_rgba(233,69,96,0.3)]">
            <span className="text-3xl font-black text-white">TG</span>
          </div>
          <div className="text-[11px] tracking-[4px] text-[#e94560] font-extrabold uppercase">
            True Grade Transport
          </div>
          <div className="text-2xl font-bold text-white mt-2">Fuel Cost Portal</div>
          <div className="text-sm text-slate-400 mt-1">
            Sign in to view your pricing dashboard
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
          {searchParams.error && (
            <div className="bg-red-100 border border-red-300 text-red-900 px-4 py-3 rounded-lg mb-5 text-sm text-center">
              Invalid username or password. Please try again.
            </div>
          )}
          {searchParams.loggedout && (
            <div className="bg-green-100 border border-green-300 text-green-900 px-4 py-3 rounded-lg mb-5 text-sm text-center">
              You have been logged out successfully.
            </div>
          )}
          <LoginForm />
        </div>

        <div className="text-center mt-6 text-[11px] text-slate-600">
          Powered by True Grade Transport © {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
