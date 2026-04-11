"use client";

import { useState, useMemo } from "react";
import { Search, Fuel, Building2, Truck } from "lucide-react";
import type { GroupedPrices } from "@/lib/pricing";

const cleanGrade = (name: string) =>
  name.replace(/_/g, " ").toUpperCase().replace(/GRADE\s+/i, "");
const formatPrice = (v: number) => "$" + v.toFixed(4);

export default function DashboardClient({ groups }: { groups: GroupedPrices[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return groups;
    const term = search.toLowerCase();
    return groups
      .map((g) => ({
        ...g,
        locations: g.locations.filter((l) => l.location.toLowerCase().includes(term)),
      }))
      .filter((g) => g.locations.length > 0);
  }, [groups, search]);

  const totalTerminals = filtered.reduce((sum, g) => sum + g.locations.length, 0);
  const totalSuppliers = filtered.length;

  return (
    <div className="max-w-6xl mx-auto px-6 pt-5 pb-10">
      {/* Freight Notice */}
      <div className="bg-yellow-50 border-l-4 border-[#e94560] rounded-md px-5 py-3.5 text-[13px] text-yellow-900 mb-4">
        <strong className="text-[#e94560]">FREIGHT INCLUDED:</strong> All prices below include{" "}
        <strong>$0.85/gal</strong> freight. These are the all-included delivered costs per gallon
        to True Grade Transport&apos;s end consumers.
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <input
          type="text"
          placeholder="Search locations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#e94560] focus:ring-2 focus:ring-[#e94560]/10 bg-white"
        />
      </div>

      {/* Stats */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <StatCard icon={<Building2 size={16} />} label="Terminals" value={String(totalTerminals)} />
        <StatCard icon={<Truck size={16} />} label="Suppliers" value={String(totalSuppliers)} />
        <StatCard
          icon={<Fuel size={16} />}
          label="Freight"
          value="+$0.85"
          valueColor="text-[#e94560]"
        />
      </div>

      {/* Supplier sections */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
          <Fuel size={48} className="mx-auto text-slate-300 mb-4" />
          <div className="text-lg font-bold text-slate-800 mb-2">No Terminals Available</div>
          <div className="text-sm text-slate-500">
            {search
              ? "No locations match your search."
              : "Please contact your administrator to get terminal access."}
          </div>
        </div>
      ) : (
        filtered.map((group) => (
          <div
            key={group.supplier}
            className="mb-5 border border-slate-200 rounded-xl overflow-hidden bg-white"
          >
            <div
              className="px-5 py-3.5 flex justify-between items-center"
              style={{
                background: `linear-gradient(90deg, ${group.color[0]}, ${group.color[1]})`,
              }}
            >
              <div className="text-white font-extrabold text-[15px] tracking-wider uppercase">
                {group.supplier}
              </div>
              <div className="text-slate-300 text-xs font-mono bg-black/25 px-3 py-1 rounded">
                {group.dateLabel}
              </div>
            </div>
            {group.locations.map((row, idx) => (
              <div
                key={row.location + idx}
                className={`px-5 py-3.5 border-b border-slate-100 last:border-b-0 flex justify-between items-center flex-wrap gap-3 ${
                  idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                }`}
              >
                <div className="font-bold text-slate-800 text-sm min-w-[180px]">
                  {row.location}
                </div>
                <div className="flex flex-wrap gap-1.5 justify-end">
                  {row.prices.map((p) => (
                    <div
                      key={p.grade}
                      className="bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-center min-w-[72px]"
                    >
                      <div className="text-[9px] text-slate-500 font-bold uppercase mb-0.5">
                        {cleanGrade(p.grade)}
                      </div>
                      <div className="text-[15px] text-green-700 font-extrabold">
                        {formatPrice(p.allInPrice)}
                      </div>
                      <div className="text-[9px] text-slate-400">
                        (base: {formatPrice(p.basePrice)})
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  valueColor = "text-[#1a1a2e]",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="bg-white px-5 py-3 rounded-lg border border-slate-200 flex items-center gap-3">
      <div className="text-slate-400">{icon}</div>
      <div>
        <div className="text-[11px] text-slate-500 font-bold uppercase leading-none">{label}</div>
        <div className={`text-xl font-extrabold leading-tight mt-0.5 ${valueColor}`}>{value}</div>
      </div>
    </div>
  );
}
