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
            foreignKeyName: "sessionchain_attestations_usage_id_fkey"
            columns: ["usage_id"]
            isOneToOne: false
            referencedRelation: "usage_records"
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
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
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
      license_type: ["personal", "commercial", "enterprise"],
      usage_status: ["pending", "active", "completed", "revoked"],
    },
  },
} as const
