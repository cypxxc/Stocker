import { z } from "zod";

export const warehouseInputSchema = z.object({
  code: z.string().trim().min(1, "กรุณากรอกรหัส").max(64),
  name: z.string().trim().min(1, "กรุณากรอกชื่อ").max(255),
  note: z.string().trim().max(1000).optional().or(z.literal("")),
});
export type WarehouseInput = z.infer<typeof warehouseInputSchema>;

export function normalizeWarehouseInput(input: WarehouseInput) {
  return {
    code: input.code,
    name: input.name,
    note: input.note && input.note.length > 0 ? input.note : null,
  };
}
