"use server";

import { revalidatePath } from "next/cache";
import { eq, isNull, asc } from "drizzle-orm";
import { db } from "@/db/client";
import { assets } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import {
  assetInputSchema,
  normalizeAssetInput,
  type AssetInput,
} from "./schema";

export type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function listAssets(opts?: { includeArchived?: boolean }) {
  return db
    .select()
    .from(assets)
    .where(opts?.includeArchived ? undefined : isNull(assets.deletedAt))
    .orderBy(asc(assets.assetTag));
}

export async function createAsset(
  input: AssetInput,
): Promise<ActionResult<{ id: string }>> {
  const parsed = assetInputSchema.safeParse(input);
  if (!parsed.success)
    return {
      ok: false,
      error: "ข้อมูลไม่ถูกต้อง",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  const user = await requireUser();
  const values = normalizeAssetInput(parsed.data);
  try {
    const inserted = await db
      .insert(assets)
      .values(values)
      .returning({ id: assets.id });
    const row = inserted[0]!;
    await writeAudit({
      entityType: "asset",
      entityId: row.id,
      action: "CREATE",
      actor: user,
      after: values,
    });
    revalidatePath("/assets");
    return { ok: true, data: { id: row.id } };
  } catch (err) {
    const msg =
      err instanceof Error && err.message.includes("assets_tag_uidx")
        ? "เลขครุภัณฑ์นี้ถูกใช้งานแล้ว"
        : "ไม่สามารถบันทึกได้";
    return { ok: false, error: msg };
  }
}

export async function updateAsset(
  id: string,
  input: AssetInput,
): Promise<ActionResult> {
  const parsed = assetInputSchema.safeParse(input);
  if (!parsed.success)
    return {
      ok: false,
      error: "ข้อมูลไม่ถูกต้อง",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  const user = await requireUser();
  const before = (
    await db.select().from(assets).where(eq(assets.id, id)).limit(1)
  )[0];
  if (!before) return { ok: false, error: "ไม่พบรายการ" };
  const values = normalizeAssetInput(parsed.data);
  try {
    await db
      .update(assets)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(assets.id, id));
    await writeAudit({
      entityType: "asset",
      entityId: id,
      action: "UPDATE",
      actor: user,
      before,
      after: { ...before, ...values },
    });
    revalidatePath("/assets");
    return { ok: true, data: undefined };
  } catch (err) {
    const msg =
      err instanceof Error && err.message.includes("assets_tag_uidx")
        ? "เลขครุภัณฑ์นี้ถูกใช้งานแล้ว"
        : "ไม่สามารถบันทึกได้";
    return { ok: false, error: msg };
  }
}

export async function archiveAsset(id: string): Promise<ActionResult> {
  const user = await requireUser();
  const before = (
    await db.select().from(assets).where(eq(assets.id, id)).limit(1)
  )[0];
  if (!before) return { ok: false, error: "ไม่พบรายการ" };
  await db
    .update(assets)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(assets.id, id));
  await writeAudit({
    entityType: "asset",
    entityId: id,
    action: "ARCHIVE",
    actor: user,
    before,
  });
  revalidatePath("/assets");
  return { ok: true, data: undefined };
}

export async function restoreAsset(id: string): Promise<ActionResult> {
  const user = await requireUser();
  const before = (
    await db.select().from(assets).where(eq(assets.id, id)).limit(1)
  )[0];
  if (!before) return { ok: false, error: "ไม่พบรายการ" };
  await db
    .update(assets)
    .set({ deletedAt: null, updatedAt: new Date() })
    .where(eq(assets.id, id));
  await writeAudit({
    entityType: "asset",
    entityId: id,
    action: "RESTORE",
    actor: user,
    before,
  });
  revalidatePath("/assets");
  return { ok: true, data: undefined };
}
