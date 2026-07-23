import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Cog } from "lucide-react";
import Button from "../../components/ui/Button";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--surface)] px-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-16 h-16 rounded-2xl bg-[var(--color-brand-100)] dark:bg-[#0b2914] flex items-center justify-center mb-5"
      >
        <Cog className="w-8 h-8 text-[var(--brand-primary)] animate-spin" style={{ animationDuration: "3s" }} />
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="font-display text-3xl font-bold text-[var(--text-primary)]"
      >
        404
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="text-[var(--text-secondary)] mt-2 max-w-sm"
      >
        This page doesn't exist on the factory floor. Let's get you back on track.
      </motion.p>
      <Button className="mt-6" onClick={() => navigate("/")}>Back to Dashboard</Button>
    </div>
  );
}
