import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md hover:shadow-primary/20",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow-md hover:shadow-destructive/20",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-primary/50",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // History Academy Dark v2 variants
        "ha-red": "bg-ha-red text-off-white font-semibold hover:bg-ha-red-deep shadow-sm hover:shadow-md",
        "ha-gold": "bg-gradient-to-b from-gold-1 via-gold-2 to-gold-3 text-void font-semibold shadow-gold-btn hover:brightness-110 active:translate-y-[2px] active:shadow-none",
        "ha-ghost": "bg-charcoal text-off-white hover:bg-charcoal-2 border border-transparent hover:border-gold-2/20",
        "ha-outline": "border border-gold-2/30 bg-transparent text-off-white hover:border-gold-2/60 hover:bg-gold-2/5",
        // Legacy variants
        premium: "bg-gradient-to-b from-gold-1 via-gold-2 to-gold-3 text-void font-semibold shadow-gold-btn hover:brightness-110",
        glass: "bg-card/50 backdrop-blur-md border border-white/10 text-foreground hover:bg-card/70 hover:border-primary/30 shadow-lg",
        brand: "bg-ha-red text-off-white font-semibold hover:bg-ha-red-deep shadow-sm hover:shadow-md",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        xl: "h-14 px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
