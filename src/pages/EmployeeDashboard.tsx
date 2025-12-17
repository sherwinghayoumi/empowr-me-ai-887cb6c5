import { Header } from "@/components/Header";
import { EmployeeProfile } from "@/components/EmployeeProfile";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ParallaxBackground } from "@/components/ParallaxBackground";
import {
  employees,
  DEFAULT_EMPLOYEE_ID,
  getEmployeeById,
} from "@/data/mockData";

const EmployeeDashboard = () => {
  const employee = getEmployeeById(DEFAULT_EMPLOYEE_ID) || employees[0];

  return (
    <div className="min-h-screen bg-background relative">
      <ParallaxBackground intensity="subtle" />
      <Header variant="employee" />

      <main className="container py-8 relative">
        <ScrollReveal>
          <EmployeeProfile employee={employee} />
        </ScrollReveal>
      </main>
    </div>
  );
};

export default EmployeeDashboard;
