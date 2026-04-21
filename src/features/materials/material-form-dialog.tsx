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
import { materialInputSchema, type MaterialInput } from "./schema";
import { createMaterial, updateMaterial } from "./actions";

type Supplier = { id: string; code: string; name: string };
type MaterialLike = {
  id: string;
  code: string;
  name: string;
  category: string | null;
  unit: string;
  barcode: string | null;
  defaultSupplierId: string | null;
  reorderPoint: string | null;
  reorderQty: string | null;
  trackExpiry: boolean;
  shelfLifeDays: number | null;
  note: string | null;
};

const NULL_SUPPLIER = "__none__";

export function MaterialFormDialog({
  trigger,
  initial,
  suppliers,
}: {
  trigger: React.ReactNode;
  initial?: MaterialLike;
  suppliers: Supplier[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const form = useForm<MaterialInput>({
    resolver: zodResolver(materialInputSchema),
    defaultValues: {
      code: initial?.code ?? "",
      name: initial?.name ?? "",
      category: initial?.category ?? "",
      unit: initial?.unit ?? "",
      barcode: initial?.barcode ?? "",
      defaultSupplierId: initial?.defaultSupplierId ?? "",
      reorderPoint: initial?.reorderPoint
        ? Number(initial.reorderPoint)
        : undefined,
      reorderQty: initial?.reorderQty
        ? Number(initial.reorderQty)
        : undefined,
      trackExpiry: initial?.trackExpiry ?? false,
      shelfLifeDays: initial?.shelfLifeDays ?? undefined,
      note: initial?.note ?? "",
    },
  });

  function onSubmit(values: MaterialInput) {
    startTransition(async () => {
      const result = initial
        ? await updateMaterial(initial.id, values)
        : await createMaterial(values);
      if (!result.ok) {
        if (result.fieldErrors) {
          for (const [k, v] of Object.entries(result.fieldErrors)) {
            if (v && v[0])
              form.setError(k as keyof MaterialInput, { message: v[0] });
          }
        }
        toast.error(result.error);
        return;
      }
      toast.success(initial ? "อัปเดตเรียบร้อย" : "เพิ่มวัสดุเรียบร้อย");
      setOpen(false);
      router.refresh();
      if (!initial) form.reset();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{initial ? "แก้ไขวัสดุ" : "เพิ่มวัสดุ"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-2 gap-3"
          >
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>รหัสวัสดุ *</FormLabel>
                  <FormControl>
                    <Input placeholder="MAT-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>หน่วยนับ *</FormLabel>
                  <FormControl>
                    <Input placeholder="ชิ้น / กก." {...field} />
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
                  <FormLabel>ชื่อวัสดุ *</FormLabel>
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
              name="barcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>บาร์โค้ด</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="defaultSupplierId"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>ผู้ขายหลัก</FormLabel>
                  <Select
                    value={field.value && field.value.length > 0 ? field.value : NULL_SUPPLIER}
                    onValueChange={(v) =>
                      field.onChange(v === NULL_SUPPLIER ? "" : v)
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกผู้ขาย" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NULL_SUPPLIER}>— ไม่ระบุ —</SelectItem>
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
              name="reorderPoint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>จุดสั่งซื้อ</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.001"
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
              name="reorderQty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>จำนวนสั่งซื้อต่อครั้ง</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.001"
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
