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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      clientes: {
        Row: {
          created_at: string | null
          data_nascimento: string | null
          endereco: string | null
          id: number
          nome: string
          telefone: string | null
        }
        Insert: {
          created_at?: string | null
          data_nascimento?: string | null
          endereco?: string | null
          id?: number
          nome: string
          telefone?: string | null
        }
        Update: {
          created_at?: string | null
          data_nascimento?: string | null
          endereco?: string | null
          id?: number
          nome?: string
          telefone?: string | null
        }
        Relationships: []
      }
      obras: {
        Row: {
          certificado: string | null
          cliente_id: number | null
          colecao: string | null
          created_at: string | null
          id: number
          imagem_path: string | null
          nome: string
          numero_identificacao: string | null
          status: string | null
        }
        Insert: {
          certificado?: string | null
          cliente_id?: number | null
          colecao?: string | null
          created_at?: string | null
          id?: number
          imagem_path?: string | null
          nome: string
          numero_identificacao?: string | null
          status?: string | null
        }
        Update: {
          certificado?: string | null
          cliente_id?: number | null
          colecao?: string | null
          created_at?: string | null
          id?: number
          imagem_path?: string | null
          nome?: string
          numero_identificacao?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "obras_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "aniversariantes_do_dia"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "obras_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          created_at: string | null
          id: number
          imagem_path: string | null
          nome: string
          obra_id: number | null
          quantidade_estoque: number
          tipo_produto: string | null
          valor: number
        }
        Insert: {
          created_at?: string | null
          id?: number
          imagem_path?: string | null
          nome: string
          obra_id?: number | null
          quantidade_estoque?: number
          tipo_produto?: string | null
          valor?: number
        }
        Update: {
          created_at?: string | null
          id?: number
          imagem_path?: string | null
          nome?: string
          obra_id?: number | null
          quantidade_estoque?: number
          tipo_produto?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "produtos_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          auth_id: string | null
          created_at: string | null
          email: string
          id: number
          nome: string
          tipo: string
        }
        Insert: {
          auth_id?: string | null
          created_at?: string | null
          email: string
          id?: number
          nome: string
          tipo: string
        }
        Update: {
          auth_id?: string | null
          created_at?: string | null
          email?: string
          id?: number
          nome?: string
          tipo?: string
        }
        Relationships: []
      }
      vendas: {
        Row: {
          cliente_id: number | null
          created_at: string | null
          data_venda: string
          id: number
          item_id: number
          tipo_item: string
          valor_total: number
          vendedor_auth_id: string | null
        }
        Insert: {
          cliente_id?: number | null
          created_at?: string | null
          data_venda?: string
          id?: number
          item_id: number
          tipo_item: string
          valor_total?: number
          vendedor_auth_id?: string | null
        }
        Update: {
          cliente_id?: number | null
          created_at?: string | null
          data_venda?: string
          id?: number
          item_id?: number
          tipo_item?: string
          valor_total?: number
          vendedor_auth_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "aniversariantes_do_dia"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      aniversariantes_do_dia: {
        Row: {
          data_nascimento: string | null
          endereco: string | null
          id: number | null
          nome: string | null
          telefone: string | null
        }
        Insert: {
          data_nascimento?: string | null
          endereco?: string | null
          id?: number | null
          nome?: string | null
          telefone?: string | null
        }
        Update: {
          data_nascimento?: string | null
          endereco?: string | null
          id?: number | null
          nome?: string | null
          telefone?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      current_user_profile: {
        Args: never
        Returns: {
          email: string
          id: number
          nome: string
          tipo: string
        }[]
      }
      is_user_gerente: { Args: { user_auth_id: string }; Returns: boolean }
      promote_to_gerente: { Args: { target_uuid: string }; Returns: undefined }
      sync_user_to_usuarios: {
        Args: {
          p_auth_id: string
          p_email: string
          p_nome: string
          p_tipo?: string
        }
        Returns: undefined
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
