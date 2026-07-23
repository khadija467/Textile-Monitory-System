import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";

import Login from "./pages/shared/Login";
import NotFound from "./pages/shared/NotFound";
import Profile from "./pages/shared/Profile";
import Notifications from "./pages/shared/Notifications";

import AdminDashboard from "./pages/admin/Dashboard";
import Machines from "./pages/admin/Machines";
import Workers from "./pages/admin/Workers";
import Maintenance from "./pages/admin/Maintenance";
import Inventory from "./pages/admin/Inventory";
import Production from "./pages/admin/Production";
import Reports from "./pages/admin/Reports";
import Settings from "./pages/admin/Settings";

import WorkerDashboard from "./pages/worker/WorkerDashboard";
import MyMachines from "./pages/worker/MyMachines";
import Attendance from "./pages/worker/Attendance";
import WorkSchedule from "./pages/worker/WorkSchedule";

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "ADMIN" ? "/dashboard" : "/worker-dashboard"} replace />;
}

// Maps the current route to a friendly page title shown in the Topbar.
const PAGE_TITLES = {
  "/dashboard": "Dashboard",
  "/machines": "Machine Management",
  "/workers": "Worker Management",
  "/maintenance": "Maintenance",
  "/inventory": "Inventory",
  "/production": "Production Analytics",
  "/reports": "Reports",
  "/settings": "Settings",
  "/worker-dashboard": "My Dashboard",
  "/my-machines": "My Machines",
  "/attendance": "Attendance",
  "/work-schedule": "Work Schedule",
  "/notifications": "Notifications",
  "/profile": "Profile",
};

function MainLayoutWrapper() {
  const path = window.location.pathname;
  return <MainLayout pageTitle={PAGE_TITLES[path] || "TextileFlow"} />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "var(--surface-raised)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "12px",
                fontSize: "14px",
              },
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<RootRedirect />} />

            {/* Admin routes */}
            <Route
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <MainLayoutWrapper />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<AdminDashboard />} />
              <Route path="/machines" element={<Machines />} />
              <Route path="/workers" element={<Workers />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/production" element={<Production />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Worker routes */}
            <Route
              element={
                <ProtectedRoute allowedRoles={["WORKER", "TECHNICIAN"]}>
                  <MainLayoutWrapper />
                </ProtectedRoute>
              }
            >
              <Route path="/worker-dashboard" element={<WorkerDashboard />} />
              <Route path="/my-machines" element={<MyMachines />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/work-schedule" element={<WorkSchedule />} />
            </Route>

            {/* Shared protected routes (either role) */}
            <Route
              element={
                <ProtectedRoute>
                  <MainLayoutWrapper />
                </ProtectedRoute>
              }
            >
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
