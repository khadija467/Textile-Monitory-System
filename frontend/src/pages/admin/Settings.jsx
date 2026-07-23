import { useState } from "react";
import { User, Moon, Bell, Shield, Save } from "lucide-react";
import toast from "react-hot-toast";
import Card, { CardHeader, CardBody } from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [notifPrefs, setNotifPrefs] = useState({
    machineAlerts: true,
    maintenanceReminders: true,
    lowStockAlerts: true,
    attendanceSummary: false,
  });
  const [profile, setProfile] = useState({ name: user?.name || "", email: user?.email || "" });

  const handleSaveProfile = (e) => {
    e.preventDefault();
    toast.success("Profile preferences saved.");
  };

  const handleSaveNotifs = () => {
    toast.success("Notification preferences saved.");
  };

  return (
    <div className="space-y-5 animate-fade-in-up max-w-3xl">
      <div>
        <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">Settings</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">Manage your profile, appearance, and preferences</p>
      </div>

      <Card>
        <CardHeader title="Profile" subtitle="Your account information" icon={User} />
        <CardBody>
          <form onSubmit={handleSaveProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            <Input label="Email" value={profile.email} disabled />
            <div className="sm:col-span-2">
              <Button type="submit" icon={Save} size="sm">Save Profile</Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Appearance" subtitle="Choose how TextileFlow looks for you" icon={Moon} />
        <CardBody>
          <div className="flex gap-3">
            {["light", "dark"].map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`flex-1 rounded-xl border p-4 text-sm font-medium capitalize transition-colors ${
                  theme === t
                    ? "border-[var(--brand-primary)] bg-[var(--color-brand-100)] text-[var(--brand-primary)] dark:bg-[#0b2914]"
                    : "border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--surface-sunken)]"
                }`}
              >
                {t} mode
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Notification Settings" subtitle="Choose what you want to be notified about" icon={Bell} />
        <CardBody className="space-y-3">
          {[
            { key: "machineAlerts", label: "Machine fault & status alerts" },
            { key: "maintenanceReminders", label: "Scheduled maintenance reminders" },
            { key: "lowStockAlerts", label: "Low stock inventory alerts" },
            { key: "attendanceSummary", label: "Daily attendance summary" },
          ].map((item) => (
            <label key={item.key} className="flex items-center justify-between py-2 cursor-pointer">
              <span className="text-sm text-[var(--text-primary)]">{item.label}</span>
              <input
                type="checkbox"
                checked={notifPrefs[item.key]}
                onChange={(e) => setNotifPrefs({ ...notifPrefs, [item.key]: e.target.checked })}
                className="w-4 h-4 rounded accent-[var(--brand-primary)]"
              />
            </label>
          ))}
          <Button size="sm" icon={Save} onClick={handleSaveNotifs}>Save Preferences</Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Security" subtitle="Your role and access level" icon={Shield} />
        <CardBody>
          <p className="text-sm text-[var(--text-secondary)]">
            You're signed in as <span className="font-medium text-[var(--text-primary)]">{user?.role}</span>.
            Role and permission changes must be made by a system administrator.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
