import { useEffect, useState } from "react";
import { TrendingUp, Target, Gauge, AlertCircle } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import Card, { CardHeader, CardBody } from "../../components/ui/Card";
import StatCard from "../../components/dashboard/StatCard";
import Select from "../../components/ui/Select";
import Spinner from "../../components/ui/Spinner";
import { productionService } from "../../services/productionService";

const RANGE_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

export default function Production() {
  const [range, setRange] = useState("weekly");
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    productionService
      .getAnalytics(range)
      .then((res) => setAnalytics(res.data))
      .finally(() => setLoading(false));
  }, [range]);

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">Production Analytics</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">Output, targets, and efficiency over time</p>
        </div>
        <Select options={RANGE_OPTIONS} value={range} onChange={(e) => setRange(e.target.value)} containerClassName="w-40" />
      </div>

      {loading ? (
        <Spinner size="lg" label="Crunching production numbers…" />
      ) : analytics ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Output" value={Math.round(analytics.totalOutput)} suffix=" units" icon={TrendingUp} accent="emerald" />
            <StatCard label="Total Target" value={Math.round(analytics.totalTarget)} suffix=" units" icon={Target} accent="ink" />
            <StatCard label="Avg. Efficiency" value={analytics.avgEfficiency.toFixed(1)} suffix="%" icon={Gauge} accent="amber" />
            <StatCard label="Total Defects" value={analytics.totalDefects} icon={AlertCircle} accent="coral" />
          </div>

          <Card stitched>
            <CardHeader title="Output vs Target Trend" subtitle={`Range: ${range}`} icon={TrendingUp} />
            <CardBody>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={analytics.trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: "var(--text-secondary)" }} tickFormatter={(d) => d.slice(5)} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "var(--surface-raised)", border: "1px solid var(--border-subtle)", borderRadius: 12, fontSize: 13 }} />
                  <Legend />
                  <Line type="monotone" dataKey="output" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 3 }} name="Output" />
                  <Line type="monotone" dataKey="target" stroke="#d9a441" strokeWidth={2} strokeDasharray="5 4" dot={{ r: 3 }} name="Target" />
                </LineChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </>
      ) : (
        <p className="text-[var(--text-secondary)]">No production data available for this range.</p>
      )}
    </div>
  );
}
