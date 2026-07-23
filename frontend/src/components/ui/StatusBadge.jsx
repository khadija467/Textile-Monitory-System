const STATUS_STYLES = {
  RUNNING: { bg: "bg-[var(--color-brand-100)] dark:bg-[#0b2914]", text: "text-[var(--color-brand-600)] dark:text-[var(--color-brand-300)]", dot: "text-[var(--color-brand-500)]" },
  IDLE: { bg: "bg-[var(--color-amber-100)] dark:bg-[#3a2f17]", text: "text-[var(--color-amber-500)] dark:text-[var(--color-amber-400)]", dot: "text-[var(--color-amber-500)]" },
  FAULTY: { bg: "bg-[var(--color-coral-100)] dark:bg-[#3a1818]", text: "text-[var(--color-coral-500)] dark:text-[var(--color-coral-400)]", dot: "text-[var(--color-coral-500)]" },
  MAINTENANCE: { bg: "bg-[var(--color-amber-100)] dark:bg-[#3a2f17]", text: "text-[var(--color-amber-500)] dark:text-[var(--color-amber-400)]", dot: "text-[var(--color-amber-500)]" },
  OFFLINE: { bg: "bg-[var(--surface-sunken)]", text: "text-[var(--text-secondary)]", dot: "text-[var(--text-secondary)]" },

  PRESENT: { bg: "bg-[var(--color-brand-100)] dark:bg-[#0b2914]", text: "text-[var(--color-brand-600)] dark:text-[var(--color-brand-300)]", dot: "text-[var(--color-brand-500)]" },
  ABSENT: { bg: "bg-[var(--color-coral-100)] dark:bg-[#3a1818]", text: "text-[var(--color-coral-500)] dark:text-[var(--color-coral-400)]", dot: "text-[var(--color-coral-500)]" },
  LATE: { bg: "bg-[var(--color-amber-100)] dark:bg-[#3a2f17]", text: "text-[var(--color-amber-500)] dark:text-[var(--color-amber-400)]", dot: "text-[var(--color-amber-500)]" },
  HALF_DAY: { bg: "bg-[var(--color-amber-100)] dark:bg-[#3a2f17]", text: "text-[var(--color-amber-500)] dark:text-[var(--color-amber-400)]", dot: "text-[var(--color-amber-500)]" },
  ON_LEAVE: { bg: "bg-[var(--surface-sunken)]", text: "text-[var(--text-secondary)]", dot: "text-[var(--text-secondary)]" },

  OPEN: { bg: "bg-[var(--color-coral-100)] dark:bg-[#3a1818]", text: "text-[var(--color-coral-500)] dark:text-[var(--color-coral-400)]", dot: "text-[var(--color-coral-500)]" },
  ASSIGNED: { bg: "bg-[var(--color-amber-100)] dark:bg-[#3a2f17]", text: "text-[var(--color-amber-500)] dark:text-[var(--color-amber-400)]", dot: "text-[var(--color-amber-500)]" },
  IN_PROGRESS: { bg: "bg-[var(--color-amber-100)] dark:bg-[#3a2f17]", text: "text-[var(--color-amber-500)] dark:text-[var(--color-amber-400)]", dot: "text-[var(--color-amber-500)]" },
  RESOLVED: { bg: "bg-[var(--color-brand-100)] dark:bg-[#0b2914]", text: "text-[var(--color-brand-600)] dark:text-[var(--color-brand-300)]", dot: "text-[var(--color-brand-500)]" },
  CLOSED: { bg: "bg-[var(--surface-sunken)]", text: "text-[var(--text-secondary)]", dot: "text-[var(--text-secondary)]" },

  LOW: { bg: "bg-[var(--surface-sunken)]", text: "text-[var(--text-secondary)]", dot: "text-[var(--text-secondary)]" },
  MEDIUM: { bg: "bg-[var(--color-amber-100)] dark:bg-[#3a2f17]", text: "text-[var(--color-amber-500)] dark:text-[var(--color-amber-400)]", dot: "text-[var(--color-amber-500)]" },
  HIGH: { bg: "bg-[var(--color-coral-100)] dark:bg-[#3a1818]", text: "text-[var(--color-coral-500)] dark:text-[var(--color-coral-400)]", dot: "text-[var(--color-coral-500)]" },
  CRITICAL: { bg: "bg-[var(--color-coral-500)]", text: "text-white", dot: "text-white" },
};

const DEFAULT_STYLE = { bg: "bg-[var(--surface-sunken)]", text: "text-[var(--text-secondary)]", dot: "text-[var(--text-secondary)]" };

export default function StatusBadge({ status, pulse = false, label }) {
  const style = STATUS_STYLES[status] || DEFAULT_STYLE;
  const displayLabel = label || status?.replace(/_/g, " ");

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}
    >
      <span className={`${pulse ? "pulse-dot" : "w-2 h-2 rounded-full"} ${style.dot}`} style={!pulse ? { backgroundColor: "currentColor" } : {}} />
      {displayLabel}
    </span>
  );
}
