import { useState } from "react";
import { Header } from "@/components/Header";
import { EmployeeProfile } from "@/components/EmployeeProfile";
import { GlassCard, GlassCardContent } from "@/components/GlassCard";
import { ScrollReveal } from "@/components/ScrollReveal";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { employees, getRoleById, getTeamById, type Employee } from "@/data/mockData";

const EmployeesPage = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Header variant="admin" />
      <main className="container py-8">
        <ScrollReveal>
          <h1 className="text-3xl font-bold text-foreground mb-8">
            Employees (<AnimatedCounter value={employees.length} duration={1000} />)
          </h1>
        </ScrollReveal>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((emp, index) => (
            <ScrollReveal key={emp.id} delay={index * 50}>
              <GlassCard 
                className="hover-lift cursor-pointer" 
                onClick={() => setSelectedEmployee(emp)}
              >
                <GlassCardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold text-primary transition-transform duration-300 hover:scale-110">
                      {emp.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{emp.name}</p>
                      <p className="text-sm text-muted-foreground">{getRoleById(emp.roleId)?.name}</p>
                      <p className="text-xs text-muted-foreground">{getTeamById(emp.teamId)?.name}</p>
                    </div>
                    <Badge 
                      variant={emp.overallScore >= 75 ? "default" : "secondary"}
                      className="backdrop-blur"
                    >
                      {emp.overallScore}%
                    </Badge>
                  </div>
                </GlassCardContent>
              </GlassCard>
            </ScrollReveal>
          ))}
        </div>
      </main>
      <Dialog open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass">
          {selectedEmployee && <EmployeeProfile employee={selectedEmployee} onClose={() => setSelectedEmployee(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeesPage;
