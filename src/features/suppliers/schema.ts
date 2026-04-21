import { z } from "zod";

export const supplierInputSchema = z.object({
  code: z.string().trim().min(1, "กรุณากรอกรหัส").max(64),
  name: z.string().trim().min(1, "กรุณากรอกชื่อ").max(255),
  taxId: z.string().trim().max(32).optional().or(z.literal("")),
  contactName: z.string().trim().max(255).optional().or(z.literal("")),
  phone: z.string().trim().max(64).optional().or(z.literal("")),
  email: z
    .string()
    .trim()
    .email("อีเมลไม่ถูกต้อง")
    .optional()
    .or(z.literal("")),
  address: z.string().trim().max(1000).optional().or(z.literal("")),
  note: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type SupplierInput = z.infer<typeof supplierInputSchema>;

export function normalizeSupplierInput(input: SupplierInput) {
  const blankToNull = (v: string | undefined) =>
    v && v.length > 0 ? v : null;
  return {
    code: input.code,
    name: input.name,
    taxId: blankToNull(input.taxId),
    contactName: blankToNull(input.contactName),
    phone: blankToNull(input.phone),
    email: blankToNull(input.email),
    address: blankToNull(input.address),
    note: blankToNull(input.note),
  };
}
