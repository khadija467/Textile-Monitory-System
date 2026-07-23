import { useEffect, useState, useCallback } from "react";
import { Plus, Search, Pencil, Trash2, Thermometer, Gauge, Cog } from "lucide-react";
import toast from "react-hot-toast";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Modal from "../../components/ui/Modal";
import StatusBadge from "../../components/ui/StatusBadge";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";
import AnimatedRow from "../../components/ui/AnimatedRow";
import { machineService } from "../../services/machineService";
import { workerService } from "../../services/workerService";

const STATUS_OPTIONS = ["RUNNING", "IDLE", "FAULTY", "MAINTENANCE", "OFFLINE"].map((s) => ({
  value: s,
  label: s,
}));

const emptyForm = {
  machineCode: "",
  machineName: "",
  machineType: "",
  lineNumber: "",
  department: "",
  status: "IDLE",
  temperature: "",
  rpm: "",
  efficiency: "",
  operatorId: "",
};

export default function Machines() {
  const [machines, setMachines] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1, total: 0 });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchMachines = useCallback(async () => {
    setLoading(true);
    try {
      const res = await machineService.getAll({
        search: search || undefined,
        status: statusFilter || undefined,
        page,
        limit: 8,
      });
      setMachines(res.data);
      setMeta(res.meta);
    } catch {
      toast.error("Failed to load machines.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    fetchMachines();
  }, [fetchMachines]);

  useEffect(() => {
    workerService.getAll({ limit: 100 }).then((res) => setWorkers(res.data)).catch(() => {});
  }, []);

  const openCreateModal = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (machine) => {
    setEditing(machine);
    setForm({
      machineCode: machine.machineCode,
      machineName: machine.machineName,
      machineType: machine.machineType || "",
      lineNumber: machine.lineNumber,
      department: machine.department,
      status: machine.status,
      temperature: machine.temperature,
      rpm: machine.rpm,
      efficiency: machine.efficiency,
      operatorId: machine.operatorId || "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        temperature: Number(form.temperature) || 0,
        rpm: Number(form.rpm) || 0,
        efficiency: Number(form.efficiency) || 0,
        operatorId: form.operatorId || null,
      };
      if (editing) {
        await machineService.update(editing.id, payload);
        toast.success("Machine updated successfully.");
      } else {
        await machineService.create(payload);
        toast.success("Machine added successfully.");
      }
      setModalOpen(false);
      fetchMachines();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await machineService.remove(deleteTarget.id);
      toast.success("Machine deleted.");
      setDeleteTarget(null);
      fetchMachines();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete machine.");
    }
  };

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">Machine Management</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">{meta.total} machines registered</p>
        </div>
        <Button icon={Plus} onClick={openCreateModal}>
          Add Machine
        </Button>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-[var(--border-subtle)]">
          <Input
            icon={Search}
            placeholder="Search by name or code…"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            containerClassName="flex-1"
          />
          <Select
            placeholder="All statuses"
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value);
            }}
            containerClassName="sm:w-48"
          />
        </div>

        {loading ? (
          <Spinner label="Loading machines…" />
        ) : machines.length === 0 ? (
          <EmptyState
            icon={Cog}
            title="No machines found"
            description="Try adjusting your search or filters, or add a new machine."
            action={<Button icon={Plus} onClick={openCreateModal}>Add Machine</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--text-secondary)] border-b border-[var(--border-subtle)]">
                  <th className="px-5 py-3 font-medium">Machine</th>
                  <th className="px-5 py-3 font-medium">Line / Dept</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Metrics</th>
                  <th className="px-5 py-3 font-medium">Operator</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {machines.map((m, i) => (
                  <AnimatedRow
                    key={m.id}
                    index={i}
                    className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--surface-sunken)] transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-[var(--text-primary)]">{m.machineName}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{m.machineCode}</p>
                    </td>
                    <td className="px-5 py-3.5 text-[var(--text-secondary)]">
                      {m.lineNumber} · {m.department}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={m.status} pulse={m.status === "RUNNING"} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                        <span className="flex items-center gap-1">
                          <Thermometer className="w-3.5 h-3.5" /> {Math.round(m.temperature)}°C
                        </span>
                        <span className="flex items-center gap-1">
                          <Gauge className="w-3.5 h-3.5" /> {Math.round(m.efficiency)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[var(--text-secondary)]">
                      {m.operator?.name || <span className="italic">Unassigned</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(m)}
                          className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--color-brand-100)] hover:text-[var(--brand-primary)] transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(m)}
                          className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--color-coral-100)] hover:text-[var(--color-coral-500)] transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </AnimatedRow>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination page={page} totalPages={meta.totalPages} total={meta.total} limit={8} onPageChange={setPage} />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Machine" : "Add New Machine"}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} loading={saving}>{editing ? "Save Changes" : "Add Machine"}</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Machine Code" required value={form.machineCode} onChange={(e) => setForm({ ...form, machineCode: e.target.value })} placeholder="e.g. WV-103" />
          <Input label="Machine Name" required value={form.machineName} onChange={(e) => setForm({ ...form, machineName: e.target.value })} placeholder="e.g. Sulzer Weaving Loom" />
          <Input label="Machine Type" value={form.machineType} onChange={(e) => setForm({ ...form, machineType: e.target.value })} placeholder="e.g. Loom" />
          <Input label="Line Number" required value={form.lineNumber} onChange={(e) => setForm({ ...form, lineNumber: e.target.value })} placeholder="e.g. L1" />
          <Input label="Department" required value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="e.g. Weaving" />
          <Select label="Status" options={STATUS_OPTIONS} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} />
          <Input label="Temperature (°C)" type="number" value={form.temperature} onChange={(e) => setForm({ ...form, temperature: e.target.value })} />
          <Input label="RPM" type="number" value={form.rpm} onChange={(e) => setForm({ ...form, rpm: e.target.value })} />
          <Input label="Efficiency (%)" type="number" value={form.efficiency} onChange={(e) => setForm({ ...form, efficiency: e.target.value })} />
          <Select
            label="Operator"
            placeholder="Unassigned"
            options={workers.map((w) => ({ value: w.id, label: w.name }))}
            value={form.operatorId}
            onChange={(e) => setForm({ ...form, operatorId: e.target.value })}
          />
        </form>
      </Modal>

      {/* Delete confirmation */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Machine"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-[var(--text-secondary)]">
          Are you sure you want to delete <span className="font-medium text-[var(--text-primary)]">{deleteTarget?.machineName}</span>?
          This action cannot be undone and will remove all associated maintenance and production history.
        </p>
      </Modal>
    </div>
  );
}
