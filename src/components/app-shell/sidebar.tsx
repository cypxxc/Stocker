"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Boxes,
  Wrench,
  Truck,
  Activity,
  BarChart3,
  Warehouse,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  group: string | null;
};

const NAV: NavItem[] = [
  { href: "/", label: "แดชบอร์ด", icon: LayoutDashboard, group: null },
  { href: "/materials", label: "วัสดุสิ้นเปลือง", icon: Boxes, group: "คลังพัสดุ" },
  { href: "/assets", label: "ครุภัณฑ์", icon: Wrench, group: "คลังพัสดุ" },
  { href: "/suppliers", label: "คู่ค้า / ผู้ขาย", icon: Truck, group: "คลังพัสดุ" },
  { href: "/warehouses", label: "คลังสินค้า", icon: Warehouse, group: "ตั้งค่า" },
  { href: "/locations", label: "ตำแหน่งจัดเก็บ", icon: MapPin, group: "ตั้งค่า" },
  { href: "/movements", label: "ความเคลื่อนไหว", icon: Activity, group: "บันทึก" },
  { href: "/reports", label: "รายงาน", icon: BarChart3, group: "บันทึก" },
];

export function Sidebar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const groups = Array.from(new Set(NAV.map((n) => n.group)));

  return (
    <aside className="flex h-screen w-[228px] shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex h-[54px] shrink-0 items-center gap-2.5 border-b border-border px-3.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
          <Warehouse className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
        <div>
          <div className="text-[13px] font-extrabold leading-tight">InvenThai</div>
          <div className="text-[9px] tracking-[0.06em] text-muted-foreground">
            INVENTORY SYSTEM
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-2.5">
        {groups.map((group) => (
          <div key={group ?? "root"}>
            {group && (
              <div className="px-2 pb-1 pt-3 text-[10px] font-bold uppercase tracking-[0.08em] text-dim">
                {group}
              </div>
            )}
            {NAV.filter((n) => n.group === group).map((n) => {
              const isActive =
                n.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(n.href);
              const Icon = n.icon;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn(
                    "mb-0.5 flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] transition-colors",
                    isActive
                      ? "bg-hover font-bold text-primary"
                      : "text-muted-foreground hover:bg-hover/50 hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1">{n.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="flex items-center gap-2 border-t border-border px-3.5 py-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent-dim)] text-[12px] font-bold text-primary">
          {userName.slice(0, 1)}
        </div>
        <div>
          <div className="text-[12px] font-semibold">{userName}</div>
          <div className="text-[10px] text-muted-foreground">Dev mode</div>
        </div>
      </div>
    </aside>
  );
}
