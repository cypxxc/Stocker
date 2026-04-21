import { z } from "zod";

const optionalNumber = z
  .number()
  .optional()
  .or(z.nan().transform(() => undefined));

export const materialInputSchema = z.object({
  code: z.string().trim().min(1, "กรุณากรอกรหัส").max(64),
  name: z.string().trim().min(1, "กรุณากรอกชื่อ").max(255),
  category: z.string().trim().max(64).optional().or(z.literal("")),
  unit: z.string().trim().min(1, "กรุณากรอกหน่วย").max(32),
  barcode: z.string().trim().max(128).optional().or(z.literal("")),
  defaultSupplierId: z.string().uuid().optional().or(z.literal("")),
  reorderPoint: optionalNumber,
  reorderQty: optionalNumber,
  trackExpiry: z.boolean(),
  shelfLifeDays: optionalNumber,
  note: z.string().trim().max(1000).optional().or(z.literal("")),
});
export type MaterialInput = z.infer<typeof materialInputSchema>;

export function normalizeMaterialInput(input: MaterialInput) {
  const blank = (v: string | undefined) => (v && v.length > 0 ? v : null);
  const numStr = (v: number | undefined) =>
    v === undefined || Number.isNaN(v) ? null : String(v);
  const numInt = (v: number | undefined) =>
    v === undefined || Number.isNaN(v) ? null : Math.round(v);
  return {
    code: input.code,
    name: input.name,
    category: blank(input.category),
    unit: input.unit,
    barcode: blank(input.barcode),
    defaultSupplierId: blank(input.defaultSupplierId),
    reorderPoint: numStr(input.reorderPoint),
    reorderQty: numStr(input.reorderQty),
    trackExpiry: input.trackExpiry,
    shelfLifeDays: numInt(input.shelfLifeDays),
    note: blank(input.note),
  };
}
