"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
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
import { warehouseInputSchema, type WarehouseInput } from "./schema";
import { createWarehouse, updateWarehouse } from "./actions";

type WarehouseLike = {
  id: string;
  code: string;
  name: string;
  note: string | null;
};

export function WarehouseFormDialog({
  trigger,
  initial,
}: {
  trigger: React.ReactNode;
  initial?: WarehouseLike;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const form = useForm<WarehouseInput>({
    resolver: zodResolver(warehouseInputSchema),
    defaultValues: {
      code: initial?.code ?? "",
      name: initial?.name ?? "",
      note: initial?.note ?? "",
    },
  });

  function onSubmit(values: WarehouseInput) {
    startTransition(async () => {
      const result = initial
        ? await updateWarehouse(initial.id, values)
        : await createWarehouse(values);
      if (!result.ok) {
        if (result.fieldErrors) {
          for (const [k, v] of Object.entries(result.fieldErrors)) {
            if (v && v[0])
              form.setError(k as keyof WarehouseInput, { message: v[0] });
          }
        }
        toast.error(result.error);
        return;
      }
      toast.success(initial ? "อัปเดตเรียบร้อย" : "เพิ่มคลังเรียบร้อย");
      setOpen(false);
      router.refresh();
      if (!initial) form.reset();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>{initial ? "แก้ไขคลัง" : "เพิ่มคลัง"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>รหัสคลัง *</FormLabel>
                  <FormControl>
                    <Input placeholder="WH-01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชื่อคลัง *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>หมายเหตุ</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
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
