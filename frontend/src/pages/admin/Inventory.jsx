import { useEffect, useState, useCallback } from "react";
import { Plus, Search, Pencil, Trash2, Boxes, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Modal from "../../components/ui/Modal";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";
import AnimatedRow from "../../components/ui/AnimatedRow";
import { inventoryService } from "../../services/inventoryService";

const CATEGORY_OPTIONS = ["SPARE_PART", "MOTOR", "NEEDLE", "OIL", "CHEMICAL", "YARN", "FABRIC", "OTHER"].map((c) => ({
  value: c,
  label: c.replace("_", " "),
}));

const emptyForm = { itemName: "", itemCode: "", category: "SPARE_PART", quantity: 0, minimumStock: 10, unit: "pcs", supplier: "", unitPrice: 0, location: "" };

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1, total: 0 });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await inventoryService.getAll({
        search: search || undefined,
        category: category || undefined,
        lowStock: lowStockOnly ? "true" : undefined,
        page,
        limit: 8,
      });
      setItems(res.data);
      setMeta(res.meta);
    } catch {
      toast.error("Failed to load inventory.");
    } finally {
      setLoading(false);
    }
  }, [search, category, lowStockOnly, page]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const openCreateModal = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditing(item);
    setForm({
      itemName: item.itemName,
      itemCode: item.itemCode,
      category: item.category,
      quantity: item.quantity,
      minimumStock: item.minimumStock,
      unit: item.unit,
      supplier: item.supplier || "",
      unitPrice: item.unitPrice || 0,
      location: item.location || "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, quantity: Number(form.quantity), minimumStock: Number(form.minimumStock), unitPrice: Number(form.unitPrice) };
      if (editing) {
        await inventoryService.update(editing.id, payload);
        toast.success("Item updated.");
      } else {
        await inventoryService.create(payload);
        toast.success("Item added to inventory.");
      }
      setModalOpen(false);
      fetchItems();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await inventoryService.remove(deleteTarget.id);
      toast.success("Item removed.");
      setDeleteTarget(null);
      fetchItems();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete item.");
    }
  };

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">Inventory Management</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">Spare parts, motors, needles, oils & chemicals</p>
        </div>
        <Button icon={Plus} onClick={openCreateModal}>Add Item</Button>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-[var(--border-subtle)]">
          <Input icon={Search} placeholder="Search item name or code…" value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} containerClassName="flex-1" />
          <Select placeholder="All categories" options={CATEGORY_OPTIONS} value={category} onChange={(e) => { setPage(1); setCategory(e.target.value); }} containerClassName="sm:w-48" />
          <label className="flex items-center gap-2 px-3 text-sm text-[var(--text-secondary)] cursor-pointer select-none whitespace-nowrap">
            <input type="checkbox" checked={lowStockOnly} onChange={(e) => { setPage(1); setLowStockOnly(e.target.checked); }} className="w-4 h-4 rounded accent-[var(--brand-primary)]" />
            Low stock only
          </label>
        </div>

        {loading ? (
          <Spinner label="Loading inventory…" />
        ) : items.length === 0 ? (
          <EmptyState icon={Boxes} title="No inventory items" description="Add spare parts, oils, or chemicals to start tracking stock." action={<Button icon={Plus} onClick={openCreateModal}>Add Item</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--text-secondary)] border-b border-[var(--border-subtle)]">
                  <th className="px-5 py-3 font-medium">Item</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Stock</th>
                  <th className="px-5 py-3 font-medium">Supplier</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => {
                  const low = item.quantity <= item.minimumStock;
                  return (
                    <AnimatedRow key={item.id} index={i} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--surface-sunken)] transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-[var(--text-primary)]">{item.itemName}</p>
                        <p className="text-xs text-[var(--text-secondary)]">{item.itemCode}</p>
                      </td>
                      <td className="px-5 py-3.5 text-[var(--text-secondary)]">{item.category.replace("_", " ")}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${low ? "text-[var(--color-coral-500)]" : "text-[var(--text-primary)]"}`}>
                            {item.quantity} {item.unit}
                          </span>
                          {low && (
                            <span className="inline-flex items-center gap-1 text-xs text-[var(--color-coral-500)] bg-[var(--color-coral-100)] dark:bg-[#3a1818] px-2 py-0.5 rounded-full">
                              <AlertTriangle className="w-3 h-3" /> Low
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--text-secondary)]">Min: {item.minimumStock}</p>
                      </td>
                      <td className="px-5 py-3.5 text-[var(--text-secondary)]">{item.supplier || "—"}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => openEditModal(item)} className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--color-brand-100)] hover:text-[var(--brand-primary)]">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteTarget(item)} className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--color-coral-100)] hover:text-[var(--color-coral-500)]">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </AnimatedRow>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination page={page} totalPages={meta.totalPages} total={meta.total} limit={8} onPageChange={setPage} />
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Inventory Item" : "Add Inventory Item"}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} loading={saving}>{editing ? "Save Changes" : "Add Item"}</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Item Name" required value={form.itemName} onChange={(e) => setForm({ ...form, itemName: e.target.value })} />
          <Input label="Item Code" required disabled={!!editing} value={form.itemCode} onChange={(e) => setForm({ ...form, itemCode: e.target.value })} />
          <Select label="Category" options={CATEGORY_OPTIONS} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <Input label="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="pcs, kg, l…" />
          <Input label="Quantity" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
          <Input label="Minimum Stock" type="number" value={form.minimumStock} onChange={(e) => setForm({ ...form, minimumStock: e.target.value })} />
          <Input label="Unit Price (PKR)" type="number" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} />
          <Input label="Supplier" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} />
          <Input label="Storage Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} containerClassName="sm:col-span-2" />
        </form>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Item"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-[var(--text-secondary)]">
          Delete <span className="font-medium text-[var(--text-primary)]">{deleteTarget?.itemName}</span> from inventory?
        </p>
      </Modal>
    </div>
  );
}
