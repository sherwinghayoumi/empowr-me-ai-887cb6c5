import { Header } from "@/components/Header";
import { EmployeeProfile } from "@/components/EmployeeProfile";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ParallaxBackground } from "@/components/ParallaxBackground";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";

const EmployeeDashboard = () => {
  const { profile } = useAuth();
  
  // If the user has an employee_id, use it; otherwise show placeholder
  const employeeId = profile?.employee_id;

  return (
    <div className="min-h-screen bg-background relative">
      <ParallaxBackground intensity="subtle" />
      <Header variant="employee" />

      <main className="container py-8 relative">
        <ScrollReveal>
          {employeeId ? (
            <EmployeeProfile employeeId={employeeId} />
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Skeleton className="w-16 h-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Kein Mitarbeiterprofil verknüpft. Bitte kontaktieren Sie Ihren Administrator.
                </p>
              </div>
            </div>
          )}
        </ScrollReveal>
      </main>
    </div>
  );
};

export default EmployeeDashboard;
