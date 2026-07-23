import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

const Select = forwardRef(({ label, error, options = [], placeholder, className = "", containerClassName = "", ...props }, ref) => {
  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">{label}</label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={`
            w-full rounded-xl border bg-[var(--surface-raised)] text-[var(--text-primary)]
            border-[var(--border-subtle)] px-3.5 py-2.5 text-sm appearance-none pr-10
            focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent
            transition-theme
            ${error ? "border-[var(--color-coral-500)]" : ""}
            ${className}
          `}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none" />
      </div>
      {error && <p className="mt-1 text-xs text-[var(--color-coral-500)]">{error}</p>}
    </div>
  );
});

Select.displayName = "Select";
export default Select;
