"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Archive, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { WarehouseFormDialog } from "./warehouse-form-dialog";
import { archiveWarehouse, restoreWarehouse } from "./actions";

type Row = {
  id: string;
  code: string;
  name: string;
  note: string | null;
  deletedAt: Date | null;
};

export function WarehouseRowActions({ row }: { row: Row }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-end gap-1">
      <WarehouseFormDialog
        initial={row}
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
              const r = await restoreWarehouse(row.id);
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
            if (!confirm(`เก็บคลัง "${row.name}" เข้าคลัง?`)) return;
            startTransition(async () => {
              const r = await archiveWarehouse(row.id);
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
