import { useEffect, useState, useCallback } from "react";
import { Plus, Wrench, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Modal from "../../components/ui/Modal";
import StatusBadge from "../../components/ui/StatusBadge";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import AnimatedRow from "../../components/ui/AnimatedRow";
import { maintenanceService } from "../../services/maintenanceService";
import { machineService } from "../../services/machineService";
import { workerService } from "../../services/workerService";

const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((p) => ({ value: p, label: p }));
const STATUS_OPTIONS = ["OPEN", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((s) => ({ value: s, label: s.replace("_", " ") }));

const emptyForm = { machineId: "", issue: "", description: "", priority: "MEDIUM", technicianId: "", repairDate: "" };

export default function Maintenance() {
  const [tickets, setTickets] = useState([]);
  const [machines, setMachines] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await maintenanceService.getAll({ status: statusFilter || undefined, limit: 50 });
      setTickets(res.data);
    } catch {
      toast.error("Failed to load maintenance tickets.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    machineService.getAll({ limit: 100 }).then((r) => setMachines(r.data)).catch(() => {});
    workerService.getAll({ role: "TECHNICIAN", limit: 100 }).then((r) => setTechnicians(r.data)).catch(() => {});
  }, []);

  const openCreateModal = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (ticket) => {
    setEditing(ticket);
    setForm({
      machineId: ticket.machineId,
      issue: ticket.issue,
      description: ticket.description || "",
      priority: ticket.priority,
      technicianId: ticket.technicianId || "",
      repairDate: ticket.repairDate ? ticket.repairDate.slice(0, 10) : "",
      status: ticket.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, technicianId: form.technicianId || null };
      if (editing) {
        await maintenanceService.update(editing.id, payload);
        toast.success("Ticket updated.");
      } else {
        await maintenanceService.create(payload);
        toast.success("Maintenance ticket created.");
      }
      setModalOpen(false);
      fetchTickets();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await maintenanceService.remove(deleteTarget.id);
      toast.success("Ticket deleted.");
      setDeleteTarget(null);
      fetchTickets();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete ticket.");
    }
  };

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">Maintenance Management</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">Tickets, repairs, and downtime tracking</p>
        </div>
        <Button icon={Plus} onClick={openCreateModal}>Create Ticket</Button>
      </div>

      <Card>
        <div className="p-4 border-b border-[var(--border-subtle)] flex gap-3">
          <Select
            placeholder="All statuses"
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            containerClassName="sm:w-56"
          />
        </div>

        {loading ? (
          <Spinner label="Loading tickets…" />
        ) : tickets.length === 0 ? (
          <EmptyState icon={Wrench} title="No maintenance tickets" description="All machines are running smoothly, or no tickets match this filter." action={<Button icon={Plus} onClick={openCreateModal}>Create Ticket</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--text-secondary)] border-b border-[var(--border-subtle)]">
                  <th className="px-5 py-3 font-medium">Machine</th>
                  <th className="px-5 py-3 font-medium">Issue</th>
                  <th className="px-5 py-3 font-medium">Priority</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Technician</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t, i) => (
                  <AnimatedRow key={t.id} index={i} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--surface-sunken)] transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-[var(--text-primary)]">{t.machine?.machineCode}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{t.machine?.machineName}</p>
                    </td>
                    <td className="px-5 py-3.5 text-[var(--text-secondary)] max-w-xs">{t.issue}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={t.priority} /></td>
                    <td className="px-5 py-3.5"><StatusBadge status={t.status} pulse={t.status === "IN_PROGRESS"} /></td>
                    <td className="px-5 py-3.5 text-[var(--text-secondary)]">{t.technician?.name || <span className="italic">Unassigned</span>}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => openEditModal(t)} className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--color-brand-100)] hover:text-[var(--brand-primary)]">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(t)} className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--color-coral-100)] hover:text-[var(--color-coral-500)]">
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
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Ticket" : "Create Maintenance Ticket"}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} loading={saving}>{editing ? "Save Changes" : "Create Ticket"}</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Machine"
            required
            placeholder="Select a machine"
            options={machines.map((m) => ({ value: m.id, label: `${m.machineCode} — ${m.machineName}` }))}
            value={form.machineId}
            onChange={(e) => setForm({ ...form, machineId: e.target.value })}
            containerClassName="sm:col-span-2"
          />
          <Input label="Issue" required value={form.issue} onChange={(e) => setForm({ ...form, issue: e.target.value })} containerClassName="sm:col-span-2" />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} containerClassName="sm:col-span-2" />
          <Select label="Priority" options={PRIORITY_OPTIONS} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} />
          {editing && (
            <Select label="Status" options={STATUS_OPTIONS} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} />
          )}
          <Select
            label="Assign Technician"
            placeholder="Unassigned"
            options={technicians.map((t) => ({ value: t.id, label: t.name }))}
            value={form.technicianId}
            onChange={(e) => setForm({ ...form, technicianId: e.target.value })}
          />
          <Input label="Repair Date" type="date" value={form.repairDate} onChange={(e) => setForm({ ...form, repairDate: e.target.value })} />
        </form>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Ticket"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-[var(--text-secondary)]">Delete this maintenance ticket? This cannot be undone.</p>
      </Modal>
    </div>
  );
}
