import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Cog, Gauge, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import toast from "react-hot-toast";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "", rememberMe: false });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password, form.rememberMe);
      toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);
      const dest = location.state?.from || (user.role === "ADMIN" ? "/dashboard" : "/worker-dashboard");
      navigate(dest, { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || "Unable to log in. Please check your credentials.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--surface)]">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[var(--brand-ink)] overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07]">
          <svg width="100%" height="100%">
            <pattern id="stitch" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="4" cy="4" r="1.4" fill="white" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#stitch)" />
          </svg>
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-500)] flex items-center justify-center font-display font-bold">
              TF
            </div>
            <span className="font-display font-semibold text-lg">TextileFlow</span>
          </div>

          <div>
            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="font-display text-3xl font-bold leading-tight max-w-md"
            >
              Every spindle, loom, and seam — watched in real time.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              className="text-[var(--sidebar-text)] mt-4 max-w-sm leading-relaxed"
            >
              A unified monitoring system for your factory floor: machine health, production
              targets, maintenance, and your people — in one place.
            </motion.p>

            <div className="grid grid-cols-3 gap-4 mt-10 max-w-md">
              {[
                { icon: Cog, label: "Live machine status" },
                { icon: Gauge, label: "Efficiency tracking" },
                { icon: ShieldCheck, label: "Role-based access" },
              ].map(({ icon: Icon, label }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.1, ease: "easeOut" }}
                  className="bg-white/5 rounded-xl p-4"
                >
                  <Icon className="w-5 h-5 text-[var(--color-brand-300)] mb-2" />
                  <p className="text-xs text-[var(--sidebar-text)] leading-tight">{label}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <p className="text-xs text-[var(--sidebar-text)]">
            © {new Date().getFullYear()} TextileFlow Industrial Systems
          </p>
        </div>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-sm"
        >
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-brand-500)] flex items-center justify-center font-display font-bold text-white text-sm">
              TF
            </div>
            <span className="font-display font-semibold text-lg text-[var(--text-primary)]">
              TextileFlow
            </span>
          </div>

          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">Welcome back</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1.5">
            Sign in to your factory dashboard.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <Input
              label="Email address"
              type="email"
              icon={Mail}
              placeholder="you@textilefactory.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                icon={Lock}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3.5 top-[38px] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.rememberMe}
                  onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })}
                  className="w-4 h-4 rounded accent-[var(--brand-primary)]"
                />
                Remember me
              </label>
            </div>

            {error && (
              <p className="text-sm text-[var(--color-coral-500)] bg-[var(--color-coral-100)] dark:bg-[#3a1818] rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" loading={loading}>
              Sign in
            </Button>
          </form>

          <div className="mt-8 p-4 rounded-xl bg-[var(--surface-sunken)] text-xs text-[var(--text-secondary)] leading-relaxed">
            <p className="font-medium text-[var(--text-primary)] mb-1">Demo credentials</p>
            Admin: admin@textilefactory.com · Worker: hassan@textilefactory.com
            <br />
            Password: Password@123
          </div>
        </motion.div>
      </div>
    </div>
  );
}
