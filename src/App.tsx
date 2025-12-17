import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { PageTransition } from "@/components/PageTransition";
import { ParallaxBackground } from "@/components/ParallaxBackground";
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
  const isLoginPage = location.pathname === "/";

  return (
    <>
      {!isLoginPage && <ParallaxBackground intensity="medium" />}
      <PageTransition>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/teams" element={<TeamsPage />} />
          <Route path="/admin/employees" element={<EmployeesPage />} />
          <Route path="/admin/skill-gaps" element={<SkillGapPage />} />
          <Route path="/admin/reports" element={<ReportsPage />} />
          <Route path="/admin/reports/future-skill-matrix" element={<FutureSkillReportPage />} />
          <Route path="/employee" element={<EmployeeDashboard />} />
          <Route path="/employee/skills" element={<MySkillsPage />} />
          <Route path="/employee/learning" element={<MyLearningPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </PageTransition>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
