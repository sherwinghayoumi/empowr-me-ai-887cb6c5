import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GeneratedLearningPath, SkillGapInput, SaveLearningPathParams } from "@/types/learningPath";
import { toast } from "@/hooks/use-toast";

export function useGenerateLearningPath() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePath = async (input: Omit<SkillGapInput, 'employeeId' | 'employeeName'>): Promise<GeneratedLearningPath> => {
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-learning-path', {
        body: {
          competencyName: input.competencyName,
          competencyDefinition: input.competencyDefinition,
          subskills: input.subskills,
          currentLevel: input.currentLevel,
          targetLevel: input.targetLevel,
          employeeRole: input.employeeRole,
          employeeExperience: input.employeeExperience,
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate learning path');
      }

      return data as GeneratedLearningPath;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generatePath,
    isGenerating
  };
}

export function useSaveLearningPath() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ employeeId, competencyId, learningPath }: SaveLearningPathParams) => {
      // Create the learning path
      const { data: pathData, error: pathError } = await supabase
        .from('learning_paths')
        .insert({
          employee_id: employeeId,
          target_competency_id: competencyId,
          title: learningPath.title,
          description: learningPath.description,
          is_ai_generated: true,
          ai_recommendation_reason: learningPath.aiRecommendationReason,
          progress_percent: 0,
        })
        .select()
        .single();

      if (pathError) throw pathError;

      // Create the learning modules
      const modules = learningPath.modules.map((module, index) => ({
        learning_path_id: pathData.id,
        title: module.title,
        description: `${module.provider} | ${module.level} | ${module.reason}`,
        content_url: module.contentUrl,
        duration_minutes: module.durationMinutes,
        sort_order: module.sortOrder || index + 1,
        is_completed: false,
      }));

      const { error: modulesError } = await supabase
        .from('learning_modules')
        .insert(modules);

      if (modulesError) throw modulesError;

      // Log audit event
      await supabase.rpc('log_audit_event', {
        p_action: 'create',
        p_entity_type: 'learning_path',
        p_entity_id: pathData.id,
        p_new_values: {
          title: learningPath.title,
          is_ai_generated: true,
          modules_count: modules.length,
          employee_id: employeeId,
          competency_id: competencyId,
        }
      });

      return pathData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-paths'] });
      queryClient.invalidateQueries({ queryKey: ['my-learning-paths'] });
      toast({
        title: "Lernpfad gespeichert",
        description: "Der AI-generierte Lernpfad wurde erfolgreich erstellt.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler beim Speichern",
        description: "Der Lernpfad konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  });
}
