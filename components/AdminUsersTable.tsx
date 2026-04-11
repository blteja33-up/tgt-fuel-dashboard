"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Users, Settings2, Power, Trash2 } from "lucide-react";

type UserRow = {
  id: number;
  username: string;
  display_name: string | null;
  role: string;
  is_active: boolean;
  terminal_count: number;
};

export default function AdminUsersTable({ initialUsers }: { initialUsers: UserRow[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setCreating(true);

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: form.get("username"),
        password: form.get("password"),
        display_name: form.get("display_name"),
        role: form.get("role"),
      }),
    });
    setCreating(false);

    if (res.ok) {
      (e.target as HTMLFormElement).reset();
      setSuccess("User created successfully");
      router.refresh();
      setTimeout(() => setSuccess(""), 3000);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to create user");
    }
  }

  async function handleToggle(id: number) {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle" }),
    });
    if (res.ok) router.refresh();
  }

  async function handleDelete(id: number, username: string) {
    if (!confirm(`Delete user "${username}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  return (
    <>
      {success && (
        <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-lg mb-4 text-sm">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Create User Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus size={18} className="text-[#e94560]" />
          <h3 className="text-base font-bold text-slate-800">Create New User</h3>
        </div>
        <form onSubmit={handleCreate} className="flex gap-3 flex-wrap items-end">
          <Field label="Username" name="username" type="text" required />
          <Field label="Password" name="password" type="password" required />
          <Field label="Display Name" name="display_name" type="text" />
          <div className="min-w-[110px]">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Role
            </label>
            <select
              name="role"
              defaultValue="client"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-md text-sm outline-none focus:border-[#e94560] bg-white"
            >
              <option value="client">Client</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={creating}
            className="bg-gradient-to-br from-[#e94560] to-[#c62a47] text-white rounded-lg px-6 py-2.5 text-sm font-bold hover:-translate-y-0.5 transition-transform shadow-md whitespace-nowrap disabled:opacity-60"
          >
            {creating ? "Creating..." : "Create User"}
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-2">
          <Users size={18} className="text-[#e94560]" />
          <h3 className="text-base font-bold text-slate-800">Users ({initialUsers.length})</h3>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b-2 border-slate-200">
              <Th>Username</Th>
              <Th>Display Name</Th>
              <Th>Role</Th>
              <Th>Status</Th>
              <Th className="text-center">Terminals</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {initialUsers.map((u) => {
              const isAdminRow = u.role === "admin";
              return (
                <tr key={u.id} className="border-b border-slate-100 last:border-b-0">
                  <td className="px-4 py-3.5 font-semibold text-slate-800">{u.username}</td>
                  <td className="px-4 py-3.5 text-slate-600">{u.display_name || "—"}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        isAdminRow ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`font-semibold text-[13px] ${
                        u.is_active ? "text-green-700" : "text-red-600"
                      }`}
                    >
                      {u.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="bg-slate-100 px-3 py-1 rounded-md font-bold text-slate-800 text-sm">
                      {u.terminal_count}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {isAdminRow ? (
                      <span className="text-xs text-slate-400">Protected</span>
                    ) : (
                      <div className="inline-flex gap-2">
                        <Link
                          href={`/admin/users/${u.id}/terminals`}
                          className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-sky-100 no-underline"
                        >
                          <Settings2 size={12} /> Terminals
                        </Link>
                        <button
                          onClick={() => handleToggle(u.id)}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold ${
                            u.is_active
                              ? "bg-red-50 text-red-700 hover:bg-red-100"
                              : "bg-green-50 text-green-700 hover:bg-green-100"
                          }`}
                        >
                          <Power size={12} /> {u.is_active ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleDelete(u.id, u.username)}
                          className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-red-100"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Field({
  label,
  name,
  type,
  required = false,
}: {
  label: string;
  name: string;
  type: string;
  required?: boolean;
}) {
  return (
    <div className="flex-1 min-w-[140px]">
      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        className="w-full px-3 py-2.5 border border-slate-200 rounded-md text-sm outline-none focus:border-[#e94560] bg-white"
      />
    </div>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={`px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider ${className}`}
    >
      {children}
    </th>
  );
}
