"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Archive, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AssetFormDialog } from "./asset-form-dialog";
import { archiveAsset, restoreAsset } from "./actions";
import type { assetStatusValues } from "./schema";

type Row = {
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
  deletedAt: Date | null;
};

export function AssetRowActions({
  row,
  suppliers,
  locations,
}: {
  row: Row;
  suppliers: { id: string; code: string; name: string }[];
  locations: { id: string; code: string; name: string; warehouseCode: string }[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-end gap-1">
      <AssetFormDialog
        initial={row}
        suppliers={suppliers}
        locations={locations}
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
              const r = await restoreAsset(row.id);
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
            if (!confirm(`เก็บครุภัณฑ์ "${row.name}" เข้าคลัง?`)) return;
            startTransition(async () => {
              const r = await archiveAsset(row.id);
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
