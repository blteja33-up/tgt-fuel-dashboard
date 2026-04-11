import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getAllLocations } from "@/lib/pricing";

async function ensureAdmin() {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { user };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await ensureAdmin();
  if (auth.error) return auth.error;

  const userId = parseInt(params.id);

  const [user] = await sql<{ username: string; display_name: string | null }[]>`
    SELECT username, display_name FROM dashboard_users WHERE id = ${userId}
  `;

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const allLocations = await getAllLocations();
  const assignedRows = await sql<{ location: string }[]>`
    SELECT location FROM user_terminal_assignments WHERE user_id = ${userId}
  `;
  const assigned = assignedRows.map((r) => r.location);

  return NextResponse.json({
    user,
    all_locations: allLocations,
    assigned,
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await ensureAdmin();
  if (auth.error) return auth.error;

  try {
    const userId = parseInt(params.id);
    const { terminals } = await req.json();
    const list: string[] = Array.isArray(terminals) ? terminals : [];

    await sql.begin(async (tx) => {
      await tx`DELETE FROM user_terminal_assignments WHERE user_id = ${userId}`;
      if (list.length > 0) {
        const values = list.map((loc) => ({ user_id: userId, location: loc }));
        await tx`
          INSERT INTO user_terminal_assignments ${tx(values, "user_id", "location")}
          ON CONFLICT DO NOTHING
        `;
      }
    });

    return NextResponse.json({ success: true, count: list.length });
  } catch (err) {
    console.error("Save terminals error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
