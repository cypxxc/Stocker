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
import { listWarehouses } from "@/features/warehouses/actions";
import { listLocationsWithWarehouse } from "@/features/locations/actions";
import { LocationFormDialog } from "@/features/locations/location-form-dialog";
import { LocationRowActions } from "@/features/locations/location-row-actions";

export const dynamic = "force-dynamic";

export default async function LocationsPage() {
  const [data, warehouses] = await Promise.all([
    listLocationsWithWarehouse({ includeArchived: true }),
    listWarehouses(),
  ]);

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-lg font-bold">ตำแหน่งจัดเก็บ</h1>
          <p className="text-[12px] text-muted-foreground">
            ตำแหน่งย่อยภายในคลัง · {data.length} รายการ
          </p>
        </div>
        <LocationFormDialog
          warehouses={warehouses}
          trigger={
            <Button disabled={warehouses.length === 0}>
              <Plus className="h-4 w-4" />
              เพิ่มตำแหน่ง
            </Button>
          }
        />
      </div>

      {warehouses.length === 0 && (
        <div className="rounded-md border border-warning/40 bg-warning/10 p-3 text-[12px] text-warning">
          ต้องสร้างคลังก่อนถึงจะเพิ่มตำแหน่งจัดเก็บได้
        </div>
      )}

      <div className="overflow-hidden rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-[11px] uppercase tracking-wide text-dim">
                คลัง
              </TableHead>
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
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  ไม่มีข้อมูล
                </TableCell>
              </TableRow>
            ) : (
              data.map((r) => (
                <TableRow key={r.id} className="border-border hover:bg-hover/40">
                  <TableCell>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {r.warehouseCode}
                    </span>{" "}
                    <span className="text-[12px]">{r.warehouseName}</span>
                  </TableCell>
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
                    <LocationRowActions row={r} warehouses={warehouses} />
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
