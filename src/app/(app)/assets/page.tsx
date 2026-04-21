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
import { listAssets } from "@/features/assets/actions";
import { listSuppliers } from "@/features/suppliers/actions";
import { listLocationsWithWarehouse } from "@/features/locations/actions";
import { AssetFormDialog } from "@/features/assets/asset-form-dialog";
import { AssetRowActions } from "@/features/assets/asset-row-actions";
import { assetStatusLabel } from "@/features/assets/schema";

export const dynamic = "force-dynamic";

const STATUS_CLASS: Record<string, string> = {
  AVAILABLE: "border-success/40 bg-success/10 text-success",
  IN_USE: "border-info/40 bg-info/10 text-info",
  REPAIR: "border-warning/40 bg-warning/10 text-warning",
  RETIRED: "border-dim/40 bg-muted text-muted-foreground",
  LOST: "border-destructive/40 bg-destructive/10 text-destructive",
};

export default async function AssetsPage() {
  const [data, suppliers, locations] = await Promise.all([
    listAssets({ includeArchived: true }),
    listSuppliers(),
    listLocationsWithWarehouse(),
  ]);

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-lg font-bold">ครุภัณฑ์</h1>
          <p className="text-[12px] text-muted-foreground">
            จัดการครุภัณฑ์รายตัว · {data.length} รายการ
          </p>
        </div>
        <AssetFormDialog
          suppliers={suppliers}
          locations={locations}
          trigger={
            <Button>
              <Plus className="h-4 w-4" />
              เพิ่มครุภัณฑ์
            </Button>
          }
        />
      </div>
      <div className="overflow-hidden rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-[11px] uppercase tracking-wide text-dim">
                เลขครุภัณฑ์
              </TableHead>
              <TableHead className="text-[11px] uppercase tracking-wide text-dim">
                ชื่อ
              </TableHead>
              <TableHead className="text-[11px] uppercase tracking-wide text-dim">
                หมวดหมู่
              </TableHead>
              <TableHead className="text-[11px] uppercase tracking-wide text-dim">
                สถานะ
              </TableHead>
              <TableHead className="text-[11px] uppercase tracking-wide text-dim">
                หมดประกัน
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
              data.map((r) => {
                const expired =
                  r.warrantyExpiresAt &&
                  new Date(r.warrantyExpiresAt) < new Date();
                return (
                  <TableRow
                    key={r.id}
                    className="border-border hover:bg-hover/40"
                  >
                    <TableCell className="font-mono text-[12px] text-muted-foreground">
                      {r.assetTag}
                    </TableCell>
                    <TableCell className="font-semibold">{r.name}</TableCell>
                    <TableCell>
                      {r.category ? (
                        <Badge className="border border-info/40 bg-info/10 text-info">
                          {r.category}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`border ${STATUS_CLASS[r.status] ?? ""}`}
                      >
                        {assetStatusLabel[r.status]}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={
                        expired
                          ? "text-destructive"
                          : "text-muted-foreground"
                      }
                    >
                      {r.warrantyExpiresAt ?? "-"}
                    </TableCell>
                    <TableCell>
                      <AssetRowActions
                        row={r}
                        suppliers={suppliers}
                        locations={locations}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
