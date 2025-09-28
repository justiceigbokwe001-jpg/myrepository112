import * as React from "react";
import { cn } from "@/lib/utils";
export function Progress({ value=0, className }: { value?: number; className?: string }) {
  return (<div className={cn("w-full h-2 rounded-full bg-gray-200", className)}>
    <div className="h-2 rounded-full bg-gray-900 transition-all" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
  </div>);
}
