import { Plus, Pencil, Archive, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listWarehouses } from "@/features/warehouses/actions";
import { WarehouseFormDialog } from "@/features/warehouses/warehouse-form-dialog";
import { WarehouseRowActions } from "@/features/warehouses/warehouse-row-actions";

export const dynamic = "force-dynamic";

export default async function WarehousesPage() {
  const data = await listWarehouses({ includeArchived: true });
  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-lg font-bold">คลังสินค้า</h1>
          <p className="text-[12px] text-muted-foreground">
            จัดการคลังหลัก · {data.length} รายการ
          </p>
        </div>
        <WarehouseFormDialog
          trigger={
            <Button>
              <Plus className="h-4 w-4" />
              เพิ่มคลัง
            </Button>
          }
        />
      </div>
      <div className="overflow-hidden rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-[11px] uppercase tracking-wide text-dim">
                รหัส
              </TableHead>
              <TableHead className="text-[11px] uppercase tracking-wide text-dim">
                ชื่อ
              </TableHead>
              <TableHead className="text-[11px] uppercase tracking-wide text-dim">
                หมายเหตุ
              </TableHead>
              <TableHead className="text-[11px] uppercase tracking-wide text-dim">
                สถานะ
              </TableHead>
              <TableHead className="text-right text-[11px] uppercase tracking-wide text-dim">
                การกระทำ
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  ไม่มีข้อมูล
                </TableCell>
              </TableRow>
            ) : (
              data.map((r) => (
                <TableRow key={r.id} className="border-border hover:bg-hover/40">
                  <TableCell className="font-mono text-[12px] text-muted-foreground">
                    {r.code}
                  </TableCell>
                  <TableCell className="font-semibold">{r.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {r.note ?? "-"}
                  </TableCell>
                  <TableCell>
                    {r.deletedAt ? (
                      <Badge variant="secondary">เก็บเข้าคลัง</Badge>
                    ) : (
                      <Badge className="border border-primary/30 bg-[var(--accent-bg)] text-primary">
                        ใช้งาน
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <WarehouseRowActions row={r} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
