import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Pencil, Trash2, Users, Mail, Phone } from "lucide-react";
import toast from "react-hot-toast";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Modal from "../../components/ui/Modal";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";
import { workerService } from "../../services/workerService";

const ROLE_OPTIONS = [
  { value: "WORKER", label: "Worker" },
  { value: "TECHNICIAN", label: "Technician" },
  { value: "ADMIN", label: "Admin" },
];

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "WORKER",
  department: "",
  phone: "",
  shiftStart: "08:00",
  shiftEnd: "17:00",
};

export default function Workers() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1, total: 0 });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchWorkers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await workerService.getAll({ search: search || undefined, page, limit: 8 });
      setWorkers(res.data);
      setMeta(res.meta);
    } catch {
      toast.error("Failed to load workers.");
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  const openCreateModal = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (worker) => {
    setEditing(worker);
    setForm({
      name: worker.name,
      email: worker.email,
      password: "",
      role: worker.role,
      department: worker.department || "",
      phone: worker.phone || "",
      shiftStart: worker.shiftStart || "08:00",
      shiftEnd: worker.shiftEnd || "17:00",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await workerService.update(editing.id, payload);
        toast.success("Worker updated successfully.");
      } else {
        await workerService.create(form);
        toast.success("Worker added successfully.");
      }
      setModalOpen(false);
      fetchWorkers();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await workerService.remove(deleteTarget.id);
      toast.success("Worker removed.");
      setDeleteTarget(null);
      fetchWorkers();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete worker.");
    }
  };

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">Worker Management</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">{meta.total} people on record</p>
        </div>
        <Button icon={Plus} onClick={openCreateModal}>Add Worker</Button>
      </div>

      <Card>
        <div className="p-4 border-b border-[var(--border-subtle)]">
          <Input
            icon={Search}
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>

        {loading ? (
          <Spinner label="Loading workers…" />
        ) : workers.length === 0 ? (
          <EmptyState icon={Users} title="No workers found" description="Add your first team member to get started." action={<Button icon={Plus} onClick={openCreateModal}>Add Worker</Button>} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {workers.map((w, i) => (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.35, delay: Math.min(i * 0.05, 0.3), ease: "easeOut" }}
                className="stitch-edge border border-[var(--border-subtle)] rounded-xl p-4 hover:shadow-md hover:shadow-black/5 transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-brand-500)] text-white flex items-center justify-center text-sm font-semibold shrink-0">
                      {w.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--text-primary)] text-sm">{w.name}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{w.department || "—"} · {w.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEditModal(w)} className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--color-brand-100)] hover:text-[var(--brand-primary)]">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setDeleteTarget(w)} className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--color-coral-100)] hover:text-[var(--color-coral-500)]">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 space-y-1 text-xs text-[var(--text-secondary)]">
                  <p className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {w.email}</p>
                  {w.phone && <p className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {w.phone}</p>}
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-[var(--text-secondary)]">Machines: {w._count?.operatedMachines ?? 0}</span>
                  <span className={`px-2 py-0.5 rounded-full ${w.isActive ? "bg-[var(--color-brand-100)] text-[var(--color-brand-600)]" : "bg-[var(--surface-sunken)] text-[var(--text-secondary)]"}`}>
                    {w.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <Pagination page={page} totalPages={meta.totalPages} total={meta.total} limit={8} onPageChange={setPage} />
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Worker" : "Add New Worker"}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} loading={saving}>{editing ? "Save Changes" : "Add Worker"}</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Full Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Email" type="email" required disabled={!!editing} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input
            label={editing ? "New Password (leave blank to keep)" : "Password"}
            type="password"
            required={!editing}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Select label="Role" options={ROLE_OPTIONS} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          <Input label="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="e.g. Weaving" />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Shift Start" type="time" value={form.shiftStart} onChange={(e) => setForm({ ...form, shiftStart: e.target.value })} />
          <Input label="Shift End" type="time" value={form.shiftEnd} onChange={(e) => setForm({ ...form, shiftEnd: e.target.value })} />
        </form>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Remove Worker"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Remove</Button>
          </>
        }
      >
        <p className="text-sm text-[var(--text-secondary)]">
          Remove <span className="font-medium text-[var(--text-primary)]">{deleteTarget?.name}</span> from the system? Their attendance and assignment history will be deleted.
        </p>
      </Modal>
    </div>
  );
}
