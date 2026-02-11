import { supabase } from "@/integrations/supabase/client";
import type { GeneratedProfile } from "@/types/profileGeneration";

// Helper function for fuzzy name matching (supports EN and DE names)
const normalizeCompetencyName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9äöüß]/g, '')
    .trim();
};

const findBestMatch = (
  aiName: string,
  dbCompetencies: Array<{ name: string; id: string; name_de?: string | null }>
): string | null => {
  const normalized = normalizeCompetencyName(aiName);

  const exactMatch = dbCompetencies.find(c =>
    normalizeCompetencyName(c.name) === normalized ||
    (c.name_de && normalizeCompetencyName(c.name_de) === normalized)
  );
  if (exactMatch) return exactMatch.id;

  const partialMatch = dbCompetencies.find(c => {
    const dbNorm = normalizeCompetencyName(c.name);
    const dbNormDe = c.name_de ? normalizeCompetencyName(c.name_de) : '';
    return dbNorm.includes(normalized) || normalized.includes(dbNorm) ||
           dbNormDe.includes(normalized) || normalized.includes(dbNormDe);
  });
  if (partialMatch) return partialMatch.id;

  const aiWords = aiName.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  for (const dbComp of dbCompetencies) {
    const dbWords = dbComp.name.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const dbWordsDe = dbComp.name_de ? dbComp.name_de.toLowerCase().split(/\s+/).filter(w => w.length > 2) : [];
    const allDbWords = [...dbWords, ...dbWordsDe];
    const commonWords = aiWords.filter(w => allDbWords.some(dw => dw.includes(w) || w.includes(dw)));
    if (commonWords.length >= 2) return dbComp.id;
  }

  return null;
};

