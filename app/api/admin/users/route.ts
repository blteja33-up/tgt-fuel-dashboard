import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { hashPassword, getSession } from "@/lib/auth";

async function ensureAdmin() {
  const user = await getSession();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (user.role !== "admin")
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  return { user };
}

export async function GET() {
  const { error } = await ensureAdmin();
  if (error) return error;

  const users = await sql`
    SELECT u.id, u.username, u.display_name, u.role, u.is_active, u.created_at,
           (SELECT COUNT(*)::int FROM user_terminal_assignments WHERE user_id = u.id) as terminal_count
    FROM dashboard_users u
    ORDER BY u.role DESC, u.username
  `;
  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  const { error } = await ensureAdmin();
  if (error) return error;

  try {
    const { username, password, display_name, role } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    const userRole = role === "admin" ? "admin" : "client";
    const hash = hashPassword(password);

    await sql`
      INSERT INTO dashboard_users (username, password_hash, display_name, role)
      VALUES (${username}, ${hash}, ${display_name || null}, ${userRole})
      ON CONFLICT (username) DO NOTHING
    `;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Create user error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
