import { z } from "zod";

const optionalNumber = z
  .number()
  .optional()
  .or(z.nan().transform(() => undefined));

export const assetStatusValues = [
  "AVAILABLE",
  "IN_USE",
  "REPAIR",
  "RETIRED",
  "LOST",
] as const;

export const assetInputSchema = z.object({
  assetTag: z.string().trim().min(1, "กรุณากรอกเลขครุภัณฑ์").max(64),
  name: z.string().trim().min(1, "กรุณากรอกชื่อ").max(255),
  category: z.string().trim().max(64).optional().or(z.literal("")),
  serialNumber: z.string().trim().max(128).optional().or(z.literal("")),
  supplierId: z.string().uuid().optional().or(z.literal("")),
  locationId: z.string().uuid().optional().or(z.literal("")),
  status: z.enum(assetStatusValues),
  purchaseDate: z.string().optional().or(z.literal("")),
  purchasePrice: optionalNumber,
  warrantyExpiresAt: z.string().optional().or(z.literal("")),
  note: z.string().trim().max(1000).optional().or(z.literal("")),
});
export type AssetInput = z.infer<typeof assetInputSchema>;

export function normalizeAssetInput(input: AssetInput) {
  const blank = (v: string | undefined) => (v && v.length > 0 ? v : null);
  const numStr = (v: number | undefined) =>
    v === undefined || Number.isNaN(v) ? null : String(v);
  return {
    assetTag: input.assetTag,
    name: input.name,
    category: blank(input.category),
    serialNumber: blank(input.serialNumber),
    supplierId: blank(input.supplierId),
    locationId: blank(input.locationId),
    status: input.status,
    purchaseDate: blank(input.purchaseDate),
    purchasePrice: numStr(input.purchasePrice),
    warrantyExpiresAt: blank(input.warrantyExpiresAt),
    note: blank(input.note),
  };
}

export const assetStatusLabel: Record<(typeof assetStatusValues)[number], string> = {
  AVAILABLE: "พร้อมใช้",
  IN_USE: "ใช้งาน",
  REPAIR: "ซ่อมบำรุง",
  RETIRED: "จำหน่ายแล้ว",
  LOST: "สูญหาย",
};
