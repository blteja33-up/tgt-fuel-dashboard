import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { getAllLocations } from "@/lib/pricing";
import Header from "@/components/Header";
import TerminalAssignForm from "@/components/TerminalAssignForm";

export const dynamic = "force-dynamic";

export default async function TerminalsPage({ params }: { params: { id: string } }) {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");

  const userId = parseInt(params.id);

  const [targetUser] = await sql<{ username: string; display_name: string | null }[]>`
    SELECT username, display_name FROM dashboard_users WHERE id = ${userId}
  `;

  if (!targetUser) redirect("/admin");

  const allLocations = await getAllLocations();
  const assignedRows = await sql<{ location: string }[]>`
    SELECT location FROM user_terminal_assignments WHERE user_id = ${userId}
  `;
  const assigned = assignedRows.map((r) => r.location);

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <Header
        title="Assign Terminals"
        displayName={user.display_name || user.username}
        role="admin"
      />
      <div className="max-w-2xl mx-auto px-6 py-6">
        <TerminalAssignForm
          userId={userId}
          userName={targetUser.display_name || targetUser.username}
          allLocations={allLocations}
          assigned={assigned}
        />
      </div>
    </div>
  );
}
