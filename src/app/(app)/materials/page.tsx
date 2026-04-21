import { Plus } from "lucide-react";
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
import { listMaterials } from "@/features/materials/actions";
import { listSuppliers } from "@/features/suppliers/actions";
import { MaterialFormDialog } from "@/features/materials/material-form-dialog";
import { MaterialRowActions } from "@/features/materials/material-row-actions";

export const dynamic = "force-dynamic";

export default async function MaterialsPage() {
  const [data, suppliers] = await Promise.all([
    listMaterials({ includeArchived: true }),
    listSuppliers(),
  ]);
  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-lg font-bold">วัสดุสิ้นเปลือง</h1>
          <p className="text-[12px] text-muted-foreground">
            จัดการรายการวัสดุ · {data.length} รายการ
          </p>
        </div>
        <MaterialFormDialog
          suppliers={suppliers}
          trigger={
            <Button>
              <Plus className="h-4 w-4" />
              เพิ่มวัสดุ
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
                ชื่อวัสดุ
              </TableHead>
              <TableHead className="text-[11px] uppercase tracking-wide text-dim">
                หมวดหมู่
              </TableHead>
              <TableHead className="text-[11px] uppercase tracking-wide text-dim">
                หน่วย
              </TableHead>
              <TableHead className="text-[11px] uppercase tracking-wide text-dim">
                จุดสั่งซื้อ
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
                  colSpan={7}
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
                  <TableCell>
                    {r.category ? (
                      <Badge className="border border-primary/30 bg-[var(--accent-bg)] text-primary">
                        {r.category}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {r.unit}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {r.reorderPoint ?? "-"}
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
                    <MaterialRowActions row={r} suppliers={suppliers} />
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
