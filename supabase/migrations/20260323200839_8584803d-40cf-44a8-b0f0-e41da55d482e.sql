-- Add cluster_category for cross-role aggregation
ALTER TABLE public.competency_clusters
ADD COLUMN IF NOT EXISTS cluster_category TEXT DEFAULT NULL;

-- Auto-populate based on name patterns for existing clusters
UPDATE public.competency_clusters SET cluster_category = 'deal_execution'
WHERE cluster_category IS NULL AND (
  name ILIKE '%deal execution%' OR name ILIKE '%transaction management%' OR name ILIKE '%transaction execution%' OR name ILIKE '%deal administration%'
);

UPDATE public.competency_clusters SET cluster_category = 'due_diligence'
WHERE cluster_category IS NULL AND (
  name ILIKE '%due diligence%' OR name ILIKE '%quality control%' OR name ILIKE '%quality oversight%'
);

UPDATE public.competency_clusters SET cluster_category = 'technical_lawyering'
WHERE cluster_category IS NULL AND (
  name ILIKE '%technical lawyering%' OR name ILIKE '%negotiation%' OR name ILIKE '%deal structuring%'
);

UPDATE public.competency_clusters SET cluster_category = 'regulatory_clearance'
WHERE cluster_category IS NULL AND (
  name ILIKE '%regulatory clearance%' OR name ILIKE '%deal compliance%' OR name ILIKE '%deal strategy%'
);

UPDATE public.competency_clusters SET cluster_category = 'ai_enabled'
WHERE cluster_category IS NULL AND name ILIKE '%ai-enabled%';

UPDATE public.competency_clusters SET cluster_category = 'legal_tech'
WHERE cluster_category IS NULL AND name ILIKE '%legal technology%';

UPDATE public.competency_clusters SET cluster_category = 'regulatory_governance'
WHERE cluster_category IS NULL AND (
  name ILIKE '%regulatory & ai governance%' OR name ILIKE '%regulatory%ai governance%'
);

UPDATE public.competency_clusters SET cluster_category = 'professional_skills'
WHERE cluster_category IS NULL AND name ILIKE '%professional skills%';

UPDATE public.competency_clusters SET cluster_category = 'leadership'
WHERE cluster_category IS NULL AND name ILIKE '%leadership%';

UPDATE public.competency_clusters SET cluster_category = 'business_development'
WHERE cluster_category IS NULL AND name ILIKE '%business development%';

-- Index for category-based queries
CREATE INDEX IF NOT EXISTS idx_competency_clusters_category
ON public.competency_clusters (cluster_category, quarter, year);

-- Comment
COMMENT ON COLUMN public.competency_clusters.cluster_category IS
  'Logical category for cross-role aggregation. E.g. due_diligence, regulatory_clearance, ai_enabled. Auto-populated from cluster name patterns.';