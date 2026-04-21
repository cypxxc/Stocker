"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Archive, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LocationFormDialog } from "./location-form-dialog";
import { archiveLocation, restoreLocation } from "./actions";

type Row = {
  id: string;
  warehouseId: string;
  code: string;
  name: string;
  note: string | null;
  deletedAt: Date | null;
};

export function LocationRowActions({
  row,
  warehouses,
}: {
  row: Row;
  warehouses: { id: string; code: string; name: string }[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-end gap-1">
      <LocationFormDialog
        initial={row}
        warehouses={warehouses}
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
              const r = await restoreLocation(row.id);
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
            if (!confirm(`เก็บตำแหน่ง "${row.name}" เข้าคลัง?`)) return;
            startTransition(async () => {
              const r = await archiveLocation(row.id);
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
