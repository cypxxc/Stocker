import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listSuppliers } from "@/features/suppliers/actions";
import { SupplierFormDialog } from "@/features/suppliers/supplier-form-dialog";
import { SuppliersTable } from "@/features/suppliers/suppliers-table";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  const data = await listSuppliers({ includeArchived: true });

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-lg font-bold">คู่ค้า / ผู้ขาย</h1>
          <p className="text-[12px] text-muted-foreground">
            จัดการรายชื่อผู้ขายทั้งหมด · {data.length} รายการ
          </p>
        </div>
        <SupplierFormDialog
          trigger={
            <Button>
              <Plus className="h-4 w-4" />
              เพิ่มผู้ขาย
            </Button>
          }
        />
      </div>
      <SuppliersTable data={data} />
    </div>
  );
}
