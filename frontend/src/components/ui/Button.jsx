import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary:
    "bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)] shadow-[0_2px_8px_-2px_rgba(22,163,74,0.45)]",
  secondary:
    "bg-transparent text-[var(--text-primary)] border border-[var(--border-subtle)] hover:bg-[var(--surface-sunken)]",
  ghost:
    "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-sunken)] hover:text-[var(--text-primary)]",
  danger:
    "bg-[var(--color-coral-500)] text-white hover:bg-[#c43d3d] shadow-[0_2px_8px_-2px_rgba(220,76,76,0.4)]",
  warning:
    "bg-[var(--color-amber-500)] text-white hover:bg-[#c4933a] shadow-[0_2px_8px_-2px_rgba(217,164,65,0.4)]",
  outline:
    "bg-transparent text-[var(--brand-primary)] border border-[var(--brand-primary)] hover:bg-[var(--color-brand-50)]",
  dark:
    "bg-[var(--color-ink-900)] text-white hover:bg-[var(--color-ink-800)] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.4)]",
};

const SIZES = {
  sm: "px-3 py-1.5 text-sm gap-1.5",
  md: "px-4 py-2.5 text-sm gap-2",
  lg: "px-6 py-3 text-base gap-2",
  icon: "p-2.5",
};

const Button = forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "md",
      icon: Icon,
      iconPosition = "left",
      loading = false,
      disabled = false,
      className = "",
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        disabled={disabled || loading}
        whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
        whileTap={!disabled && !loading ? { scale: 0.97 } : {}}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className={`
          inline-flex items-center justify-center font-medium rounded-xl
          transition-colors duration-150 select-none whitespace-nowrap
          disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
          focus-visible:ring-[var(--brand-primary)]
          ${VARIANTS[variant]} ${SIZES[size]} ${className}
        `}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            {Icon && iconPosition === "left" && <Icon className="w-4 h-4" />}
            {children}
            {Icon && iconPosition === "right" && <Icon className="w-4 h-4" />}
          </>
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
export default Button;
