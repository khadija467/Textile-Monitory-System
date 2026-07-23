import { useEffect, useState } from "react";
import { ClipboardList, Clock, Cog } from "lucide-react";
import Card, { CardHeader, CardBody } from "../../components/ui/Card";
import StatusBadge from "../../components/ui/StatusBadge";
import Spinner from "../../components/ui/Spinner";
import { useAuth } from "../../context/AuthContext";
import { machineService } from "../../services/machineService";

export default function WorkSchedule() {
  const { user } = useAuth();
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    machineService
      .getAll({ limit: 50 })
      .then((res) => setMachines(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner size="lg" label="Loading your schedule…" />;

  return (
    <div className="space-y-5 animate-fade-in-up max-w-3xl">
      <div>
        <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">Work Schedule</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">Your shift timing and assigned production line</p>
      </div>

      <Card stitched>
        <CardHeader title="Shift Timing" icon={Clock} />
        <CardBody>
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-[var(--text-secondary)]">Shift Start</p>
              <p className="font-display font-semibold text-xl text-[var(--text-primary)]">{user?.shiftStart || "08:00"}</p>
            </div>
            <div className="text-[var(--text-secondary)]">→</div>
            <div>
              <p className="text-xs text-[var(--text-secondary)]">Shift End</p>
              <p className="font-display font-semibold text-xl text-[var(--text-primary)]">{user?.shiftEnd || "17:00"}</p>
            </div>
            <div className="ml-auto px-3 py-1.5 rounded-full bg-[var(--color-brand-100)] dark:bg-[#0b2914] text-[var(--brand-primary)] text-sm font-medium">
              {user?.department || "General"}
            </div>
          </div>
        </CardBody>
      </Card>

      <Card stitched>
        <CardHeader title="Your Production Line" icon={Cog} subtitle="Machines you're scheduled to operate today" />
        <CardBody>
          {machines.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)]">No machines scheduled yet.</p>
          ) : (
            <div className="space-y-2">
              {machines.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-sunken)]">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-[var(--text-secondary)]" />
                    <span className="text-sm text-[var(--text-primary)]">{m.machineName} — {m.lineNumber}</span>
                  </div>
                  <StatusBadge status={m.status} />
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
