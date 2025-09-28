import * as React from "react";
import { cn } from "@/lib/utils";
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: "default"|"outline" }
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant="default", ...props }, ref) => {
  const base = "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium transition";
  const styles = variant==="outline" ? "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50" : "bg-gray-900 text-white hover:bg-black";
  return <button ref={ref} className={cn(base, styles, className)} {...props} />;
}); Button.displayName="Button";
