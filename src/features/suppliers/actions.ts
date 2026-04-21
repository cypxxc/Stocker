"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { suppliers } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import {
  normalizeSupplierInput,
  supplierInputSchema,
  type SupplierInput,
} from "./schema";

export type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function listSuppliers(opts?: {
  includeArchived?: boolean;
  search?: string;
}) {
  const conditions = [] as ReturnType<typeof eq>[];
  if (!opts?.includeArchived) {
    conditions.push(isNull(suppliers.deletedAt) as never);
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const rows = await db
    .select()
    .from(suppliers)
    .where(where)
    .orderBy(suppliers.code);

  const term = opts?.search?.trim().toLowerCase();
  if (!term) return rows;
  return rows.filter(
    (r) =>
      r.code.toLowerCase().includes(term) ||
      r.name.toLowerCase().includes(term) ||
      (r.taxId ?? "").toLowerCase().includes(term),
  );
}

export async function createSupplier(
  input: SupplierInput,
): Promise<ActionResult<{ id: string }>> {
  const parsed = supplierInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "ข้อมูลไม่ถูกต้อง",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const user = await requireUser();
  const values = normalizeSupplierInput(parsed.data);
  try {
    const inserted = await db
      .insert(suppliers)
      .values(values)
      .returning({ id: suppliers.id });
    const row = inserted[0]!;
    await writeAudit({
      entityType: "supplier",
      entityId: row.id,
      action: "CREATE",
      actor: user,
      after: values,
    });
    revalidatePath("/suppliers");
    return { ok: true, data: { id: row.id } };
  } catch (err) {
    const msg =
      err instanceof Error && err.message.includes("suppliers_code_uidx")
        ? "รหัสนี้ถูกใช้งานแล้ว"
        : "ไม่สามารถบันทึกได้";
    return { ok: false, error: msg };
  }
}

export async function updateSupplier(
  id: string,
  input: SupplierInput,
): Promise<ActionResult> {
  const parsed = supplierInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "ข้อมูลไม่ถูกต้อง",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const user = await requireUser();
  const before = (
    await db.select().from(suppliers).where(eq(suppliers.id, id)).limit(1)
  )[0];
  if (!before) return { ok: false, error: "ไม่พบรายการ" };

  const values = normalizeSupplierInput(parsed.data);
  try {
    await db
      .update(suppliers)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(suppliers.id, id));
    await writeAudit({
      entityType: "supplier",
      entityId: id,
      action: "UPDATE",
      actor: user,
      before,
      after: { ...before, ...values },
    });
    revalidatePath("/suppliers");
    return { ok: true, data: undefined };
  } catch (err) {
    const msg =
      err instanceof Error && err.message.includes("suppliers_code_uidx")
        ? "รหัสนี้ถูกใช้งานแล้ว"
        : "ไม่สามารถบันทึกได้";
    return { ok: false, error: msg };
  }
}

export async function archiveSupplier(id: string): Promise<ActionResult> {
  const user = await requireUser();
  const before = (
    await db.select().from(suppliers).where(eq(suppliers.id, id)).limit(1)
  )[0];
  if (!before) return { ok: false, error: "ไม่พบรายการ" };
  if (before.deletedAt)
    return { ok: false, error: "รายการถูกเก็บเข้าคลังแล้ว" };

  await db
    .update(suppliers)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(suppliers.id, id));

  await writeAudit({
    entityType: "supplier",
    entityId: id,
    action: "ARCHIVE",
    actor: user,
    before,
  });
  revalidatePath("/suppliers");
  return { ok: true, data: undefined };
}

export async function restoreSupplier(id: string): Promise<ActionResult> {
  const user = await requireUser();
  const before = (
    await db.select().from(suppliers).where(eq(suppliers.id, id)).limit(1)
  )[0];
  if (!before) return { ok: false, error: "ไม่พบรายการ" };

  await db
    .update(suppliers)
    .set({ deletedAt: null, updatedAt: new Date() })
    .where(eq(suppliers.id, id));

  await writeAudit({
    entityType: "supplier",
    entityId: id,
    action: "RESTORE",
    actor: user,
    before,
  });
  revalidatePath("/suppliers");
  return { ok: true, data: undefined };
}
