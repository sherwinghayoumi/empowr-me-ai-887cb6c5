import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { EmployeeFormData } from "@/components/employees/EmployeeFormDialog";

// Initialize employee competencies based on role profile
async function initializeEmployeeCompetencies(employeeId: string, roleProfileId: string) {
  // Get all competencies for this role profile
  const { data: competencies, error: compError } = await supabase
    .from("competencies")
    .select("id, demand_weight, future_demand_max")
    .eq("role_profile_id", roleProfileId);

  if (compError) {
    console.error("Error fetching competencies:", compError);
    return;
  }

  if (!competencies || competencies.length === 0) {
    console.log("No competencies found for role profile:", roleProfileId);
    return;
  }

  // Create employee_competencies with current_level = 0
  const inserts = competencies.map((comp) => ({
    employee_id: employeeId,
    competency_id: comp.id,
    current_level: 0, // Will be filled by assessment
    demanded_level: comp.demand_weight || 50,
    future_level: comp.future_demand_max || comp.demand_weight || 70,
    gap_to_current: comp.demand_weight || 50, // Maximum gap at start
    gap_to_future: comp.future_demand_max || comp.demand_weight || 70,
  }));

  const { error: insertError } = await supabase.from("employee_competencies").insert(inserts);

  if (insertError) {
    console.error("Error initializing competencies:", insertError);
  }
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  const { organization } = useAuth();

  return useMutation({
    mutationFn: async (data: EmployeeFormData) => {
      if (!organization?.id) {
        throw new Error("Keine Organisation gefunden");
      }

      const { data: employee, error } = await supabase
        .from("employees")
        .insert({
          organization_id: organization.id,
          full_name: data.full_name,
          email: data.email || null,
          role_profile_id: data.role_profile_id,
          team_id: data.team_id || null,
          education: data.education || null,
          total_experience_years: data.total_experience_years || null,
          firm_experience_years: data.firm_experience_years || null,
          career_objective: data.career_objective || null,
          age: data.age || null,
          data_source: "admin_upload",
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      // Initialize competencies based on role profile
      await initializeEmployeeCompetencies(employee.id, data.role_profile_id);

      // Log audit event
      await supabase.rpc("log_audit_event", {
        p_action: "create",
        p_entity_type: "employee",
        p_entity_id: employee.id,
        p_new_values: {
          full_name: data.full_name,
          email: data.email,
          role_profile_id: data.role_profile_id,
          team_id: data.team_id,
        },
      });

      return employee;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["org-stats"] });
      toast.success("Mitarbeiter erfolgreich angelegt");
    },
    onError: (error) => {
      console.error("Create employee error:", error);
      toast.error("Fehler beim Anlegen des Mitarbeiters");
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<EmployeeFormData> }) => {
      // Build update object with proper field mapping
      const updateData: Record<string, unknown> = {};
      
      if (data.full_name !== undefined) updateData.full_name = data.full_name;
      if (data.email !== undefined) updateData.email = data.email || null;
      if (data.role_profile_id !== undefined) updateData.role_profile_id = data.role_profile_id;
      if (data.team_id !== undefined) updateData.team_id = data.team_id || null;
      if (data.education !== undefined) updateData.education = data.education || null;
      if (data.total_experience_years !== undefined) updateData.total_experience_years = data.total_experience_years;
      if (data.firm_experience_years !== undefined) updateData.firm_experience_years = data.firm_experience_years;
      if (data.career_objective !== undefined) updateData.career_objective = data.career_objective || null;
      if (data.age !== undefined) updateData.age = data.age;

      const { error } = await supabase
        .from("employees")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      // Log audit event
      await supabase.rpc("log_audit_event", {
        p_action: "update",
        p_entity_type: "employee",
        p_entity_id: id,
        p_new_values: JSON.parse(JSON.stringify(updateData)),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employee", variables.id] });
      toast.success("Änderungen gespeichert");
    },
    onError: (error) => {
      console.error("Update employee error:", error);
      toast.error("Fehler beim Speichern der Änderungen");
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("employees")
        .update({
          is_active: false,
          deleted_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      // Log audit event
      await supabase.rpc("log_audit_event", {
        p_action: "delete",
        p_entity_type: "employee",
        p_entity_id: id,
        p_new_values: JSON.parse(JSON.stringify({ is_active: false, deleted_at: new Date().toISOString() })),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["org-stats"] });
      toast.success("Mitarbeiter archiviert");
    },
    onError: (error) => {
      console.error("Delete employee error:", error);
      toast.error("Fehler beim Archivieren des Mitarbeiters");
    },
  });
}
