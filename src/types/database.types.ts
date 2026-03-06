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
      backups: {
        Row: {
          created_at: string
          data: string
          id: string
          updated_at: string
          user_id: string
          wallet_data: Json | null
        }
        Insert: {
          created_at?: string
          data: string
          id?: string
          updated_at?: string
          user_id: string
          wallet_data?: Json | null
        }
        Update: {
          created_at?: string
          data?: string
          id?: string
          updated_at?: string
          user_id?: string
          wallet_data?: Json | null
        }
        Relationships: []
      }
      personal_wallet_transfers: {
        Row: {
          amount: number
          createdAt: string
          fromWalletId: string
          fromWalletName: string
          id: string
          toWalletId: string
          toWalletName: string
          userId: string
        }
        Insert: {
          amount: number
          createdAt?: string
          fromWalletId: string
          fromWalletName: string
          id?: string
          toWalletId: string
          toWalletName: string
          userId: string
        }
        Update: {
          amount?: number
          createdAt?: string
          fromWalletId?: string
          fromWalletName?: string
          id?: string
          toWalletId?: string
          toWalletName?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_from_wallet"
            columns: ["fromWalletId"]
            isOneToOne: false
            referencedRelation: "personal_wallets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_to_wallet"
            columns: ["toWalletId"]
            isOneToOne: false
            referencedRelation: "personal_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_wallets: {
        Row: {
          balance: number
          createdAt: string
          id: string
          name: string
          updatedAt: string | null
          userId: string
        }
        Insert: {
          balance?: number
          createdAt?: string
          id?: string
          name: string
          updatedAt?: string | null
          userId: string
        }
        Update: {
          balance?: number
          createdAt?: string
          id?: string
          name?: string
          updatedAt?: string | null
          userId?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          collection: Json | null
          created_at: string
          data: Json | null
          departaments: Json | null
          history: Json | null
          id: number
          image: string | null
          initial_balance: string | null
          members: Json | null
          name: string | null
          type: string | null
          updated_at: string | null
          wallets: Json | null
        }
        Insert: {
          collection?: Json | null
          created_at?: string
          data?: Json | null
          departaments?: Json | null
          history?: Json | null
          id?: number
          image?: string | null
          initial_balance?: string | null
          members?: Json | null
          name?: string | null
          type?: string | null
          updated_at?: string | null
          wallets?: Json | null
        }
        Update: {
          collection?: Json | null
          created_at?: string
          data?: Json | null
          departaments?: Json | null
          history?: Json | null
          id?: number
          image?: string | null
          initial_balance?: string | null
          members?: Json | null
          name?: string | null
          type?: string | null
          updated_at?: string | null
          wallets?: Json | null
        }
        Relationships: []
      }
      test_kawi_facebook: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      wallets: {
        Row: {
          address: string | null
          created_at: string
          id: string
          privateKey: string | null
          updated_at: string | null
          userId: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          privateKey?: string | null
          updated_at?: string | null
          userId?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          privateKey?: string | null
          updated_at?: string | null
          userId?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_users_by_email: {
        Args: { search_email: string }
        Returns: {
          email: string
          id: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
