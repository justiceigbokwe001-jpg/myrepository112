import * as React from "react";
import { cn } from "@/lib/utils";
export function Switch({ checked, onCheckedChange, className }: { checked: boolean; onCheckedChange: (v: boolean) => void; className?: string }) {
  return (<button type="button" onClick={() => onCheckedChange(!checked)}
    className={cn("relative inline-flex h-6 w-10 items-center rounded-full transition", checked ? "bg-gray-900" : "bg-gray-300", className)}
    aria-pressed={checked} aria-label="Toggle">
    <span className={cn("inline-block h-5 w-5 transform rounded-full bg-white transition", checked ? "translate-x-5" : "translate-x-1")} />
  </button>);
}
