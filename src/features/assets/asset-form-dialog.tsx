"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  assetInputSchema,
  assetStatusLabel,
  assetStatusValues,
  type AssetInput,
} from "./schema";
import { createAsset, updateAsset } from "./actions";

type Supplier = { id: string; code: string; name: string };
type Location = {
  id: string;
  code: string;
  name: string;
  warehouseCode: string;
};
type AssetLike = {
  id: string;
  assetTag: string;
  name: string;
  category: string | null;
  serialNumber: string | null;
  supplierId: string | null;
  locationId: string | null;
  status: (typeof assetStatusValues)[number];
  purchaseDate: string | null;
  purchasePrice: string | null;
  warrantyExpiresAt: string | null;
  note: string | null;
};

const NULL_VAL = "__none__";

export function AssetFormDialog({
  trigger,
  initial,
  suppliers,
  locations,
}: {
  trigger: React.ReactNode;
  initial?: AssetLike;
  suppliers: Supplier[];
  locations: Location[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const form = useForm<AssetInput>({
    resolver: zodResolver(assetInputSchema),
    defaultValues: {
      assetTag: initial?.assetTag ?? "",
      name: initial?.name ?? "",
      category: initial?.category ?? "",
      serialNumber: initial?.serialNumber ?? "",
      supplierId: initial?.supplierId ?? "",
      locationId: initial?.locationId ?? "",
      status: initial?.status ?? "AVAILABLE",
      purchaseDate: initial?.purchaseDate ?? undefined,
      purchasePrice: initial?.purchasePrice
        ? Number(initial.purchasePrice)
        : undefined,
      warrantyExpiresAt: initial?.warrantyExpiresAt ?? undefined,
      note: initial?.note ?? "",
    },
  });

  function onSubmit(values: AssetInput) {
    startTransition(async () => {
      const result = initial
        ? await updateAsset(initial.id, values)
        : await createAsset(values);
      if (!result.ok) {
        if (result.fieldErrors) {
          for (const [k, v] of Object.entries(result.fieldErrors)) {
            if (v && v[0])
              form.setError(k as keyof AssetInput, { message: v[0] });
          }
        }
        toast.error(result.error);
        return;
      }
      toast.success(initial ? "อัปเดตเรียบร้อย" : "เพิ่มครุภัณฑ์เรียบร้อย");
      setOpen(false);
      router.refresh();
      if (!initial) form.reset();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{initial ? "แก้ไขครุภัณฑ์" : "เพิ่มครุภัณฑ์"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-2 gap-3"
          >
            <FormField
              control={form.control}
              name="assetTag"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>เลขครุภัณฑ์ *</FormLabel>
                  <FormControl>
                    <Input placeholder="EQ-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="serialNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serial Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>ชื่อครุภัณฑ์ *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>หมวดหมู่</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>สถานะ *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {assetStatusValues.map((s) => (
                        <SelectItem key={s} value={s}>
                          {assetStatusLabel[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="locationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ที่ตั้ง</FormLabel>
                  <Select
                    value={field.value && field.value.length > 0 ? field.value : NULL_VAL}
                    onValueChange={(v) =>
                      field.onChange(v === NULL_VAL ? "" : v)
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกตำแหน่ง" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NULL_VAL}>— ไม่ระบุ —</SelectItem>
                      {locations.map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.warehouseCode} / {l.code} — {l.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="supplierId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ผู้ขาย</FormLabel>
                  <Select
                    value={field.value && field.value.length > 0 ? field.value : NULL_VAL}
                    onValueChange={(v) =>
                      field.onChange(v === NULL_VAL ? "" : v)
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกผู้ขาย" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NULL_VAL}>— ไม่ระบุ —</SelectItem>
                      {suppliers.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.code} — {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="purchaseDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>วันที่จัดซื้อ</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="purchasePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ราคาทุน</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? undefined : Number(e.target.value),
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="warrantyExpiresAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>วันหมดประกัน</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>หมายเหตุ</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="col-span-2 mt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "กำลังบันทึก..." : "บันทึก"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
