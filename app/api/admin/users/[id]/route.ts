import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { hashPassword, getSession } from "@/lib/auth";

async function ensureAdmin() {
  const user = await getSession();
  if (!user || user.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { user };
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await ensureAdmin();
  if (auth.error) return auth.error;

  try {
    const id = parseInt(params.id);
    const body = await req.json();

    if (body.action === "toggle") {
      await sql`
        UPDATE dashboard_users
        SET is_active = NOT is_active, updated_at = NOW()
        WHERE id = ${id} AND role != 'admin'
      `;
    } else if (body.action === "reset_password" && body.password) {
      const hash = hashPassword(body.password);
      await sql`
        UPDATE dashboard_users
        SET password_hash = ${hash}, updated_at = NOW()
        WHERE id = ${id}
      `;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Update user error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await ensureAdmin();
  if (auth.error) return auth.error;

  try {
    const id = parseInt(params.id);
    await sql`DELETE FROM dashboard_users WHERE id = ${id} AND role != 'admin'`;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete user error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
