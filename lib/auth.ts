import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { sql } from "./db";

export const SESSION_COOKIE = "tgt_session";
export const SESSION_DURATION_HOURS = 8;

export type SessionUser = {
  id: number;
  username: string;
  display_name: string | null;
  role: "admin" | "client";
};

export function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export async function validateSession(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null;
  try {
    const rows = await sql<SessionUser[]>`
      SELECT u.id, u.username, u.display_name, u.role
      FROM dashboard_sessions s
      JOIN dashboard_users u ON s.user_id = u.id
      WHERE s.token = ${token}
        AND s.expires_at > NOW()
        AND u.is_active = true
      LIMIT 1
    `;
    return rows[0] || null;
  } catch (err) {
    console.error("validateSession error:", err);
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return validateSession(token);
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role !== "admin") throw new Error("FORBIDDEN");
  return user;
}

export async function createSession(userId: number): Promise<string> {
  const token = generateToken();
  await sql`DELETE FROM dashboard_sessions WHERE expires_at < NOW()`;
  await sql`
    INSERT INTO dashboard_sessions (user_id, token, expires_at)
    VALUES (${userId}, ${token}, NOW() + INTERVAL '${sql.unsafe(`${SESSION_DURATION_HOURS} hours`)}')
  `;
  return token;
}

export async function destroySession(token: string): Promise<void> {
  await sql`DELETE FROM dashboard_sessions WHERE token = ${token}`;
}
