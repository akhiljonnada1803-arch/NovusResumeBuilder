import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-xs font-semibold tracking-tight transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-2xs hover:opacity-90 active:bg-primary/95 border border-primary/20",
        radiant:
          "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-2xs hover:bg-slate-800 dark:hover:bg-slate-100 border border-slate-700/50 dark:border-slate-300 font-semibold",
        destructive:
          "bg-destructive text-destructive-foreground shadow-2xs hover:bg-destructive/90 border border-destructive/20",
        outline:
          "border border-border bg-card text-foreground shadow-2xs hover:bg-accent/60 hover:text-foreground active:bg-accent",
        secondary:
          "bg-secondary text-secondary-foreground shadow-2xs hover:bg-secondary/80 border border-border/50",
        ghost:
          "text-muted-foreground hover:bg-accent/60 hover:text-foreground active:bg-accent",
        link:
          "text-primary underline-offset-4 hover:underline p-0 h-auto font-medium",
        glass:
          "bg-card/80 backdrop-blur-xs border border-border hover:bg-card text-foreground shadow-2xs",
      },
      size: {
        default: "h-9 px-3.5 py-1.5",
        sm: "h-7.5 rounded-md px-2.5 text-[11px]",
        lg: "h-10 rounded-lg px-5 text-sm",
        icon: "h-8.5 w-8.5 p-0",
        "icon-sm": "h-7 w-7 p-0 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
