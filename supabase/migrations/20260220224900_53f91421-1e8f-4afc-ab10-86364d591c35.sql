-- Tabelle für persistente Kompetenz-Beschreibungen (KI-generiert oder manuell)
CREATE TABLE public.competency_descriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Verknüpfung zur Kompetenz oder zum Subskill über den Namen (exakter DB-Name)
  name_key TEXT NOT NULL UNIQUE,
  -- Typ: 'competency' oder 'subskill'
  description_type TEXT NOT NULL DEFAULT 'competency' CHECK (description_type IN ('competency', 'subskill')),
  -- Deutsche Bezeichnung
  label_de TEXT NOT NULL,
  -- Strukturierte Beschreibungsfelder
  focus TEXT NOT NULL,
  usage_context TEXT NOT NULL,
  relevance TEXT NOT NULL,
  tools TEXT[] DEFAULT '{}',
  -- Metadaten
  is_ai_generated BOOLEAN DEFAULT true,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS aktivieren
ALTER TABLE public.competency_descriptions ENABLE ROW LEVEL SECURITY;

-- Alle eingeloggten Nutzer dürfen lesen (Beschreibungen sind nicht sensibel)
CREATE POLICY "Authenticated users can read competency descriptions"
  ON public.competency_descriptions
  FOR SELECT
  TO authenticated
  USING (true);

-- Nur Super Admins und Org Admins dürfen schreiben
CREATE POLICY "Admins can insert competency descriptions"
  ON public.competency_descriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND (role IN ('super_admin', 'org_admin') OR is_super_admin = true)
    )
  );

CREATE POLICY "Admins can update competency descriptions"
  ON public.competency_descriptions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND (role IN ('super_admin', 'org_admin') OR is_super_admin = true)
    )
  );

-- Updated-at Trigger
CREATE TRIGGER update_competency_descriptions_updated_at
  BEFORE UPDATE ON public.competency_descriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();