import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Bell, CheckCheck, Info, AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import { notificationService } from "../../services/notificationService";

const TYPE_CONFIG = {
  INFO: { icon: Info, color: "text-[var(--color-ink-800)]", bg: "bg-[var(--color-slate-100)] dark:bg-[#1a1a1a]" },
  WARNING: { icon: AlertTriangle, color: "text-[var(--color-amber-500)]", bg: "bg-[var(--color-amber-100)] dark:bg-[#3a2f17]" },
  ALERT: { icon: AlertCircle, color: "text-[var(--color-coral-500)]", bg: "bg-[var(--color-coral-100)] dark:bg-[#3a1818]" },
  SUCCESS: { icon: CheckCircle2, color: "text-[var(--color-brand-600)]", bg: "bg-[var(--color-brand-100)] dark:bg-[#0b2914]" },
};

function timeAgo(date) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationService.getAll({ limit: 30 });
      setNotifications(res.data);
    } catch {
      toast.error("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((list) => list.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch {
      toast.error("Could not mark as read.");
    }
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((list) => list.map((n) => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read.");
    } catch {
      toast.error("Something went wrong.");
    }
  };

  return (
    <div className="space-y-5 animate-fade-in-up max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">Notifications</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">Stay updated on machines, stock, and schedules</p>
        </div>
        <Button variant="secondary" size="sm" icon={CheckCheck} onClick={markAllRead}>
          Mark all read
        </Button>
      </div>

      <Card>
        {loading ? (
          <Spinner label="Loading notifications…" />
        ) : notifications.length === 0 ? (
          <EmptyState icon={Bell} title="You're all caught up" description="New alerts and updates will show up here." />
        ) : (
          <div className="divide-y divide-[var(--border-subtle)]">
            {notifications.map((n, i) => {
              const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.INFO;
              const Icon = config.icon;
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.3), ease: "easeOut" }}
                  onClick={() => !n.isRead && markRead(n.id)}
                  className={`flex items-start gap-3.5 p-4 cursor-pointer transition-colors ${
                    n.isRead ? "" : "bg-[var(--surface-sunken)]"
                  } hover:bg-[var(--surface-sunken)]`}
                >
                  <div className={`w-9 h-9 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-[var(--text-primary)]">{n.title}</p>
                      {!n.isRead && <span className="w-2 h-2 rounded-full bg-[var(--brand-primary)] shrink-0" />}
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] mt-0.5">{n.message}</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1.5">{timeAgo(n.createdAt)}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
