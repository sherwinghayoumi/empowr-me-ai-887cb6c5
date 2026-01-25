import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "@/contexts/AuthContext";
import { PageTransition } from "@/components/PageTransition";
import { ParallaxBackground } from "@/components/ParallaxBackground";
import { ProtectedRoute, AdminRoute, EmployeeRoute } from "@/components/ProtectedRoute";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import UnauthorizedPage from "./pages/auth/UnauthorizedPage";

// App Pages
import Index from "./pages/Index";
import AdminDashboard from "./pages/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import TeamsPage from "./pages/admin/TeamsPage";
import EmployeesPage from "./pages/admin/EmployeesPage";
import SkillGapPage from "./pages/admin/SkillGapPage";
import ReportsPage from "./pages/admin/ReportsPage";
import FutureSkillReportPage from "./pages/admin/FutureSkillReportPage";
import MySkillsPage from "./pages/employee/MySkillsPage";
import MyLearningPage from "./pages/employee/MyLearningPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const location = useLocation();
  const isAuthPage = ['/login', '/forgot-password', '/reset-password', '/unauthorized', '/'].includes(location.pathname);

  return (
    <>
      {!isAuthPage && <ParallaxBackground intensity="medium" />}
      <PageTransition>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/teams" element={<AdminRoute><TeamsPage /></AdminRoute>} />
          <Route path="/admin/employees" element={<AdminRoute><EmployeesPage /></AdminRoute>} />
          <Route path="/admin/skill-gaps" element={<AdminRoute><SkillGapPage /></AdminRoute>} />
          <Route path="/admin/reports" element={<AdminRoute><ReportsPage /></AdminRoute>} />
          <Route path="/admin/reports/future-skill-matrix" element={<AdminRoute><FutureSkillReportPage /></AdminRoute>} />

          {/* Employee Routes */}
          <Route path="/employee" element={<EmployeeRoute><EmployeeDashboard /></EmployeeRoute>} />
          <Route path="/employee/skills" element={<EmployeeRoute><MySkillsPage /></EmployeeRoute>} />
          <Route path="/employee/learning" element={<EmployeeRoute><MyLearningPage /></EmployeeRoute>} />

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </PageTransition>
    </>
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
