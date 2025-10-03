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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      artists: {
        Row: {
          artist_name: string
          bio: string | null
          created_at: string
          email: string
          id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          artist_name: string
          bio?: string | null
          created_at?: string
          email: string
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          artist_name?: string
          bio?: string | null
          created_at?: string
          email?: string
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      commercial_releases: {
        Row: {
          artist_id: string | null
          artist_name: string
          created_at: string | null
          distributors: Json | null
          id: string
          metadata: Json | null
          openplay_release_id: string
          release_date: string
          status: string | null
          title: string
          total_revenue: number | null
          total_streams: number | null
          total_tracks: number | null
          type: string
          upc: string | null
          updated_at: string | null
        }
        Insert: {
          artist_id?: string | null
          artist_name: string
          created_at?: string | null
          distributors?: Json | null
          id?: string
          metadata?: Json | null
          openplay_release_id: string
          release_date: string
          status?: string | null
          title: string
          total_revenue?: number | null
          total_streams?: number | null
          total_tracks?: number | null
          type: string
          upc?: string | null
          updated_at?: string | null
        }
        Update: {
          artist_id?: string | null
          artist_name?: string
          created_at?: string | null
          distributors?: Json | null
          id?: string
          metadata?: Json | null
          openplay_release_id?: string
          release_date?: string
          status?: string | null
          title?: string
          total_revenue?: number | null
          total_streams?: number | null
          total_tracks?: number | null
          type?: string
          upc?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      commercial_tracks: {
        Row: {
          commercial_release_id: string | null
          created_at: string | null
          duration_seconds: number | null
          estimated_revenue: number | null
          estimated_streams: number | null
          id: string
          isrc: string | null
          last_updated: string | null
          license_id: string | null
          openplay_metadata: Json | null
          openplay_track_id: string
          prominence_score: number | null
          title: string
          track_number: number | null
          updated_at: string | null
          usage_description: string | null
          voice_model_id: string | null
          voice_usage_type: string | null
        }
        Insert: {
          commercial_release_id?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          estimated_revenue?: number | null
          estimated_streams?: number | null
          id?: string
          isrc?: string | null
          last_updated?: string | null
          license_id?: string | null
          openplay_metadata?: Json | null
          openplay_track_id: string
          prominence_score?: number | null
          title: string
          track_number?: number | null
          updated_at?: string | null
          usage_description?: string | null
          voice_model_id?: string | null
          voice_usage_type?: string | null
        }
        Update: {
          commercial_release_id?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          estimated_revenue?: number | null
          estimated_streams?: number | null
          id?: string
          isrc?: string | null
          last_updated?: string | null
          license_id?: string | null
          openplay_metadata?: Json | null
          openplay_track_id?: string
          prominence_score?: number | null
          title?: string
          track_number?: number | null
          updated_at?: string | null
          usage_description?: string | null
          voice_model_id?: string | null
          voice_usage_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commercial_tracks_commercial_release_id_fkey"
            columns: ["commercial_release_id"]
            isOneToOne: false
            referencedRelation: "commercial_releases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_tracks_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "licenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_tracks_voice_model_id_fkey"
            columns: ["voice_model_id"]
            isOneToOne: false
            referencedRelation: "me_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_tracks_voice_model_id_fkey"
            columns: ["voice_model_id"]
            isOneToOne: false
            referencedRelation: "voice_model_commercial_summary"
            referencedColumns: ["voice_model_id"]
          },
        ]
      }
      licenses: {
        Row: {
          expires_at: string | null
          id: string
          is_active: boolean | null
          issued_at: string
          license_token: string | null
          license_type: Database["public"]["Enums"]["license_type"]
          licensee_email: string
          model_id: string
          terms: Json | null
        }
        Insert: {
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          issued_at?: string
          license_token?: string | null
          license_type: Database["public"]["Enums"]["license_type"]
          licensee_email: string
          model_id: string
          terms?: Json | null
        }
        Update: {
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          issued_at?: string
          license_token?: string | null
          license_type?: Database["public"]["Enums"]["license_type"]
          licensee_email?: string
          model_id?: string
          terms?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "licenses_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "me_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "licenses_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "voice_model_commercial_summary"
            referencedColumns: ["voice_model_id"]
          },
        ]
      }
      me_models: {
        Row: {
          artist_id: string
          canonical_name: string
          created_at: string
          description: string | null
          exclusions: string | null
          id: string
          is_active: boolean | null
          model_name: string
          provenance: Json | null
          sample_url: string | null
          updated_at: string
        }
        Insert: {
          artist_id: string
          canonical_name: string
          created_at?: string
          description?: string | null
          exclusions?: string | null
          id?: string
          is_active?: boolean | null
          model_name: string
          provenance?: Json | null
          sample_url?: string | null
          updated_at?: string
        }
        Update: {
          artist_id?: string
          canonical_name?: string
          created_at?: string
          description?: string | null
          exclusions?: string | null
          id?: string
          is_active?: boolean | null
          model_name?: string
          provenance?: Json | null
          sample_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "me_models_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      model_provenance: {
        Row: {
          attestation_data: Json
          block_number: number | null
          chain_id: string | null
          id: string
          metadata: Json | null
          model_id: string
          provenance_hash: string
          transaction_hash: string | null
          verified_at: string
          verifier: string | null
        }
        Insert: {
          attestation_data: Json
          block_number?: number | null
          chain_id?: string | null
          id?: string
          metadata?: Json | null
          model_id: string
          provenance_hash: string
          transaction_hash?: string | null
          verified_at?: string
          verifier?: string | null
        }
        Update: {
          attestation_data?: Json
          block_number?: number | null
          chain_id?: string | null
          id?: string
          metadata?: Json | null
          model_id?: string
          provenance_hash?: string
          transaction_hash?: string | null
          verified_at?: string
          verifier?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "model_provenance_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "me_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_provenance_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "voice_model_commercial_summary"
            referencedColumns: ["voice_model_id"]
          },
        ]
      }
      openplay_webhook_events: {
        Row: {
          created_at: string | null
          error_message: string | null
          event_id: string
          event_type: string
          id: string
          payload: Json
          processed: boolean | null
          processed_at: string | null
          signature: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          event_id: string
          event_type: string
          id?: string
          payload: Json
          processed?: boolean | null
          processed_at?: string | null
          signature?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          event_id?: string
          event_type?: string
          id?: string
          payload?: Json
          processed?: boolean | null
          processed_at?: string | null
          signature?: string | null
        }
        Relationships: []
      }
      partner_api_keys: {
        Row: {
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          partner_id: string
          rate_limit_per_minute: number | null
          scopes: string[] | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          partner_id: string
          rate_limit_per_minute?: number | null
          scopes?: string[] | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          partner_id?: string
          rate_limit_per_minute?: number | null
          scopes?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_api_keys_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_model_access: {
        Row: {
          access_type: string | null
          expires_at: string | null
          granted_at: string
          granted_by: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          model_id: string
          partner_id: string
        }
        Insert: {
          access_type?: string | null
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          model_id: string
          partner_id: string
        }
        Update: {
          access_type?: string | null
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          model_id?: string
          partner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_model_access_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "me_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_model_access_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "voice_model_commercial_summary"
            referencedColumns: ["voice_model_id"]
          },
          {
            foreignKeyName: "partner_model_access_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_organizations: {
        Row: {
          contact_email: string
          created_at: string
          id: string
          logo_url: string | null
          metadata: Json | null
          name: string
          slug: string
          status: string | null
          tier: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          contact_email: string
          created_at?: string
          id?: string
          logo_url?: string | null
          metadata?: Json | null
          name: string
          slug: string
          status?: string | null
          tier?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          contact_email?: string
          created_at?: string
          id?: string
          logo_url?: string | null
          metadata?: Json | null
          name?: string
          slug?: string
          status?: string | null
          tier?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      partner_users: {
        Row: {
          created_at: string
          id: string
          partner_id: string
          role: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          partner_id: string
          role?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          partner_id?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_users_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      release_distributions: {
        Row: {
          availability_countries: Json | null
          commercial_release_id: string | null
          created_at: string | null
          id: string
          last_updated: string | null
          platform: string
          platform_revenue: number | null
          platform_streams: number | null
          release_date_platform: string | null
          status: string | null
          store_url: string | null
          updated_at: string | null
        }
        Insert: {
          availability_countries?: Json | null
          commercial_release_id?: string | null
          created_at?: string | null
          id?: string
          last_updated?: string | null
          platform: string
          platform_revenue?: number | null
          platform_streams?: number | null
          release_date_platform?: string | null
          status?: string | null
          store_url?: string | null
          updated_at?: string | null
        }
        Update: {
          availability_countries?: Json | null
          commercial_release_id?: string | null
          created_at?: string | null
          id?: string
          last_updated?: string | null
          platform?: string
          platform_revenue?: number | null
          platform_streams?: number | null
          release_date_platform?: string | null
          status?: string | null
          store_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "release_distributions_commercial_release_id_fkey"
            columns: ["commercial_release_id"]
            isOneToOne: false
            referencedRelation: "commercial_releases"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_reconciliation: {
        Row: {
          commercial_track_id: string | null
          created_at: string | null
          id: string
          investigated_at: string | null
          investigated_by: string | null
          license_revenue: number | null
          notes: string | null
          openplay_revenue: number | null
          openplay_streams: number | null
          period_end: string
          period_start: string
          reconciliation_status: string | null
          updated_at: string | null
          variance_amount: number | null
          variance_percentage: number | null
        }
        Insert: {
          commercial_track_id?: string | null
          created_at?: string | null
          id?: string
          investigated_at?: string | null
          investigated_by?: string | null
          license_revenue?: number | null
          notes?: string | null
          openplay_revenue?: number | null
          openplay_streams?: number | null
          period_end: string
          period_start: string
          reconciliation_status?: string | null
          updated_at?: string | null
          variance_amount?: number | null
          variance_percentage?: number | null
        }
        Update: {
          commercial_track_id?: string | null
          created_at?: string | null
          id?: string
          investigated_at?: string | null
          investigated_by?: string | null
          license_revenue?: number | null
          notes?: string | null
          openplay_revenue?: number | null
          openplay_streams?: number | null
          period_end?: string
          period_start?: string
          reconciliation_status?: string | null
          updated_at?: string | null
          variance_amount?: number | null
          variance_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "revenue_reconciliation_commercial_track_id_fkey"
            columns: ["commercial_track_id"]
            isOneToOne: false
            referencedRelation: "commercial_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      sessionchain_attestations: {
        Row: {
          attestation_hash: string
          attested_at: string
          id: string
          model_id: string
          payload: Json
          usage_id: string | null
        }
        Insert: {
          attestation_hash: string
          attested_at?: string
          id?: string
          model_id: string
          payload: Json
          usage_id?: string | null
        }
        Update: {
          attestation_hash?: string
          attested_at?: string
          id?: string
          model_id?: string
          payload?: Json
          usage_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessionchain_attestations_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "me_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessionchain_attestations_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "voice_model_commercial_summary"
            referencedColumns: ["voice_model_id"]
          },
          {
            foreignKeyName: "sessionchain_attestations_usage_id_fkey"
            columns: ["usage_id"]
            isOneToOne: false
            referencedRelation: "usage_records"
            referencedColumns: ["id"]
          },
        ]
      }
      training_sessions: {
        Row: {
          completed_at: string | null
          data_summary: Json | null
          id: string
          metadata: Json | null
          model_id: string
          session_type: string | null
          started_at: string
          status: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          data_summary?: Json | null
          id?: string
          metadata?: Json | null
          model_id: string
          session_type?: string | null
          started_at?: string
          status?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          data_summary?: Json | null
          id?: string
          metadata?: Json | null
          model_id?: string
          session_type?: string | null
          started_at?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_sessions_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "me_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_sessions_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "voice_model_commercial_summary"
            referencedColumns: ["voice_model_id"]
          },
        ]
      }
      training_uploads: {
        Row: {
          extracted_features: Json | null
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          processed_at: string | null
          processing_status: string | null
          session_id: string
          uploaded_at: string
        }
        Insert: {
          extracted_features?: Json | null
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          processed_at?: string | null
          processing_status?: string | null
          session_id: string
          uploaded_at?: string
        }
        Update: {
          extracted_features?: Json | null
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          processed_at?: string | null
          processing_status?: string | null
          session_id?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_uploads_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "training_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_records: {
        Row: {
          id: string
          license_id: string
          model_id: string
          recorded_at: string
          status: Database["public"]["Enums"]["usage_status"]
          usage_metadata: Json | null
        }
        Insert: {
          id?: string
          license_id: string
          model_id: string
          recorded_at?: string
          status?: Database["public"]["Enums"]["usage_status"]
          usage_metadata?: Json | null
        }
        Update: {
          id?: string
          license_id?: string
          model_id?: string
          recorded_at?: string
          status?: Database["public"]["Enums"]["usage_status"]
          usage_metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_records_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "licenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_records_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "me_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_records_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "voice_model_commercial_summary"
            referencedColumns: ["voice_model_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      voice_model_analytics: {
        Row: {
          average_prominence: number | null
          created_at: string | null
          id: string
          period_end: string
          period_start: string
          platform_breakdown: Json | null
          total_commercial_releases: number | null
          total_commercial_revenue: number | null
          total_commercial_streams: number | null
          total_commercial_tracks: number | null
          updated_at: string | null
          usage_type_breakdown: Json | null
          voice_model_id: string | null
        }
        Insert: {
          average_prominence?: number | null
          created_at?: string | null
          id?: string
          period_end: string
          period_start: string
          platform_breakdown?: Json | null
          total_commercial_releases?: number | null
          total_commercial_revenue?: number | null
          total_commercial_streams?: number | null
          total_commercial_tracks?: number | null
          updated_at?: string | null
          usage_type_breakdown?: Json | null
          voice_model_id?: string | null
        }
        Update: {
          average_prominence?: number | null
          created_at?: string | null
          id?: string
          period_end?: string
          period_start?: string
          platform_breakdown?: Json | null
          total_commercial_releases?: number | null
          total_commercial_revenue?: number | null
          total_commercial_streams?: number | null
          total_commercial_tracks?: number | null
          updated_at?: string | null
          usage_type_breakdown?: Json | null
          voice_model_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voice_model_analytics_voice_model_id_fkey"
            columns: ["voice_model_id"]
            isOneToOne: false
            referencedRelation: "me_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_model_analytics_voice_model_id_fkey"
            columns: ["voice_model_id"]
            isOneToOne: false
            referencedRelation: "voice_model_commercial_summary"
            referencedColumns: ["voice_model_id"]
          },
        ]
      }
    }
    Views: {
      voice_model_commercial_summary: {
        Row: {
          latest_release_date: string | null
          total_releases: number | null
          total_revenue: number | null
          total_streams: number | null
          total_tracks: number | null
          voice_model_id: string | null
          voice_model_name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "artist" | "partner" | "admin"
      license_type: "personal" | "commercial" | "enterprise"
      usage_status: "pending" | "active" | "completed" | "revoked"
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
      app_role: ["artist", "partner", "admin"],
      license_type: ["personal", "commercial", "enterprise"],
      usage_status: ["pending", "active", "completed", "revoked"],
    },
  },
} as const
