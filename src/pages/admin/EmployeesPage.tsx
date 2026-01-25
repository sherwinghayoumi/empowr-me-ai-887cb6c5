import { useState } from "react";
import { Header } from "@/components/Header";
import { EmployeeProfile } from "@/components/EmployeeProfile";
import { GlassCard, GlassCardContent } from "@/components/GlassCard";
import { ScrollReveal } from "@/components/ScrollReveal";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmployees } from "@/hooks/useOrgData";

const EmployeesPage = () => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const { data: employees, isLoading } = useEmployees();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header variant="admin" />
        <main className="container py-8">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header variant="admin" />
      <main className="container py-8">
        <ScrollReveal>
          <h1 className="text-3xl font-bold text-foreground mb-8">
            Mitarbeiter (<AnimatedCounter value={employees?.length || 0} duration={1000} />)
          </h1>
        </ScrollReveal>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees?.map((emp, index) => (
            <ScrollReveal key={emp.id} delay={index * 50}>
              <GlassCard 
                className="hover-lift cursor-pointer" 
                onClick={() => setSelectedEmployeeId(emp.id)}
              >
                <GlassCardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold text-primary transition-transform duration-300 hover:scale-110">
                      {emp.full_name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{emp.full_name}</p>
                      <p className="text-sm text-muted-foreground">{emp.role_profile?.role_title}</p>
                      <p className="text-xs text-muted-foreground">{emp.team?.name}</p>
                    </div>
                    <Badge 
                      variant={(emp.overall_score || 0) >= 75 ? "default" : "secondary"}
                      className="backdrop-blur"
                    >
                      {Math.round(emp.overall_score || 0)}%
                    </Badge>
                  </div>
                </GlassCardContent>
              </GlassCard>
            </ScrollReveal>
          ))}
        </div>
      </main>
      <Dialog open={!!selectedEmployeeId} onOpenChange={() => setSelectedEmployeeId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass">
          {selectedEmployeeId && (
            <EmployeeProfile 
              employeeId={selectedEmployeeId} 
              onClose={() => setSelectedEmployeeId(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeesPage;
