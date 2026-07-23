import { useEffect, useState } from "react";
import { Cog, Thermometer, Gauge, Activity } from "lucide-react";
import toast from "react-hot-toast";
import Card from "../../components/ui/Card";
import StatusBadge from "../../components/ui/StatusBadge";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import { machineService } from "../../services/machineService";

export default function MyMachines() {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    machineService
      .getAll({ limit: 50 })
      .then((res) => setMachines(res.data))
      .catch(() => toast.error("Failed to load your machines."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner size="lg" label="Loading your machines…" />;

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div>
        <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">My Machines</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">Machines currently assigned to you</p>
      </div>

      {machines.length === 0 ? (
        <Card>
          <EmptyState icon={Cog} title="No machines assigned" description="Check back once your supervisor assigns machines to you." />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {machines.map((m) => (
            <Card key={m.id} stitched className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-display font-semibold text-[var(--text-primary)]">{m.machineName}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{m.machineCode} · {m.lineNumber}</p>
                </div>
                <StatusBadge status={m.status} pulse={m.status === "RUNNING"} />
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="text-center p-2.5 rounded-xl bg-[var(--surface-sunken)]">
                  <Thermometer className="w-4 h-4 text-[var(--color-amber-500)] mx-auto mb-1" />
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{Math.round(m.temperature)}°C</p>
                  <p className="text-[10px] text-[var(--text-secondary)]">Temp</p>
                </div>
                <div className="text-center p-2.5 rounded-xl bg-[var(--surface-sunken)]">
                  <Activity className="w-4 h-4 text-[var(--brand-primary)] mx-auto mb-1" />
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{m.rpm}</p>
                  <p className="text-[10px] text-[var(--text-secondary)]">RPM</p>
                </div>
                <div className="text-center p-2.5 rounded-xl bg-[var(--surface-sunken)]">
                  <Gauge className="w-4 h-4 text-[var(--color-ink-800)] mx-auto mb-1" />
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{Math.round(m.efficiency)}%</p>
                  <p className="text-[10px] text-[var(--text-secondary)]">Efficiency</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
