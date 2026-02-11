export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          organization_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      certifications: {
        Row: {
          affected_competencies: Json | null
          ai_analysis: Json | null
          created_at: string | null
          document_type: string
          employee_id: string
          expiry_date: string | null
          file_name: string | null
          file_path: string | null
          id: string
          is_processed: boolean | null
          is_verified: boolean | null
          issue_date: string | null
          issuer: string | null
          organization_id: string
          processing_error: string | null
          title: string
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          affected_competencies?: Json | null
          ai_analysis?: Json | null
          created_at?: string | null
          document_type: string
          employee_id: string
          expiry_date?: string | null
          file_name?: string | null
          file_path?: string | null
          id?: string
          is_processed?: boolean | null
          is_verified?: boolean | null
          issue_date?: string | null
          issuer?: string | null
          organization_id: string
          processing_error?: string | null
          title: string
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          affected_competencies?: Json | null
          ai_analysis?: Json | null
          created_at?: string | null
          document_type?: string
          employee_id?: string
          expiry_date?: string | null
          file_name?: string | null
          file_path?: string | null
          id?: string
          is_processed?: boolean | null
          is_verified?: boolean | null
          issue_date?: string | null
          issuer?: string | null
          organization_id?: string
          processing_error?: string | null
          title?: string
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certifications_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certifications_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      competencies: {
        Row: {
          artifacts: string[] | null
          cluster_id: string | null
          confidence: string | null
          created_at: string | null
          definition: string | null
          demand_weight: number | null
          future_demand: string | null
          future_demand_max: number | null
          future_demand_min: number | null
          id: string
          name: string
          role_profile_id: string | null
          status: Database["public"]["Enums"]["competency_status"] | null
          tools: string[] | null
          updated_at: string | null
        }
        Insert: {
          artifacts?: string[] | null
          cluster_id?: string | null
          confidence?: string | null
          created_at?: string | null
          definition?: string | null
          demand_weight?: number | null
          future_demand?: string | null
          future_demand_max?: number | null
          future_demand_min?: number | null
          id?: string
          name: string
          role_profile_id?: string | null
          status?: Database["public"]["Enums"]["competency_status"] | null
          tools?: string[] | null
          updated_at?: string | null
        }
        Update: {
          artifacts?: string[] | null
          cluster_id?: string | null
          confidence?: string | null
          created_at?: string | null
          definition?: string | null
          demand_weight?: number | null
          future_demand?: string | null
          future_demand_max?: number | null
          future_demand_min?: number | null
          id?: string
          name?: string
          role_profile_id?: string | null
          status?: Database["public"]["Enums"]["competency_status"] | null
          tools?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competencies_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "competency_clusters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competencies_role_profile_id_fkey"
            columns: ["role_profile_id"]
            isOneToOne: false
            referencedRelation: "role_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      competency_clusters: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          name_de: string | null
          quarter: string
          sort_order: number | null
          updated_at: string | null
          year: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          name_de?: string | null
          quarter: string
          sort_order?: number | null
          updated_at?: string | null
          year: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          name_de?: string | null
          quarter?: string
          sort_order?: number | null
          updated_at?: string | null
          year?: number
        }
        Relationships: []
      }
      content_changelog: {
        Row: {
          affected_employees: number | null
          affected_organizations: number | null
          change_summary: string
          changes: Json | null
          content_id: string
          content_type: string
          created_at: string | null
          created_by: string | null
          id: string
          is_published: boolean | null
          published_at: string | null
          quarter: string
          year: number
        }
        Insert: {
          affected_employees?: number | null
          affected_organizations?: number | null
          change_summary: string
          changes?: Json | null
          content_id: string
          content_type: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          quarter: string
          year: number
        }
        Update: {
          affected_employees?: number | null
          affected_organizations?: number | null
          change_summary?: string
          changes?: Json | null
          content_id?: string
          content_type?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          quarter?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "content_changelog_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_competencies: {
        Row: {
          competency_id: string
          current_level: number | null
          demanded_level: number | null
          employee_id: string
          evidence_sources: Json | null
          evidence_summary: string | null
          future_level: number | null
          gap_to_current: number | null
          gap_to_future: number | null
          id: string
          manager_rating: number | null
          rated_at: string | null
          rating_confidence: string | null
          self_rating: number | null
          updated_at: string | null
        }
        Insert: {
          competency_id: string
          current_level?: number | null
          demanded_level?: number | null
          employee_id: string
          evidence_sources?: Json | null
          evidence_summary?: string | null
          future_level?: number | null
          gap_to_current?: number | null
          gap_to_future?: number | null
          id?: string
          manager_rating?: number | null
          rated_at?: string | null
          rating_confidence?: string | null
          self_rating?: number | null
          updated_at?: string | null
        }
        Update: {
          competency_id?: string
          current_level?: number | null
          demanded_level?: number | null
          employee_id?: string
          evidence_sources?: Json | null
          evidence_summary?: string | null
          future_level?: number | null
          gap_to_current?: number | null
          gap_to_future?: number | null
          id?: string
          manager_rating?: number | null
          rated_at?: string | null
          rating_confidence?: string | null
          self_rating?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_competencies_competency_id_fkey"
            columns: ["competency_id"]
            isOneToOne: false
            referencedRelation: "competencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_competencies_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_subskills: {
        Row: {
          current_level: number | null
          employee_id: string
          evidence: string | null
          id: string
          rated_at: string | null
          subskill_id: string
        }
        Insert: {
          current_level?: number | null
          employee_id: string
          evidence?: string | null
          id?: string
          rated_at?: string | null
          subskill_id: string
        }
        Update: {
          current_level?: number | null
          employee_id?: string
          evidence?: string | null
          id?: string
          rated_at?: string | null
          subskill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_subskills_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_subskills_subskill_id_fkey"
            columns: ["subskill_id"]
            isOneToOne: false
            referencedRelation: "subskills"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          age: number | null
          avatar_url: string | null
          career_objective: string | null
          created_at: string | null
          cv_storage_path: string | null
          data_source: string | null
          deleted_at: string | null
          education: string | null
          email: string | null
          firm_experience_years: number | null
          full_name: string
          gdpr_consent_given_at: string | null
          id: string
          is_active: boolean | null
          manager_assessment_path: string | null
          organization_id: string
          overall_score: number | null
          profile_last_updated_at: string | null
          promotion_readiness: number | null
          role_profile_id: string | null
          self_assessment_path: string | null
          target_role_id: string | null
          team_id: string | null
          team_role: string | null
          total_experience_years: number | null
          updated_at: string | null
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          career_objective?: string | null
          created_at?: string | null
          cv_storage_path?: string | null
          data_source?: string | null
          deleted_at?: string | null
          education?: string | null
          email?: string | null
          firm_experience_years?: number | null
          full_name: string
          gdpr_consent_given_at?: string | null
          id?: string
          is_active?: boolean | null
          manager_assessment_path?: string | null
          organization_id: string
          overall_score?: number | null
          profile_last_updated_at?: string | null
          promotion_readiness?: number | null
          role_profile_id?: string | null
          self_assessment_path?: string | null
          target_role_id?: string | null
          team_id?: string | null
          team_role?: string | null
          total_experience_years?: number | null
          updated_at?: string | null
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          career_objective?: string | null
          created_at?: string | null
          cv_storage_path?: string | null
          data_source?: string | null
          deleted_at?: string | null
          education?: string | null
          email?: string | null
          firm_experience_years?: number | null
          full_name?: string
          gdpr_consent_given_at?: string | null
          id?: string
          is_active?: boolean | null
          manager_assessment_path?: string | null
          organization_id?: string
          overall_score?: number | null
          profile_last_updated_at?: string | null
          promotion_readiness?: number | null
          role_profile_id?: string | null
          self_assessment_path?: string | null
          target_role_id?: string | null
          team_id?: string | null
          team_role?: string | null
          total_experience_years?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_role_profile_id_fkey"
            columns: ["role_profile_id"]
            isOneToOne: false
            referencedRelation: "role_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_target_role_id_fkey"
            columns: ["target_role_id"]
            isOneToOne: false
            referencedRelation: "role_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      gdpr_requests: {
        Row: {
          created_at: string | null
          deadline_at: string | null
          employee_id: string | null
          id: string
          organization_id: string | null
          processed_at: string | null
          processed_by: string | null
          request_type: string
          requester_email: string
          response_notes: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          deadline_at?: string | null
          employee_id?: string | null
          id?: string
          organization_id?: string | null
          processed_at?: string | null
          processed_by?: string | null
          request_type: string
          requester_email: string
          response_notes?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          deadline_at?: string | null
          employee_id?: string | null
          id?: string
          organization_id?: string | null
          processed_at?: string | null
          processed_by?: string | null
          request_type?: string
          requester_email?: string
          response_notes?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gdpr_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gdpr_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gdpr_requests_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_modules: {
        Row: {
          completed_at: string | null
          content_url: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_completed: boolean | null
          learning_path_id: string
          sort_order: number | null
          title: string
        }
        Insert: {
          completed_at?: string | null
          content_url?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_completed?: boolean | null
          learning_path_id: string
          sort_order?: number | null
          title: string
        }
        Update: {
          completed_at?: string | null
          content_url?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_completed?: boolean | null
          learning_path_id?: string
          sort_order?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_modules_learning_path_id_fkey"
            columns: ["learning_path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_paths: {
        Row: {
          ai_recommendation_reason: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          employee_id: string
          id: string
          is_ai_generated: boolean | null
          progress_percent: number | null
          started_at: string | null
          target_competency_id: string | null
          target_level: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          ai_recommendation_reason?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          employee_id: string
          id?: string
          is_ai_generated?: boolean | null
          progress_percent?: number | null
          started_at?: string | null
          target_competency_id?: string | null
          target_level?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          ai_recommendation_reason?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          employee_id?: string
          id?: string
          is_ai_generated?: boolean | null
          progress_percent?: number | null
          started_at?: string | null
          target_competency_id?: string | null
          target_level?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_paths_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_paths_target_competency_id_fkey"
            columns: ["target_competency_id"]
            isOneToOne: false
            referencedRelation: "competencies"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          data_processing_agreement_signed_at: string | null
          data_retention_days: number | null
          deleted_at: string | null
          id: string
          logo_url: string | null
          max_employees: number | null
          name: string
          settings: Json | null
          slug: string
          subscription_ends_at: string | null
          subscription_started_at: string | null
          subscription_status:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_processing_agreement_signed_at?: string | null
          data_retention_days?: number | null
          deleted_at?: string | null
          id?: string
          logo_url?: string | null
          max_employees?: number | null
          name: string
          settings?: Json | null
          slug: string
          subscription_ends_at?: string | null
          subscription_started_at?: string | null
          subscription_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_processing_agreement_signed_at?: string | null
          data_retention_days?: number | null
          deleted_at?: string | null
          id?: string
          logo_url?: string | null
          max_employees?: number | null
          name?: string
          settings?: Json | null
          slug?: string
          subscription_ends_at?: string | null
          subscription_started_at?: string | null
          subscription_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          updated_at?: string | null
        }
        Relationships: []
      }
      quarterly_reports: {
        Row: {
          created_at: string | null
          created_by: string | null
          executive_summary: string | null
          full_report_markdown: string | null
          id: string
          is_published: boolean | null
          practice_group: string | null
          published_at: string | null
          quarter: string
          regions: string[] | null
          title: string
          updated_at: string | null
          version: number | null
          year: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          executive_summary?: string | null
          full_report_markdown?: string | null
          id?: string
          is_published?: boolean | null
          practice_group?: string | null
          published_at?: string | null
          quarter: string
          regions?: string[] | null
          title: string
          updated_at?: string | null
          version?: number | null
          year: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          executive_summary?: string | null
          full_report_markdown?: string | null
          id?: string
          is_published?: boolean | null
          practice_group?: string | null
          published_at?: string | null
          quarter?: string
          regions?: string[] | null
          title?: string
          updated_at?: string | null
          version?: number | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "quarterly_reports_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      role_profiles: {
        Row: {
          created_at: string | null
          created_by: string | null
          experience_level: string | null
          id: string
          is_active: boolean | null
          is_published: boolean | null
          market_segment: string | null
          practice_group: string | null
          published_at: string | null
          quarter: string
          regions: string[] | null
          role_key: string
          role_title: string
          updated_at: string | null
          version: number | null
          year: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          experience_level?: string | null
          id?: string
          is_active?: boolean | null
          is_published?: boolean | null
          market_segment?: string | null
          practice_group?: string | null
          published_at?: string | null
          quarter: string
          regions?: string[] | null
          role_key: string
          role_title: string
          updated_at?: string | null
          version?: number | null
          year: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          experience_level?: string | null
          id?: string
          is_active?: boolean | null
          is_published?: boolean | null
          market_segment?: string | null
          practice_group?: string | null
          published_at?: string | null
          quarter?: string
          regions?: string[] | null
          role_key?: string
          role_title?: string
          updated_at?: string | null
          version?: number | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "role_profiles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subskills: {
        Row: {
          competency_id: string | null
          confidence: string | null
          created_at: string | null
          demand_weight: number | null
          description: string | null
          future_demand: string | null
          id: string
          name: string
          name_de: string | null
          sort_order: number | null
          status: Database["public"]["Enums"]["competency_status"] | null
          updated_at: string | null
        }
        Insert: {
          competency_id?: string | null
          confidence?: string | null
          created_at?: string | null
          demand_weight?: number | null
          description?: string | null
          future_demand?: string | null
          id?: string
          name: string
          name_de?: string | null
          sort_order?: number | null
          status?: Database["public"]["Enums"]["competency_status"] | null
          updated_at?: string | null
        }
        Update: {
          competency_id?: string | null
          confidence?: string | null
          created_at?: string | null
          demand_weight?: number | null
          description?: string | null
          future_demand?: string | null
          id?: string
          name?: string
          name_de?: string | null
          sort_order?: number | null
          status?: Database["public"]["Enums"]["competency_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subskills_competency_id_fkey"
            columns: ["competency_id"]
            isOneToOne: false
            referencedRelation: "competencies"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          average_score: number | null
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_archived: boolean | null
          lead_id: string | null
          member_count: number | null
          name: string
          organization_id: string
          priority: number | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          average_score?: number | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_archived?: boolean | null
          lead_id?: string | null
          member_count?: number | null
          name: string
          organization_id: string
          priority?: number | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          average_score?: number | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_archived?: boolean | null
          lead_id?: string | null
          member_count?: number | null
          name?: string
          organization_id?: string
          priority?: number | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          employee_id: string | null
          full_name: string | null
          gdpr_consent_given_at: string | null
          gdpr_consent_version: string | null
          id: string
          is_super_admin: boolean | null
          last_login_at: string | null
          marketing_consent: boolean | null
          organization_id: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          employee_id?: string | null
          full_name?: string | null
          gdpr_consent_given_at?: string | null
          gdpr_consent_version?: string | null
          id: string
          is_super_admin?: boolean | null
          last_login_at?: string | null
          marketing_consent?: boolean | null
          organization_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          employee_id?: string | null
          full_name?: string | null
          gdpr_consent_given_at?: string | null
          gdpr_consent_version?: string | null
          id?: string
          is_super_admin?: boolean | null
          last_login_at?: string | null
          marketing_consent?: boolean | null
          organization_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_employee_score: {
        Args: { p_employee_id: string }
        Returns: number
      }
      get_user_org_id: { Args: never; Returns: string }
      get_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_org_admin: { Args: never; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      log_audit_event: {
        Args: {
          p_action: string
          p_entity_id: string
          p_entity_type: string
          p_new_values?: Json
          p_old_values?: Json
        }
        Returns: undefined
      }
      update_team_stats: { Args: { p_team_id: string }; Returns: undefined }
    }
    Enums: {
      competency_status: "active" | "emerging" | "deprecated"
      profile_status: "draft" | "pending_review" | "approved" | "archived"
      subscription_status: "trial" | "active" | "paused" | "cancelled"
      user_role: "super_admin" | "org_admin" | "employee"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      competency_status: ["active", "emerging", "deprecated"],
      profile_status: ["draft", "pending_review", "approved", "archived"],
      subscription_status: ["trial", "active", "paused", "cancelled"],
      user_role: ["super_admin", "org_admin", "employee"],
    },
  },
} as const
