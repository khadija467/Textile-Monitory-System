import { forwardRef } from "react";

const Input = forwardRef(
  ({ label, error, icon: Icon, className = "", containerClassName = "", ...props }, ref) => {
    return (
      <div className={containerClassName}>
        {label && (
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
          )}
          <input
            ref={ref}
            className={`
              w-full rounded-xl border bg-[var(--surface-raised)] text-[var(--text-primary)]
              border-[var(--border-subtle)] px-3.5 py-2.5 text-sm
              placeholder:text-[var(--text-secondary)]
              focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent
              transition-theme
              ${Icon ? "pl-10" : ""}
              ${error ? "border-[var(--color-coral-500)] focus:ring-[var(--color-coral-500)]" : ""}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-[var(--color-coral-500)]">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
