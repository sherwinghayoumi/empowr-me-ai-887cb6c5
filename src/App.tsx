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

// Org Admin Pages
import AdminDashboard from "@/pages/AdminDashboard";
import TeamsPage from "@/pages/admin/TeamsPage";
import EmployeesPage from "@/pages/admin/EmployeesPage";
import SkillGapPage from "@/pages/admin/SkillGapPage";
import ReportsPage from "@/pages/admin/ReportsPage";
import FutureSkillReportPage from "@/pages/admin/FutureSkillReportPage";

// Employee Pages
import EmployeeDashboard from "@/pages/EmployeeDashboard";
import MySkillsPage from "@/pages/employee/MySkillsPage";
import MyLearningPage from "@/pages/employee/MyLearningPage";

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
        <Route path="settings" element={<SuperAdminSettings />} />
      </Route>

      {/* Org Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['super_admin', 'org_admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/teams" element={
        <ProtectedRoute allowedRoles={['super_admin', 'org_admin']}>
          <TeamsPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/employees" element={
        <ProtectedRoute allowedRoles={['super_admin', 'org_admin']}>
          <EmployeesPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/skill-gaps" element={
        <ProtectedRoute allowedRoles={['super_admin', 'org_admin']}>
          <SkillGapPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <ProtectedRoute allowedRoles={['super_admin', 'org_admin']}>
          <ReportsPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/reports/future-skill-matrix" element={
        <ProtectedRoute allowedRoles={['super_admin', 'org_admin']}>
          <FutureSkillReportPage />
        </ProtectedRoute>
      } />

      {/* Employee Routes */}
      <Route path="/employee" element={
        <ProtectedRoute allowedRoles={['super_admin', 'org_admin', 'employee']}>
          <EmployeeDashboard />
        </ProtectedRoute>
      } />
      <Route path="/employee/skills" element={
        <ProtectedRoute allowedRoles={['super_admin', 'org_admin', 'employee']}>
          <MySkillsPage />
        </ProtectedRoute>
      } />
      <Route path="/employee/learning" element={
        <ProtectedRoute allowedRoles={['super_admin', 'org_admin', 'employee']}>
          <MyLearningPage />
        </ProtectedRoute>
      } />

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
