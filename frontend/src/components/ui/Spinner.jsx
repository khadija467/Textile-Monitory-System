import { Loader2 } from "lucide-react";

export default function Spinner({ size = "md", label }) {
  const sizes = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-10 h-10" };
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-[var(--text-secondary)]">
      <Loader2 className={`${sizes[size]} animate-spin text-[var(--brand-primary)]`} />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}
