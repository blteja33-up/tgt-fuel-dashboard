import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import Header from "@/components/Header";
import AdminUsersTable from "@/components/AdminUsersTable";

export const dynamic = "force-dynamic";

type UserRow = {
  id: number;
  username: string;
  display_name: string | null;
  role: string;
  is_active: boolean;
  terminal_count: number;
};

export default async function AdminPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");

  const users = await sql<UserRow[]>`
    SELECT u.id, u.username, u.display_name, u.role, u.is_active,
           (SELECT COUNT(*)::int FROM user_terminal_assignments WHERE user_id = u.id) as terminal_count
    FROM dashboard_users u
    ORDER BY u.role DESC, u.username
  `;

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <Header
        title="Admin Panel"
        displayName={user.display_name || user.username}
        role="admin"
      />
      <div className="max-w-6xl mx-auto px-6 py-6">
        <AdminUsersTable initialUsers={users} />
      </div>
      <footer className="bg-[#1a1a2e] py-5 text-center mt-10">
        <div className="text-xs font-extrabold text-white tracking-[2px]">
          TRUE GRADE TRANSPORT
        </div>
        <div className="text-[11px] text-slate-500 mt-1">Admin Panel</div>
      </footer>
    </div>
  );
}
