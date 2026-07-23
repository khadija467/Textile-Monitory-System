import { useState } from "react";
import { FileText, Cog, BarChart3, Wrench, CalendarCheck, FileSpreadsheet, FileDown } from "lucide-react";
import toast from "react-hot-toast";
import Card, { CardHeader, CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { reportService } from "../../services/reportService";

const REPORTS = [
  { type: "machines", title: "Machine Report", description: "Status, efficiency, and operator details for every machine.", icon: Cog },
  { type: "production", title: "Production Report", description: "Daily output, targets, efficiency, and defect counts.", icon: BarChart3 },
  { type: "maintenance", title: "Maintenance Report", description: "Tickets, technician assignments, and resolution history.", icon: Wrench },
  { type: "attendance", title: "Attendance Report", description: "Check-in/out times and attendance status by worker.", icon: CalendarCheck },
];

export default function Reports() {
  const [exporting, setExporting] = useState({});

  const handleExport = async (type, format) => {
    const key = `${type}-${format}`;
    setExporting((e) => ({ ...e, [key]: true }));
    try {
      if (format === "excel") await reportService.exportExcel(type);
      else await reportService.exportPDF(type);
      toast.success(`${type} report exported as ${format.toUpperCase()}.`);
    } catch {
      toast.error("Export failed. Please try again.");
    } finally {
      setExporting((e) => ({ ...e, [key]: false }));
    }
  };

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div>
        <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">Reports</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">Generate and export factory reports as PDF or Excel</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {REPORTS.map((r) => (
          <Card key={r.type} stitched>
            <CardHeader title={r.title} subtitle={r.description} icon={r.icon} />
            <CardBody className="flex gap-3">
              <Button
                variant="outline"
                icon={FileSpreadsheet}
                size="sm"
                loading={!!exporting[`${r.type}-excel`]}
                onClick={() => handleExport(r.type, "excel")}
              >
                Export Excel
              </Button>
              <Button
                variant="secondary"
                icon={FileDown}
                size="sm"
                loading={!!exporting[`${r.type}-pdf`]}
                onClick={() => handleExport(r.type, "pdf")}
              >
                Export PDF
              </Button>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader title="About these reports" icon={FileText} />
        <CardBody>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Reports reflect live data at the moment of export. Excel exports include all
            records with full column detail for further analysis; PDF exports are formatted
            for quick printing and sharing.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