export async function saveProfileToDatabase(
  employeeId: string,
  profile: GeneratedProfile
): Promise<{ matched: number; unmatched: string[] }> {
  // Update employee overall_score and promotion_readiness
  const { error } = await supabase
    .from("employees")
    .update({
      overall_score: profile.analysis.overallScore,
      promotion_readiness: profile.analysis.promotionReadiness.readinessPercentage,
      gdpr_consent_given_at: profile.compliance.gdprConsentVerified ? new Date().toISOString() : null,
      profile_last_updated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", employeeId);

  if (error) {
    throw new Error("Fehler beim Speichern des Profils");
  }

  // Get all competencies with their subskills for this employee
  const { data: existingCompetencies, error: fetchError } = await supabase
    .from("employee_competencies")
    .select(`
      id, 
      competency_id,
      competency:competencies(
        id, 
        name,
        subskills:subskills(id, name, name_de)
      )
    `)
    .eq("employee_id", employeeId);

  if (!fetchError && existingCompetencies) {
    const dbCompetencies = existingCompetencies.map(ec => ({
      id: ec.id,
      competencyId: ec.competency_id,
      name: ec.competency?.name || '',
      subskills: (ec.competency?.subskills || []) as Array<{ id: string; name: string; name_de?: string | null }>
    }));

    let matchedCount = 0;
    let unmatchedNames: string[] = [];

    for (const cluster of profile.competencyProfile.clusters) {
      for (const comp of cluster.competencies) {
        const rating = comp.rating === 'NB' ? null : (comp.rating as number) * 20;
        const selfRating = comp.selfRating ? comp.selfRating * 20 : null;
        const managerRating = comp.managerRating ? comp.managerRating * 20 : null;

        const matchId = findBestMatch(comp.name, dbCompetencies);
        const matchedEc = matchId ? dbCompetencies.find(db => db.id === matchId) : null;

        if (matchedEc) {
          matchedCount++;

          await supabase
            .from("employee_competencies")
            .upsert({
              employee_id: employeeId,
              competency_id: matchedEc.competencyId,
              current_level: rating,
              self_rating: selfRating,
              manager_rating: managerRating,
              evidence_summary: comp.evidenceSummary,
              rating_confidence: comp.confidence,
              rated_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'employee_id,competency_id'
            });

          // Process subskills
          if (comp.subskills && comp.subskills.length > 0) {
            for (const aiSubskill of comp.subskills) {
              const subskillRating = aiSubskill.rating === 'NB' ? null : (aiSubskill.rating as number) * 20;

              const extractTitle = (name: string) => {
                const colonIndex = name.indexOf(':');
                return colonIndex > 0 ? name.substring(0, colonIndex).trim() : name.trim();
              };

              const aiTitle = extractTitle(aiSubskill.name);
              const aiNormalized = normalizeCompetencyName(aiTitle);

              const matchedSubskill = matchedEc.subskills.find(dbSub => {
                const dbTitle = extractTitle(dbSub.name);
                const dbNormalized = normalizeCompetencyName(dbTitle);
                const dbDeTitle = dbSub.name_de ? extractTitle(dbSub.name_de) : '';
                const dbDeNormalized = dbDeTitle ? normalizeCompetencyName(dbDeTitle) : '';

                if (dbNormalized === aiNormalized || dbDeNormalized === aiNormalized) return true;

                const getSignificantWords = (str: string) => {
                  const commonWords = ['the', 'and', 'or', 'for', 'to', 'in', 'on', 'at', 'with', 'by'];
                  return str.split(/\s+/)
                    .filter(w => w.length > 2 && !commonWords.includes(w.toLowerCase()))
                    .slice(0, 3)
                    .join(' ');
                };

                const aiWords = getSignificantWords(aiNormalized);
                const dbWords = getSignificantWords(dbNormalized);
                const dbDeWords = dbDeNormalized ? getSignificantWords(dbDeNormalized) : '';

                if (aiWords && dbWords && aiWords === dbWords) return true;
                if (aiWords && dbDeWords && aiWords === dbDeWords) return true;

                if (aiNormalized.length > 15 && dbNormalized.length > 15) {
                  if (dbNormalized.includes(aiNormalized) || aiNormalized.includes(dbNormalized)) return true;
                }

                return false;
              });

              if (matchedSubskill) {
                await supabase
                  .from("employee_subskills")
                  .upsert({
                    employee_id: employeeId,
                    subskill_id: matchedSubskill.id,
                    current_level: subskillRating,
                    evidence: aiSubskill.evidence,
                    rated_at: new Date().toISOString(),
                  }, {
                    onConflict: 'employee_id,subskill_id'
                  });
              }
            }

            // Recalculate competency level from subskill averages
            const subskillIds = matchedEc.subskills.map(s => s.id);
            if (subskillIds.length > 0) {
              const { data: subskillRatings } = await supabase
                .from("employee_subskills")
                .select("current_level")
                .eq("employee_id", employeeId)
                .in("subskill_id", subskillIds);

              if (subskillRatings && subskillRatings.length > 0) {
                const validRatings = subskillRatings.filter(r => r.current_level !== null);
                if (validRatings.length > 0) {
                  const avgLevel = Math.round(
                    validRatings.reduce((sum, r) => sum + (r.current_level || 0), 0) / validRatings.length
                  );

                  await supabase
                    .from("employee_competencies")
                    .update({
                      current_level: avgLevel,
                      updated_at: new Date().toISOString()
                    })
                    .eq("employee_id", employeeId)
                    .eq("competency_id", matchedEc.competencyId);
                }
              }
            }
          }
        } else {
          unmatchedNames.push(comp.name);
        }
      }
    }

    // Log audit event
    await supabase.rpc("log_audit_event", {
      p_action: "ai_profile_generated",
      p_entity_type: "employee",
      p_entity_id: employeeId,
      p_new_values: {
        overall_score: profile.analysis.overallScore,
        promotion_readiness: profile.analysis.promotionReadiness.readinessPercentage,
        strengths: profile.analysis.topStrengths.map((s) => s.competency),
        development_areas: profile.analysis.developmentAreas.map((d) => d.competency),
        matched_competencies: matchedCount,
        unmatched_competencies: unmatchedNames.length,
      },
    });

    return { matched: matchedCount, unmatched: unmatchedNames };
  }

  // Log audit event even if no competencies matched
  await supabase.rpc("log_audit_event", {
    p_action: "ai_profile_generated",
    p_entity_type: "employee",
    p_entity_id: employeeId,
    p_new_values: {
      overall_score: profile.analysis.overallScore,
      promotion_readiness: profile.analysis.promotionReadiness.readinessPercentage,
      strengths: profile.analysis.topStrengths.map((s) => s.competency),
      development_areas: profile.analysis.developmentAreas.map((d) => d.competency),
    },
  });

  return { matched: 0, unmatched: [] };
}

/**
 * Upload documents to Supabase Storage and save paths to employee record
 */
export async function uploadDocumentsToStorage(
  employeeId: string,
  orgId: string,
  documents: { cv: File | null; selfAssessment: File | null; managerAssessment: File | null }
): Promise<void> {
  const uploads: Array<{ file: File; path: string; field: string }> = [];

  if (documents.cv) {
    uploads.push({
      file: documents.cv,
      path: `${orgId}/${employeeId}/cv.pdf`,
      field: 'cv_storage_path',
    });
  }
  if (documents.selfAssessment) {
    uploads.push({
      file: documents.selfAssessment,
      path: `${orgId}/${employeeId}/self_assessment.docx`,
      field: 'self_assessment_path',
    });
  }
  if (documents.managerAssessment) {
    uploads.push({
      file: documents.managerAssessment,
      path: `${orgId}/${employeeId}/manager_assessment.docx`,
      field: 'manager_assessment_path',
    });
  }

  const updateData: Record<string, string> = {};

  for (const upload of uploads) {
    const { error } = await supabase.storage
      .from('documents')
      .upload(upload.path, upload.file, { upsert: true });

    if (error) {
      console.error(`Failed to upload ${upload.field}:`, error);
      continue;
    }
    updateData[upload.field] = upload.path;
  }

  if (Object.keys(updateData).length > 0) {
    await supabase
      .from('employees')
      .update(updateData)
      .eq('id', employeeId);
  }
}

/**
 * Download documents from Supabase Storage and return as File objects
 */
export async function downloadDocumentsFromStorage(
  paths: { cv_storage_path: string | null; self_assessment_path: string | null; manager_assessment_path: string | null }
): Promise<{ cv: File | null; selfAssessment: File | null; managerAssessment: File | null }> {
  const downloadFile = async (path: string | null, filename: string): Promise<File | null> => {
    if (!path) return null;
    const { data, error } = await supabase.storage
      .from('documents')
      .download(path);
    if (error || !data) return null;
    return new File([data], filename, { type: data.type });
  };

  const [cv, selfAssessment, managerAssessment] = await Promise.all([
    downloadFile(paths.cv_storage_path, 'cv.pdf'),
    downloadFile(paths.self_assessment_path, 'self_assessment.docx'),
    downloadFile(paths.manager_assessment_path, 'manager_assessment.docx'),
  ]);

  return { cv, selfAssessment, managerAssessment };
}
