import { useEffect, useState } from "react";
import {
  Cog,
  Activity,
  AlertTriangle,
  Wrench,
  Users,
  TrendingUp,
  Gauge,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import StatCard from "../../components/dashboard/StatCard";
import Card, { CardHeader, CardBody } from "../../components/ui/Card";
import Spinner from "../../components/ui/Spinner";
import { dashboardService } from "../../services/dashboardService";

const STATUS_COLORS = {
  RUNNING: "#16a34a",
  IDLE: "#d9a441",
  FAULTY: "#c75d4d",
  MAINTENANCE: "#e2b563",
  OFFLINE: "#aab8bb",
};

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService
      .getAdminDashboard()
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner size="lg" label="Loading dashboard…" />;
  if (!data) return <p className="text-[var(--text-secondary)]">Unable to load dashboard data.</p>;

  const { kpis, charts } = data;
  const efficiencyPct = (kpis.avgEfficiency || 0).toFixed(1);
  const outputPct = kpis.todayTarget
    ? Math.round((kpis.todayOutput / kpis.todayTarget) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Machines" value={kpis.totalMachines} icon={Cog} accent="ink" />
        <StatCard label="Running Now" value={kpis.runningMachines} icon={Activity} accent="emerald" />
        <StatCard label="Faulty Machines" value={kpis.faultyMachines} icon={AlertTriangle} accent="coral" />
        <StatCard label="In Maintenance" value={kpis.maintenanceMachines} icon={Wrench} accent="amber" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total Workforce" value={kpis.totalWorkers} icon={Users} accent="ink" />
        <StatCard
          label="Today's Production"
          value={Math.round(kpis.todayOutput)}
          suffix=" units"
          icon={TrendingUp}
          accent="emerald"
          trend={outputPct - 100 < 0 ? outputPct - 100 : outputPct - 100}
        />
        <StatCard label="Avg. Efficiency" value={efficiencyPct} suffix="%" icon={Gauge} accent="amber" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" stitched>
          <CardHeader title="Production Trends" subtitle="Output vs. target, last 7 days" icon={TrendingUp} />
          <CardBody>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={charts.weeklyProduction}>
                <defs>
                  <linearGradient id="outputGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#16a34a" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="targetGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d9a441" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#d9a441" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: "var(--text-secondary)" }}
                  tickFormatter={(d) => d.slice(5)}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 12, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface-raised)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: 12,
                    fontSize: 13,
                  }}
                />
                <Area type="monotone" dataKey="target" stroke="#d9a441" fill="url(#targetGrad)" strokeWidth={2} name="Target" />
                <Area type="monotone" dataKey="output" stroke="#16a34a" fill="url(#outputGrad)" strokeWidth={2.5} name="Output" />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card stitched>
          <CardHeader title="Machine Status" subtitle="Live distribution" icon={Cog} />
          <CardBody>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={charts.machineStatusDistribution}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {charts.machineStatusDistribution.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || "#aab8bb"} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--surface-raised)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: 12,
                    fontSize: 13,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {charts.machineStatusDistribution.map((s) => (
                <div key={s.status} className="flex items-center gap-2 text-xs">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: STATUS_COLORS[s.status] || "#aab8bb" }}
                  />
                  <span className="text-[var(--text-secondary)]">{s.status}</span>
                  <span className="ml-auto font-medium text-[var(--text-primary)]">{s.count}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Charts row 2 */}
      <Card stitched>
        <CardHeader title="Department Performance" subtitle="Average efficiency by department" icon={Gauge} />
        <CardBody>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={charts.departmentPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis dataKey="department" tick={{ fontSize: 12, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "var(--surface-raised)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 12,
                  fontSize: 13,
                }}
              />
              <Bar dataKey="avgEfficiency" name="Avg Efficiency %" fill="#16a34a" radius={[8, 8, 0, 0]} maxBarSize={56} />
            </BarChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>
    </div>
  );
}
