import { motion } from "framer-motion";

export default function Card({ children, className = "", stitched = false, animate = true, delay = 0, ...props }) {
  const baseClass = `
    bg-[var(--surface-raised)] border border-[var(--border-subtle)]
    rounded-2xl shadow-sm transition-theme
    ${stitched ? "stitch-edge" : ""}
    ${className}
  `;

  if (!animate) {
    return (
      <div className={baseClass} {...props}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={baseClass}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ title, subtitle, action, icon: Icon }) {
  return (
    <div className="flex items-start justify-between gap-3 p-5 pb-4">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-100)] dark:bg-[#0b2914] flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-[var(--brand-primary)]" />
          </div>
        )}
        <div>
          <h3 className="font-display font-semibold text-[var(--text-primary)] leading-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

export function CardBody({ children, className = "" }) {
  return <div className={`px-5 pb-5 ${className}`}>{children}</div>;
}
