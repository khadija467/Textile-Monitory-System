import { useEffect, useState } from "react";
import { Cog, Clock, Target, Bell, CheckCircle2, LogIn, LogOut } from "lucide-react";
import toast from "react-hot-toast";
import Card, { CardHeader, CardBody } from "../../components/ui/Card";
import StatusBadge from "../../components/ui/StatusBadge";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import { dashboardService } from "../../services/dashboardService";
import { attendanceService } from "../../services/attendanceService";
import { useAuth } from "../../context/AuthContext";

export default function WorkerDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = () => {
    dashboardService
      .getWorkerDashboard()
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      await attendanceService.checkIn();
      toast.success("Checked in successfully!");
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to check in.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      await attendanceService.checkOut();
      toast.success("Checked out. Have a good rest!");
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to check out.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Spinner size="lg" label="Loading your dashboard…" />;

  const attendance = data?.todayAttendance;
  const totalTarget = data?.productionToday?.reduce((s, p) => s + p.targetOutput, 0) || 0;
  const totalOutput = data?.productionToday?.reduce((s, p) => s + p.dailyOutput, 0) || 0;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">
          Welcome, {user?.name?.split(" ")[0]} 👋
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">
          Shift: {user?.shiftStart || "08:00"} – {user?.shiftEnd || "17:00"}
        </p>
      </div>

      {/* Attendance card */}
      <Card stitched>
        <CardHeader title="Today's Attendance" icon={Clock} />
        <CardBody>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-[var(--text-secondary)]">Check In</p>
                <p className="font-display font-semibold text-[var(--text-primary)]">
                  {attendance?.checkIn ? new Date(attendance.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-secondary)]">Check Out</p>
                <p className="font-display font-semibold text-[var(--text-primary)]">
                  {attendance?.checkOut ? new Date(attendance.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                </p>
              </div>
              {attendance?.status && <StatusBadge status={attendance.status} />}
            </div>
            <div className="flex gap-2">
              <Button icon={LogIn} size="sm" onClick={handleCheckIn} loading={actionLoading} disabled={!!attendance?.checkIn}>
                Check In
              </Button>
              <Button icon={LogOut} size="sm" variant="secondary" onClick={handleCheckOut} loading={actionLoading} disabled={!attendance?.checkIn || !!attendance?.checkOut}>
                Check Out
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Assigned machines */}
        <Card stitched>
          <CardHeader title="Assigned Machines" icon={Cog} />
          <CardBody>
            {data?.assignedMachines?.length ? (
              <div className="space-y-3">
                {data.assignedMachines.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-sunken)]">
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{m.machineName}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{m.machineCode} · {m.lineNumber}</p>
                    </div>
                    <StatusBadge status={m.status} pulse={m.status === "RUNNING"} />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={Cog} title="No machines assigned yet" description="Your supervisor will assign machines to you soon." />
            )}
          </CardBody>
        </Card>

        {/* Production target */}
        <Card stitched>
          <CardHeader title="Daily Production Target" icon={Target} />
          <CardBody>
            <div className="flex items-end justify-between mb-3">
              <div>
                <p className="text-2xl font-display font-bold text-[var(--text-primary)]">{Math.round(totalOutput)}</p>
                <p className="text-xs text-[var(--text-secondary)]">of {Math.round(totalTarget) || "—"} target units</p>
              </div>
              {totalTarget > 0 && (
                <span className="text-sm font-medium text-[var(--brand-primary)]">
                  {Math.round((totalOutput / totalTarget) * 100)}%
                </span>
              )}
            </div>
            <div className="w-full h-2.5 rounded-full bg-[var(--surface-sunken)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--brand-primary)] transition-all duration-500"
                style={{ width: `${totalTarget ? Math.min((totalOutput / totalTarget) * 100, 100) : 0}%` }}
              />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Notifications preview */}
      <Card stitched>
        <CardHeader title="Recent Notifications" icon={Bell} />
        <CardBody>
          {data?.notifications?.length ? (
            <div className="space-y-2">
              {data.notifications.map((n) => (
                <div key={n.id} className="flex items-start gap-3 p-3 rounded-xl bg-[var(--surface-sunken)]">
                  <CheckCircle2 className="w-4 h-4 text-[var(--brand-primary)] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{n.title}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{n.message}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={Bell} title="No notifications" description="You're all caught up." />
          )}
        </CardBody>
      </Card>
    </div>
  );
}
