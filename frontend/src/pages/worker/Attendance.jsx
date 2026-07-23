import { useEffect, useState } from "react";
import { CalendarCheck } from "lucide-react";
import toast from "react-hot-toast";
import Card from "../../components/ui/Card";
import StatusBadge from "../../components/ui/StatusBadge";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import AnimatedRow from "../../components/ui/AnimatedRow";
import { attendanceService } from "../../services/attendanceService";

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    attendanceService
      .getAll({ limit: 30 })
      .then((res) => setRecords(res.data))
      .catch(() => toast.error("Failed to load attendance history."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div>
        <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">My Attendance</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">Your check-in and check-out history</p>
      </div>

      <Card>
        {loading ? (
          <Spinner label="Loading attendance…" />
        ) : records.length === 0 ? (
          <EmptyState icon={CalendarCheck} title="No attendance records yet" description="Check in from your dashboard to start tracking attendance." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--text-secondary)] border-b border-[var(--border-subtle)]">
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Check In</th>
                  <th className="px-5 py-3 font-medium">Check Out</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <AnimatedRow key={r.id} index={i} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--surface-sunken)] transition-colors">
                    <td className="px-5 py-3.5 font-medium text-[var(--text-primary)]">
                      {new Date(r.date).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-[var(--text-secondary)]">
                      {r.checkIn ? new Date(r.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-[var(--text-secondary)]">
                      {r.checkOut ? new Date(r.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                    </td>
                    <td className="px-5 py-3.5"><StatusBadge status={r.status} /></td>
                  </AnimatedRow>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
