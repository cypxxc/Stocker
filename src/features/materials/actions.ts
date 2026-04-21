"use server";

import { revalidatePath } from "next/cache";
import { eq, isNull, asc } from "drizzle-orm";
import { db } from "@/db/client";
import { materials } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import {
  materialInputSchema,
  normalizeMaterialInput,
  type MaterialInput,
} from "./schema";

export type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function listMaterials(opts?: { includeArchived?: boolean }) {
  return db
    .select()
    .from(materials)
    .where(opts?.includeArchived ? undefined : isNull(materials.deletedAt))
    .orderBy(asc(materials.code));
}

export async function createMaterial(
  input: MaterialInput,
): Promise<ActionResult<{ id: string }>> {
  const parsed = materialInputSchema.safeParse(input);
  if (!parsed.success)
    return {
      ok: false,
      error: "ข้อมูลไม่ถูกต้อง",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  const user = await requireUser();
  const values = normalizeMaterialInput(parsed.data);
  try {
    const inserted = await db
      .insert(materials)
      .values(values)
      .returning({ id: materials.id });
    const row = inserted[0]!;
    await writeAudit({
      entityType: "material",
      entityId: row.id,
      action: "CREATE",
      actor: user,
      after: values,
    });
    revalidatePath("/materials");
    return { ok: true, data: { id: row.id } };
  } catch (err) {
    const msg =
      err instanceof Error && err.message.includes("materials_code_uidx")
        ? "รหัสนี้ถูกใช้งานแล้ว"
        : "ไม่สามารถบันทึกได้";
    return { ok: false, error: msg };
  }
}

export async function updateMaterial(
  id: string,
  input: MaterialInput,
): Promise<ActionResult> {
  const parsed = materialInputSchema.safeParse(input);
  if (!parsed.success)
    return {
      ok: false,
      error: "ข้อมูลไม่ถูกต้อง",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  const user = await requireUser();
  const before = (
    await db.select().from(materials).where(eq(materials.id, id)).limit(1)
  )[0];
  if (!before) return { ok: false, error: "ไม่พบรายการ" };
  const values = normalizeMaterialInput(parsed.data);
  try {
    await db
      .update(materials)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(materials.id, id));
    await writeAudit({
      entityType: "material",
      entityId: id,
      action: "UPDATE",
      actor: user,
      before,
      after: { ...before, ...values },
    });
    revalidatePath("/materials");
    return { ok: true, data: undefined };
  } catch (err) {
    const msg =
      err instanceof Error && err.message.includes("materials_code_uidx")
        ? "รหัสนี้ถูกใช้งานแล้ว"
        : "ไม่สามารถบันทึกได้";
    return { ok: false, error: msg };
  }
}

export async function archiveMaterial(id: string): Promise<ActionResult> {
  const user = await requireUser();
  const before = (
    await db.select().from(materials).where(eq(materials.id, id)).limit(1)
  )[0];
  if (!before) return { ok: false, error: "ไม่พบรายการ" };
  await db
    .update(materials)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(materials.id, id));
  await writeAudit({
    entityType: "material",
    entityId: id,
    action: "ARCHIVE",
    actor: user,
    before,
  });
  revalidatePath("/materials");
  return { ok: true, data: undefined };
}

export async function restoreMaterial(id: string): Promise<ActionResult> {
  const user = await requireUser();
  const before = (
    await db.select().from(materials).where(eq(materials.id, id)).limit(1)
  )[0];
  if (!before) return { ok: false, error: "ไม่พบรายการ" };
  await db
    .update(materials)
    .set({ deletedAt: null, updatedAt: new Date() })
    .where(eq(materials.id, id));
  await writeAudit({
    entityType: "material",
    entityId: id,
    action: "RESTORE",
    actor: user,
    before,
  });
  revalidatePath("/materials");
  return { ok: true, data: undefined };
}
