import { useAuth } from "../../context/AuthContext";
import Card, { CardHeader, CardBody } from "../../components/ui/Card";
import { User, Mail, Building2, Phone, Clock, Shield } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const initials = user?.name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="space-y-5 animate-fade-in-up max-w-2xl">
      <div>
        <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">My Profile</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">Your account details</p>
      </div>

      <Card>
        <CardBody className="pt-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-brand-500)] text-white flex items-center justify-center text-xl font-display font-bold">
              {initials}
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg text-[var(--text-primary)]">{user?.name}</h3>
              <p className="text-sm text-[var(--text-secondary)]">{user?.department || "No department set"}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Account Information" icon={User} />
        <CardBody className="space-y-4">
          <InfoRow icon={Mail} label="Email" value={user?.email} />
          <InfoRow icon={Shield} label="Role" value={user?.role} />
          <InfoRow icon={Building2} label="Department" value={user?.department || "—"} />
        </CardBody>
      </Card>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-[var(--border-subtle)] last:border-0">
      <Icon className="w-4 h-4 text-[var(--text-secondary)]" />
      <span className="text-sm text-[var(--text-secondary)] w-28">{label}</span>
      <span className="text-sm font-medium text-[var(--text-primary)]">{value}</span>
    </div>
  );
}
