"use client";

import { Clock } from "lucide-react";

export function Topbar() {
  const dateLabel = new Date().toLocaleDateString("th-TH", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  return (
    <header className="flex h-[54px] shrink-0 items-center gap-3 border-b border-border bg-surface px-5">
      <div className="flex-1" />
      <div className="flex items-center gap-1.5 rounded-md border border-border bg-elevated px-2.5 py-1 text-[11px] text-muted-foreground">
        <Clock className="h-3 w-3" />
        {dateLabel}
      </div>
    </header>
  );
}
