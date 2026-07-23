import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

const ACCENTS = {
  emerald: { bg: "bg-[var(--color-brand-100)] dark:bg-[#0b2914]", text: "text-[var(--color-brand-600)] dark:text-[var(--color-brand-300)]" },
  amber: { bg: "bg-[var(--color-amber-100)] dark:bg-[#3a2f17]", text: "text-[var(--color-amber-500)] dark:text-[var(--color-amber-400)]" },
  coral: { bg: "bg-[var(--color-coral-100)] dark:bg-[#3a1818]", text: "text-[var(--color-coral-500)] dark:text-[var(--color-coral-400)]" },
  ink: { bg: "bg-[var(--color-slate-100)] dark:bg-[#1a1a1a]", text: "text-[var(--color-ink-900)] dark:text-[var(--color-slate-200)]" },
};

export default function StatCard({ label, value, icon: Icon, accent = "emerald", trend, suffix = "" }) {
  const a = ACCENTS[accent] || ACCENTS.emerald;
  const isPositive = trend !== undefined && trend >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="bg-[var(--surface-raised)] border border-[var(--border-subtle)] rounded-2xl p-5 hover:shadow-lg hover:shadow-black/5 transition-shadow duration-200"
    >
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl ${a.bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${a.text}`} />
        </div>
        {trend !== undefined && (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full ${
              isPositive
                ? "bg-[var(--color-brand-100)] text-[var(--color-brand-600)] dark:bg-[#0b2914] dark:text-[var(--color-brand-300)]"
                : "bg-[var(--color-coral-100)] text-[var(--color-coral-500)] dark:bg-[#3a1818] dark:text-[var(--color-coral-400)]"
            }`}
          >
            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-display font-bold text-[var(--text-primary)] tabular-nums">
        {value}
        {suffix}
      </p>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">{label}</p>
    </motion.div>
  );
}
