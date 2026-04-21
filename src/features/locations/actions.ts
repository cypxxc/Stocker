"use server";

import { revalidatePath } from "next/cache";
import { eq, isNull, asc } from "drizzle-orm";
import { db } from "@/db/client";
import { locations, warehouses } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import {
  locationInputSchema,
  normalizeLocationInput,
  type LocationInput,
} from "./schema";

export type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function listLocationsWithWarehouse(opts?: {
  includeArchived?: boolean;
}) {
  const rows = await db
    .select({
      id: locations.id,
      warehouseId: locations.warehouseId,
      code: locations.code,
      name: locations.name,
      note: locations.note,
      deletedAt: locations.deletedAt,
      warehouseCode: warehouses.code,
      warehouseName: warehouses.name,
    })
    .from(locations)
    .innerJoin(warehouses, eq(locations.warehouseId, warehouses.id))
    .where(opts?.includeArchived ? undefined : isNull(locations.deletedAt))
    .orderBy(asc(warehouses.code), asc(locations.code));
  return rows;
}

export async function createLocation(
  input: LocationInput,
): Promise<ActionResult<{ id: string }>> {
  const parsed = locationInputSchema.safeParse(input);
  if (!parsed.success)
    return {
      ok: false,
      error: "ข้อมูลไม่ถูกต้อง",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  const user = await requireUser();
  const values = normalizeLocationInput(parsed.data);
  try {
    const inserted = await db
      .insert(locations)
      .values(values)
      .returning({ id: locations.id });
    const row = inserted[0]!;
    await writeAudit({
      entityType: "location",
      entityId: row.id,
      action: "CREATE",
      actor: user,
      after: values,
    });
    revalidatePath("/locations");
    return { ok: true, data: { id: row.id } };
  } catch (err) {
    const msg =
      err instanceof Error &&
      err.message.includes("locations_warehouse_code_uidx")
        ? "รหัสนี้ถูกใช้ในคลังนี้แล้ว"
        : "ไม่สามารถบันทึกได้";
    return { ok: false, error: msg };
  }
}

export async function updateLocation(
  id: string,
  input: LocationInput,
): Promise<ActionResult> {
  const parsed = locationInputSchema.safeParse(input);
  if (!parsed.success)
    return {
      ok: false,
      error: "ข้อมูลไม่ถูกต้อง",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  const user = await requireUser();
  const before = (
    await db.select().from(locations).where(eq(locations.id, id)).limit(1)
  )[0];
  if (!before) return { ok: false, error: "ไม่พบรายการ" };
  const values = normalizeLocationInput(parsed.data);
  try {
    await db
      .update(locations)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(locations.id, id));
    await writeAudit({
      entityType: "location",
      entityId: id,
      action: "UPDATE",
      actor: user,
      before,
      after: { ...before, ...values },
    });
    revalidatePath("/locations");
    return { ok: true, data: undefined };
  } catch (err) {
    const msg =
      err instanceof Error &&
      err.message.includes("locations_warehouse_code_uidx")
        ? "รหัสนี้ถูกใช้ในคลังนี้แล้ว"
        : "ไม่สามารถบันทึกได้";
    return { ok: false, error: msg };
  }
}

export async function archiveLocation(id: string): Promise<ActionResult> {
  const user = await requireUser();
  const before = (
    await db.select().from(locations).where(eq(locations.id, id)).limit(1)
  )[0];
  if (!before) return { ok: false, error: "ไม่พบรายการ" };
  await db
    .update(locations)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(locations.id, id));
  await writeAudit({
    entityType: "location",
    entityId: id,
    action: "ARCHIVE",
    actor: user,
    before,
  });
  revalidatePath("/locations");
  return { ok: true, data: undefined };
}

export async function restoreLocation(id: string): Promise<ActionResult> {
  const user = await requireUser();
  const before = (
    await db.select().from(locations).where(eq(locations.id, id)).limit(1)
  )[0];
  if (!before) return { ok: false, error: "ไม่พบรายการ" };
  await db
    .update(locations)
    .set({ deletedAt: null, updatedAt: new Date() })
    .where(eq(locations.id, id));
  await writeAudit({
    entityType: "location",
    entityId: id,
    action: "RESTORE",
    actor: user,
    before,
  });
  revalidatePath("/locations");
  return { ok: true, data: undefined };
}
