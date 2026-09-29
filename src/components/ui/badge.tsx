import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium tracking-tight transition-colors focus:outline-none focus:ring-1 focus:ring-ring",
  {
    variants: {
      variant: {
        default: "border border-border bg-secondary text-foreground",
        secondary: "border border-border/60 bg-muted text-muted-foreground",
        destructive: "border border-red-200 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/50",
        outline: "text-foreground border border-border bg-card",
        success: "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40",
        warning: "border border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40",
        radiant: "border border-slate-300 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 dark:border-slate-200 font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
