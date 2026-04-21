"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { Pencil, Archive, RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SupplierFormDialog } from "./supplier-form-dialog";
import { archiveSupplier, restoreSupplier } from "./actions";

export type SupplierRow = {
  id: string;
  code: string;
  name: string;
  taxId: string | null;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  note: string | null;
  deletedAt: Date | null;
};

export function SuppliersTable({ data }: { data: SupplierRow[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [, startTransition] = useTransition();

  const columns = useMemo<ColumnDef<SupplierRow>[]>(
    () => [
      {
        accessorKey: "code",
        header: "รหัส",
        cell: ({ row }) => (
          <span className="font-mono text-[12px] text-muted-foreground">
            {row.original.code}
          </span>
        ),
      },
      {
        accessorKey: "name",
        header: "ชื่อบริษัท",
        cell: ({ row }) => (
          <div>
            <div className="font-semibold">{row.original.name}</div>
            {row.original.taxId && (
              <div className="font-mono text-[11px] text-muted-foreground">
                {row.original.taxId}
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: "contactName",
        header: "ผู้ติดต่อ",
        cell: ({ row }) => row.original.contactName ?? "-",
      },
      {
        accessorKey: "phone",
        header: "โทรศัพท์",
        cell: ({ row }) => row.original.phone ?? "-",
      },
      {
        accessorKey: "email",
        header: "อีเมล",
        cell: ({ row }) => row.original.email ?? "-",
      },
      {
        id: "status",
        header: "สถานะ",
        cell: ({ row }) =>
          row.original.deletedAt ? (
            <Badge variant="secondary" className="bg-muted text-muted-foreground">
              เก็บเข้าคลัง
            </Badge>
          ) : (
            <Badge className="bg-[var(--accent-bg)] text-primary border border-primary/30">
              ใช้งาน
            </Badge>
          ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">การกระทำ</div>,
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <SupplierFormDialog
                initial={r}
                trigger={
                  <Button variant="ghost" size="icon" title="แก้ไข">
                    <Pencil className="h-4 w-4" />
                  </Button>
                }
              />
              {r.deletedAt ? (
                <Button
                  variant="ghost"
                  size="icon"
                  title="กู้คืน"
                  onClick={() =>
                    startTransition(async () => {
                      const res = await restoreSupplier(r.id);
                      if (res.ok) {
                        toast.success("กู้คืนเรียบร้อย");
                        router.refresh();
                      } else toast.error(res.error);
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
                    if (!confirm(`เก็บผู้ขาย "${r.name}" เข้าคลัง?`)) return;
                    startTransition(async () => {
                      const res = await archiveSupplier(r.id);
                      if (res.ok) {
                        toast.success("เก็บเข้าคลังเรียบร้อย");
                        router.refresh();
                      } else toast.error(res.error);
                    });
                  }}
                >
                  <Archive className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [router],
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter: search },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearch,
    globalFilterFn: (row, _id, filter: string) => {
      const v = filter.trim().toLowerCase();
      if (!v) return true;
      const r = row.original;
      return (
        r.code.toLowerCase().includes(v) ||
        r.name.toLowerCase().includes(v) ||
        (r.taxId ?? "").toLowerCase().includes(v) ||
        (r.contactName ?? "").toLowerCase().includes(v)
      );
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหารหัส / ชื่อ / ผู้ติดต่อ"
            className="pl-8"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="border-border hover:bg-transparent">
                {hg.headers.map((h) => (
                  <TableHead key={h.id} className="text-[11px] uppercase tracking-wide text-dim">
                    {h.isPlaceholder
                      ? null
                      : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  ไม่มีข้อมูล
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="border-border hover:bg-hover/40">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-[12px] text-muted-foreground">
        <div>
          ทั้งหมด {table.getFilteredRowModel().rows.length} รายการ · หน้า{" "}
          {table.getState().pagination.pageIndex + 1} /{" "}
          {Math.max(1, table.getPageCount())}
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            ก่อนหน้า
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            ถัดไป
          </Button>
        </div>
      </div>
    </div>
  );
}
