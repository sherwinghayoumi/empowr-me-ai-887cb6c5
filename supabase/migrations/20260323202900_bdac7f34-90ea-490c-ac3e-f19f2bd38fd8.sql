-- Move sort_order from shared cluster table to role-specific competency table
-- This prevents the "last import wins" problem for cluster ordering

-- 1. Add column
ALTER TABLE public.competencies
ADD COLUMN IF NOT EXISTS cluster_sort_order INTEGER DEFAULT NULL;

-- 2. Backfill from current cluster sort_order
UPDATE public.competencies c
SET cluster_sort_order = cc.sort_order
FROM public.competency_clusters cc
WHERE c.cluster_id = cc.id
  AND c.cluster_sort_order IS NULL
  AND cc.sort_order IS NOT NULL;

-- 3. Index for ordering queries
CREATE INDEX IF NOT EXISTS idx_competencies_cluster_sort_order
ON public.competencies (role_profile_id, cluster_sort_order);

-- Comment
COMMENT ON COLUMN public.competencies.cluster_sort_order IS
  'Role-specific cluster display order. Each role profile can have its own cluster ordering independent of other roles sharing the same cluster.';