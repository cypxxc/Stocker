"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Archive, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MaterialFormDialog } from "./material-form-dialog";
import { archiveMaterial, restoreMaterial } from "./actions";

type Row = {
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
  deletedAt: Date | null;
};

export function MaterialRowActions({
  row,
  suppliers,
}: {
  row: Row;
  suppliers: { id: string; code: string; name: string }[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-end gap-1">
      <MaterialFormDialog
        initial={row}
        suppliers={suppliers}
        trigger={
          <Button variant="ghost" size="icon" title="แก้ไข">
            <Pencil className="h-4 w-4" />
          </Button>
        }
      />
      {row.deletedAt ? (
        <Button
          variant="ghost"
          size="icon"
          title="กู้คืน"
          onClick={() =>
            startTransition(async () => {
              const r = await restoreMaterial(row.id);
              if (r.ok) {
                toast.success("กู้คืนเรียบร้อย");
                router.refresh();
              } else toast.error(r.error);
            })
          }
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          title="เก็บเข้าคลัง"
          onClick={() => {
            if (!confirm(`เก็บวัสดุ "${row.name}" เข้าคลัง?`)) return;
            startTransition(async () => {
              const r = await archiveMaterial(row.id);
              if (r.ok) {
                toast.success("เก็บเข้าคลังเรียบร้อย");
                router.refresh();
              } else toast.error(r.error);
            });
          }}
        >
          <Archive className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
