import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "@/contexts/AuthContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Layouts
import { SuperAdminLayout } from "@/layouts/SuperAdminLayout";
import { AdminLayout } from "@/layouts/AdminLayout";

// Auth Pages
import LoginPage from "@/pages/auth/LoginPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import UnauthorizedPage from "@/pages/auth/UnauthorizedPage";

// Super Admin Pages
import SuperAdminDashboard from "@/pages/super-admin/Dashboard";
import SuperAdminOrganizations from "@/pages/super-admin/Organizations";
import SuperAdminReports from "@/pages/super-admin/Reports";
import SuperAdminRoleProfiles from "@/pages/super-admin/RoleProfiles";
import SuperAdminUsers from "@/pages/super-admin/Users";
import SuperAdminAuditLog from "@/pages/super-admin/AuditLog";
import SuperAdminSettings from "@/pages/super-admin/Settings";
import SuperAdminSystemHealth from "@/pages/super-admin/SystemHealth";

// Org Admin Pages
import AdminDashboard from "@/pages/AdminDashboard";
import TeamsPage from "@/pages/admin/TeamsPage";
import EmployeesPage from "@/pages/admin/EmployeesPage";
import SkillGapPage from "@/pages/admin/SkillGapPage";
import ReportsPage from "@/pages/admin/ReportsPage";
import FutureSkillReportPage from "@/pages/admin/FutureSkillReportPage";
import PlaceholderPage from "@/pages/admin/PlaceholderPage";

// Other
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Super Admin Routes - with Layout */}
      <Route path="/super-admin" element={
        <ProtectedRoute allowedRoles={['super_admin']}>
          <SuperAdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<SuperAdminDashboard />} />
        <Route path="organizations" element={<SuperAdminOrganizations />} />
        <Route path="reports" element={<SuperAdminReports />} />
        <Route path="role-profiles" element={<SuperAdminRoleProfiles />} />
        <Route path="users" element={<SuperAdminUsers />} />
        <Route path="audit-log" element={<SuperAdminAuditLog />} />
        <Route path="system-health" element={<SuperAdminSystemHealth />} />
        <Route path="settings" element={<SuperAdminSettings />} />
      </Route>

      {/* Org Admin Routes - with Sidebar Layout */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['super_admin', 'org_admin']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="teams" element={<TeamsPage />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="skill-gaps" element={<SkillGapPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="reports/future-skill-matrix" element={<FutureSkillReportPage />} />
        <Route path="measures" element={<PlaceholderPage title="Maßnahmen" description="Weiterbildungsmaßnahmen verwalten, Skill-Gaps zuordnen und den Fortschritt tracken." />} />
        <Route path="budget" element={<PlaceholderPage title="Budget & ROI" description="Budget-Übersicht pro Team, ROI-Berechnung und €/Kompetenzpunkt-Analyse." />} />
      </Route>

      {/* Default Redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
