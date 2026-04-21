import { z } from "zod";

export const locationInputSchema = z.object({
  warehouseId: z.string().uuid("กรุณาเลือกคลัง"),
  code: z.string().trim().min(1, "กรุณากรอกรหัส").max(64),
  name: z.string().trim().min(1, "กรุณากรอกชื่อ").max(255),
  note: z.string().trim().max(1000).optional().or(z.literal("")),
});
export type LocationInput = z.infer<typeof locationInputSchema>;

export function normalizeLocationInput(input: LocationInput) {
  return {
    warehouseId: input.warehouseId,
    code: input.code,
    name: input.name,
    note: input.note && input.note.length > 0 ? input.note : null,
  };
}
