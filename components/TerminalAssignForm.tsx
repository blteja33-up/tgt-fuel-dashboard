"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, X, Save } from "lucide-react";

type Props = {
  userId: number;
  userName: string;
  allLocations: string[];
  assigned: string[];
};

export default function TerminalAssignForm({ userId, userName, allLocations, assigned }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set(assigned));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function toggle(loc: string) {
    const next = new Set(selected);
    if (next.has(loc)) next.delete(loc);
    else next.add(loc);
    setSelected(next);
  }

  function selectAll() {
    setSelected(new Set(allLocations));
  }

  function clearAll() {
    setSelected(new Set());
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const res = await fetch(`/api/admin/users/${userId}/terminals`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ terminals: Array.from(selected) }),
    });
    setSaving(false);

    if (res.ok) {
      setMessage("Saved successfully");
      router.refresh();
      setTimeout(() => router.push("/admin"), 800);
    } else {
      setMessage("Failed to save");
    }
  }

  return (
    <>
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-[#e94560] no-underline font-semibold text-sm mb-4"
      >
        <ArrowLeft size={14} /> Back to Admin
      </Link>

      {message && (
        <div
          className={`px-4 py-3 rounded-lg mb-4 text-sm ${
            message.includes("successfully")
              ? "bg-green-100 text-green-800 border border-green-300"
              : "bg-red-100 text-red-800 border border-red-300"
          }`}
        >
          {message}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-1">Terminals for {userName}</h2>
          <p className="text-[13px] text-slate-500 m-0">
            Select which terminals this client can see. ({selected.size} of {allLocations.length}{" "}
            selected)
          </p>
        </div>

        <form onSubmit={handleSave}>
          <div className="px-5 py-3 border-b border-slate-100 flex gap-2">
            <button
              type="button"
              onClick={selectAll}
              className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 border border-sky-200 px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-sky-100"
            >
              <Check size={12} /> Select All
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-red-100"
            >
              <X size={12} /> Clear All
            </button>
          </div>

          <div className="max-h-[500px] overflow-y-auto">
            {allLocations.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-slate-500">
                No terminals available. The sync workflow may not have run yet.
              </div>
            ) : (
              allLocations.map((loc) => (
                <label
                  key={loc}
                  className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 last:border-b-0 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(loc)}
                    onChange={() => toggle(loc)}
                    className="w-[18px] h-[18px] accent-[#e94560] cursor-pointer"
                  />
                  <span className="text-sm font-medium text-slate-800">{loc}</span>
                </label>
              ))
            )}
          </div>

          <div className="px-6 py-4 border-t border-slate-200 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 bg-gradient-to-br from-[#e94560] to-[#c62a47] text-white rounded-lg px-6 py-3 text-sm font-bold hover:-translate-y-0.5 transition-transform shadow-md disabled:opacity-60"
            >
              <Save size={14} /> {saving ? "Saving..." : "Save Assignments"}
            </button>
            <Link
              href="/admin"
              className="px-6 py-3 border border-slate-200 rounded-lg text-slate-600 text-sm no-underline flex items-center hover:bg-slate-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
