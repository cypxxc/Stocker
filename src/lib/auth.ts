import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { ssoUsers } from "@/db/schema";

export type CurrentUser = {
  id: string;
  ssoSubject: string;
  email: string | null;
  displayName: string | null;
  role: string | null;
};

const DEV_USER = {
  ssoSubject: "dev-stub-user",
  email: "dev@local",
  displayName: "นักพัฒนา (Dev)",
  role: "admin",
};

let cachedUser: CurrentUser | null = null;

export async function getCurrentUser(): Promise<CurrentUser> {
  if (cachedUser) return cachedUser;

  const existing = await db
    .select()
    .from(ssoUsers)
    .where(eq(ssoUsers.ssoSubject, DEV_USER.ssoSubject))
    .limit(1);

  let row = existing[0];
  if (!row) {
    const inserted = await db
      .insert(ssoUsers)
      .values(DEV_USER)
      .returning();
    row = inserted[0]!;
  }

  cachedUser = {
    id: row.id,
    ssoSubject: row.ssoSubject,
    email: row.email,
    displayName: row.displayName,
    role: row.role,
  };
  return cachedUser;
}

export async function requireUser(): Promise<CurrentUser> {
  return getCurrentUser();
}
