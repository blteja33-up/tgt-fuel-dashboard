"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(data.role === "admin" ? "/admin" : "/dashboard");
        router.refresh();
      } else {
        router.push("/login?error=1");
      }
    } catch {
      router.push("/login?error=1");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-5">
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Username
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
          className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white text-[15px] outline-none focus:border-[#e94560] transition-colors"
        />
      </div>
      <div className="mb-7">
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white text-[15px] outline-none focus:border-[#e94560] transition-colors"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 bg-gradient-to-br from-[#e94560] to-[#c62a47] text-white border-none rounded-xl text-[15px] font-bold tracking-wide shadow-[0_4px_20px_rgba(233,69,96,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_28px_rgba(233,69,96,0.4)] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
