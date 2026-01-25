import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, UserPlus, Save } from "lucide-react";

const employeeFormSchema = z.object({
  full_name: z.string().min(2, "Name muss mindestens 2 Zeichen haben"),
  email: z.string().email("Ungültige E-Mail-Adresse").optional().or(z.literal("")),
  role_profile_id: z.string().min(1, "Bitte wählen Sie eine Rolle"),
  team_id: z.string().optional(),
  education: z.string().optional(),
  total_experience_years: z.coerce.number().min(0).optional(),
  firm_experience_years: z.coerce.number().min(0).optional(),
  career_objective: z.string().optional(),
  age: z.coerce.number().min(18).max(100).optional(),
});

export type EmployeeFormData = z.infer<typeof employeeFormSchema>;

interface RoleProfile {
  id: string;
  role_title: string;
  role_key: string;
}

interface Team {
  id: string;
  name: string;
}

interface EmployeeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: EmployeeFormData) => Promise<void>;
  isLoading?: boolean;
  roleProfiles: RoleProfile[];
  teams: Team[];
  defaultValues?: Partial<EmployeeFormData>;
  mode?: "create" | "edit";
}

export function EmployeeFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  roleProfiles,
  teams,
  defaultValues,
  mode = "create",
}: EmployeeFormDialogProps) {
  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      full_name: "",
      email: "",
      role_profile_id: "",
      team_id: "",
      education: "",
      total_experience_years: undefined,
      firm_experience_years: undefined,
      career_objective: "",
      age: undefined,
      ...defaultValues,
    },
  });

  // Reset form when dialog opens with new default values
  useEffect(() => {
    if (open) {
      form.reset({
        full_name: "",
        email: "",
        role_profile_id: "",
        team_id: "",
        education: "",
        total_experience_years: undefined,
        firm_experience_years: undefined,
        career_objective: "",
        age: undefined,
        ...defaultValues,
      });
    }
  }, [open, defaultValues, form]);

  const handleSubmit = async (data: EmployeeFormData) => {
    await onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "create" ? (
              <>
                <UserPlus className="w-5 h-5 text-primary" />
                Neuen Mitarbeiter anlegen
              </>
            ) : (
              <>
                <Save className="w-5 h-5 text-primary" />
                Mitarbeiter bearbeiten
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Erfassen Sie die Daten des neuen Mitarbeiters. Kompetenzen werden automatisch basierend auf der Rolle initialisiert."
              : "Aktualisieren Sie die Mitarbeiterdaten."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Vollständiger Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Max Mustermann" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>E-Mail</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="max.mustermann@firma.de" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role_profile_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rolle *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Rolle wählen..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roleProfiles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.role_title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="team_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Team wählen..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Kein Team</SelectItem>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alter</FormLabel>
                    <FormControl>
                      <Input type="number" min={18} max={100} placeholder="30" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="education"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ausbildung</FormLabel>
                    <FormControl>
                      <Input placeholder="z.B. Master of Laws" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="total_experience_years"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gesamterfahrung (Jahre)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} placeholder="5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="firm_experience_years"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Firmenerfahrung (Jahre)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} placeholder="2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="career_objective"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Karriereziel</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Beschreiben Sie die Karriereziele des Mitarbeiters..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Abbrechen
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {mode === "create" ? "Anlegen" : "Speichern"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
