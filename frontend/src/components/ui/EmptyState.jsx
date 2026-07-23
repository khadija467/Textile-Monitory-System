export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-[var(--surface-sunken)] flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-[var(--text-secondary)]" />
        </div>
      )}
      <h4 className="font-display font-semibold text-[var(--text-primary)]">{title}</h4>
      {description && <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
