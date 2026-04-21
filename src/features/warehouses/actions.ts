"use server";

import { revalidatePath } from "next/cache";
import { eq, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { warehouses } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import {
  normalizeWarehouseInput,
  warehouseInputSchema,
  type WarehouseInput,
} from "./schema";

export type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function listWarehouses(opts?: { includeArchived?: boolean }) {
  const rows = opts?.includeArchived
    ? await db.select().from(warehouses).orderBy(warehouses.code)
    : await db
        .select()
        .from(warehouses)
        .where(isNull(warehouses.deletedAt))
        .orderBy(warehouses.code);
  return rows;
}

export async function createWarehouse(
  input: WarehouseInput,
): Promise<ActionResult<{ id: string }>> {
  const parsed = warehouseInputSchema.safeParse(input);
  if (!parsed.success)
    return {
      ok: false,
      error: "ข้อมูลไม่ถูกต้อง",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  const user = await requireUser();
  const values = normalizeWarehouseInput(parsed.data);
  try {
    const inserted = await db
      .insert(warehouses)
      .values(values)
      .returning({ id: warehouses.id });
    const row = inserted[0]!;
    await writeAudit({
      entityType: "warehouse",
      entityId: row.id,
      action: "CREATE",
      actor: user,
      after: values,
    });
    revalidatePath("/warehouses");
    return { ok: true, data: { id: row.id } };
  } catch (err) {
    const msg =
      err instanceof Error && err.message.includes("warehouses_code_uidx")
        ? "รหัสนี้ถูกใช้งานแล้ว"
        : "ไม่สามารถบันทึกได้";
    return { ok: false, error: msg };
  }
}

export async function updateWarehouse(
  id: string,
  input: WarehouseInput,
): Promise<ActionResult> {
  const parsed = warehouseInputSchema.safeParse(input);
  if (!parsed.success)
    return {
      ok: false,
      error: "ข้อมูลไม่ถูกต้อง",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  const user = await requireUser();
  const before = (
    await db.select().from(warehouses).where(eq(warehouses.id, id)).limit(1)
  )[0];
  if (!before) return { ok: false, error: "ไม่พบรายการ" };
  const values = normalizeWarehouseInput(parsed.data);
  try {
    await db
      .update(warehouses)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(warehouses.id, id));
    await writeAudit({
      entityType: "warehouse",
      entityId: id,
      action: "UPDATE",
      actor: user,
      before,
      after: { ...before, ...values },
    });
    revalidatePath("/warehouses");
    return { ok: true, data: undefined };
  } catch (err) {
    const msg =
      err instanceof Error && err.message.includes("warehouses_code_uidx")
        ? "รหัสนี้ถูกใช้งานแล้ว"
        : "ไม่สามารถบันทึกได้";
    return { ok: false, error: msg };
  }
}

export async function archiveWarehouse(id: string): Promise<ActionResult> {
  const user = await requireUser();
  const before = (
    await db.select().from(warehouses).where(eq(warehouses.id, id)).limit(1)
  )[0];
  if (!before) return { ok: false, error: "ไม่พบรายการ" };
  await db
    .update(warehouses)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(warehouses.id, id));
  await writeAudit({
    entityType: "warehouse",
    entityId: id,
    action: "ARCHIVE",
    actor: user,
    before,
  });
  revalidatePath("/warehouses");
  return { ok: true, data: undefined };
}

export async function restoreWarehouse(id: string): Promise<ActionResult> {
  const user = await requireUser();
  const before = (
    await db.select().from(warehouses).where(eq(warehouses.id, id)).limit(1)
  )[0];
  if (!before) return { ok: false, error: "ไม่พบรายการ" };
  await db
    .update(warehouses)
    .set({ deletedAt: null, updatedAt: new Date() })
    .where(eq(warehouses.id, id));
  await writeAudit({
    entityType: "warehouse",
    entityId: id,
    action: "RESTORE",
    actor: user,
    before,
  });
  revalidatePath("/warehouses");
  return { ok: true, data: undefined };
}
