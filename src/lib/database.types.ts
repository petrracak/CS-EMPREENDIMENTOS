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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      empreendimento_caracteristicas: {
        Row: {
          empreendimento_id: string
          id: string
          ordem: number
          texto: string
        }
        Insert: {
          empreendimento_id: string
          id?: string
          ordem?: number
          texto: string
        }
        Update: {
          empreendimento_id?: string
          id?: string
          ordem?: number
          texto?: string
        }
        Relationships: [
          {
            foreignKeyName: "empreendimento_caracteristicas_empreendimento_id_fkey"
            columns: ["empreendimento_id"]
            isOneToOne: false
            referencedRelation: "empreendimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      empreendimento_diferenciais: {
        Row: {
          empreendimento_id: string
          id: string
          ordem: number
          texto: string
        }
        Insert: {
          empreendimento_id: string
          id?: string
          ordem?: number
          texto: string
        }
        Update: {
          empreendimento_id?: string
          id?: string
          ordem?: number
          texto?: string
        }
        Relationships: [
          {
            foreignKeyName: "empreendimento_diferenciais_empreendimento_id_fkey"
            columns: ["empreendimento_id"]
            isOneToOne: false
            referencedRelation: "empreendimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      empreendimento_imagens: {
        Row: {
          categoria: string
          created_at: string
          empreendimento_id: string
          id: string
          legenda: string | null
          ordem: number
          url: string
        }
        Insert: {
          categoria?: string
          created_at?: string
          empreendimento_id: string
          id?: string
          legenda?: string | null
          ordem?: number
          url: string
        }
        Update: {
          categoria?: string
          created_at?: string
          empreendimento_id?: string
          id?: string
          legenda?: string | null
          ordem?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "empreendimento_imagens_empreendimento_id_fkey"
            columns: ["empreendimento_id"]
            isOneToOne: false
            referencedRelation: "empreendimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      empreendimento_referencias: {
        Row: {
          empreendimento_id: string
          id: string
          ordem: number
          texto: string
        }
        Insert: {
          empreendimento_id: string
          id?: string
          ordem?: number
          texto: string
        }
        Update: {
          empreendimento_id?: string
          id?: string
          ordem?: number
          texto?: string
        }
        Relationships: [
          {
            foreignKeyName: "empreendimento_referencias_empreendimento_id_fkey"
            columns: ["empreendimento_id"]
            isOneToOne: false
            referencedRelation: "empreendimentos"
            referencedColumns: ["id"]
          },
        ]
      }
      empreendimentos: {
        Row: {
          area_construida: string | null
          atendimento_chamada: string | null
          bairro: string | null
          botao_primario: string | null
          botao_secundario: string | null
          cidade: string
          conceito: string | null
          created_at: string
          destaque: boolean
          distribuicao: string | null
          endereco: string | null
          frase_impacto: string | null
          historia: string | null
          id: string
          imagem_principal: string | null
          legenda_galeria: string | null
          linha_card: string | null
          localizacao_texto: string | null
          logo_url: string | null
          mapa_imagem: string | null
          mapa_link: string | null
          nome: string
          ordem: number
          previsao_entrega: string | null
          registro_incorporacao: string | null
          seo_descricao: string | null
          seo_titulo: string | null
          situacao: string
          slug: string
          sobre: string | null
          status: string
          subtitulo: string | null
          terreno_area: string | null
          terreno_dimensoes: string | null
          tipo_id: string | null
          unidades_total: string | null
          updated_at: string
          vagas: string | null
          valor_a_partir_de: number | null
        }
        Insert: {
          area_construida?: string | null
          atendimento_chamada?: string | null
          bairro?: string | null
          botao_primario?: string | null
          botao_secundario?: string | null
          cidade?: string
          conceito?: string | null
          created_at?: string
          destaque?: boolean
          distribuicao?: string | null
          endereco?: string | null
          frase_impacto?: string | null
          historia?: string | null
          id?: string
          imagem_principal?: string | null
          legenda_galeria?: string | null
          linha_card?: string | null
          localizacao_texto?: string | null
          logo_url?: string | null
          mapa_imagem?: string | null
          mapa_link?: string | null
          nome: string
          ordem?: number
          previsao_entrega?: string | null
          registro_incorporacao?: string | null
          seo_descricao?: string | null
          seo_titulo?: string | null
          situacao?: string
          slug: string
          sobre?: string | null
          status?: string
          subtitulo?: string | null
          terreno_area?: string | null
          terreno_dimensoes?: string | null
          tipo_id?: string | null
          unidades_total?: string | null
          updated_at?: string
          vagas?: string | null
          valor_a_partir_de?: number | null
        }
        Update: {
          area_construida?: string | null
          atendimento_chamada?: string | null
          bairro?: string | null
          botao_primario?: string | null
          botao_secundario?: string | null
          cidade?: string
          conceito?: string | null
          created_at?: string
          destaque?: boolean
          distribuicao?: string | null
          endereco?: string | null
          frase_impacto?: string | null
          historia?: string | null
          id?: string
          imagem_principal?: string | null
          legenda_galeria?: string | null
          linha_card?: string | null
          localizacao_texto?: string | null
          logo_url?: string | null
          mapa_imagem?: string | null
          mapa_link?: string | null
          nome?: string
          ordem?: number
          previsao_entrega?: string | null
          registro_incorporacao?: string | null
          seo_descricao?: string | null
          seo_titulo?: string | null
          situacao?: string
          slug?: string
          sobre?: string | null
          status?: string
          subtitulo?: string | null
          terreno_area?: string | null
          terreno_dimensoes?: string | null
          tipo_id?: string | null
          unidades_total?: string | null
          updated_at?: string
          vagas?: string | null
          valor_a_partir_de?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "empreendimentos_tipo_id_fkey"
            columns: ["tipo_id"]
            isOneToOne: false
            referencedRelation: "tipos_empreendimento"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          anotacoes: string | null
          consentimento: boolean
          contato: string
          created_at: string
          empreendimento_id: string | null
          id: string
          mensagem: string | null
          nome: string
          origem: string | null
          profissao: string | null
          renda_mensal: string | null
          situacao: string
          unidade_id: string | null
          updated_at: string
          valor_entrada: string | null
        }
        Insert: {
          anotacoes?: string | null
          consentimento?: boolean
          contato: string
          created_at?: string
          empreendimento_id?: string | null
          id?: string
          mensagem?: string | null
          nome: string
          origem?: string | null
          profissao?: string | null
          renda_mensal?: string | null
          situacao?: string
          unidade_id?: string | null
          updated_at?: string
          valor_entrada?: string | null
        }
        Update: {
          anotacoes?: string | null
          consentimento?: boolean
          contato?: string
          created_at?: string
          empreendimento_id?: string | null
          id?: string
          mensagem?: string | null
          nome?: string
          origem?: string | null
          profissao?: string | null
          renda_mensal?: string | null
          situacao?: string
          unidade_id?: string | null
          updated_at?: string
          valor_entrada?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_empreendimento_id_fkey"
            columns: ["empreendimento_id"]
            isOneToOne: false
            referencedRelation: "empreendimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      marcos: {
        Row: {
          ano: string
          id: string
          ordem: number
          texto: string
        }
        Insert: {
          ano: string
          id?: string
          ordem?: number
          texto: string
        }
        Update: {
          ano?: string
          id?: string
          ordem?: number
          texto?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          autor_id: string | null
          capa_url: string | null
          categoria: string | null
          conteudo: string | null
          created_at: string
          id: string
          publicado_em: string | null
          resumo: string | null
          seo_descricao: string | null
          seo_titulo: string | null
          slug: string
          status: string
          titulo: string
          updated_at: string
        }
        Insert: {
          autor_id?: string | null
          capa_url?: string | null
          categoria?: string | null
          conteudo?: string | null
          created_at?: string
          id?: string
          publicado_em?: string | null
          resumo?: string | null
          seo_descricao?: string | null
          seo_titulo?: string | null
          slug: string
          status?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          autor_id?: string | null
          capa_url?: string | null
          categoria?: string | null
          conteudo?: string | null
          created_at?: string
          id?: string
          publicado_em?: string | null
          resumo?: string | null
          seo_descricao?: string | null
          seo_titulo?: string | null
          slug?: string
          status?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          ativo: boolean
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          nome: string
          role: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id: string
          nome: string
          role?: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          chave: string
          descricao: string | null
          publico: boolean
          updated_at: string
          updated_by: string | null
          valor: Json
        }
        Insert: {
          chave: string
          descricao?: string | null
          publico?: boolean
          updated_at?: string
          updated_by?: string | null
          valor?: Json
        }
        Update: {
          chave?: string
          descricao?: string | null
          publico?: boolean
          updated_at?: string
          updated_by?: string | null
          valor?: Json
        }
        Relationships: [
          {
            foreignKeyName: "site_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tipos_empreendimento: {
        Row: {
          id: string
          nome: string
          ordem: number
          slug: string
        }
        Insert: {
          id?: string
          nome: string
          ordem?: number
          slug: string
        }
        Update: {
          id?: string
          nome?: string
          ordem?: number
          slug?: string
        }
        Relationships: []
      }
      tipos_unidade: {
        Row: {
          id: string
          nome: string
          ordem: number
          slug: string
        }
        Insert: {
          id?: string
          nome: string
          ordem?: number
          slug: string
        }
        Update: {
          id?: string
          nome?: string
          ordem?: number
          slug?: string
        }
        Relationships: []
      }
      unidades: {
        Row: {
          andar: string | null
          area_construida: string | null
          created_at: string
          empreendimento_id: string
          id: string
          identificacao: string
          observacao: string | null
          ordem: number
          situacao: string
          status: string
          terreno_area: string | null
          terreno_dimensoes: string | null
          tipo_id: string | null
          updated_at: string
          valor: number | null
        }
        Insert: {
          andar?: string | null
          area_construida?: string | null
          created_at?: string
          empreendimento_id: string
          id?: string
          identificacao: string
          observacao?: string | null
          ordem?: number
          situacao?: string
          status?: string
          terreno_area?: string | null
          terreno_dimensoes?: string | null
          tipo_id?: string | null
          updated_at?: string
          valor?: number | null
        }
        Update: {
          andar?: string | null
          area_construida?: string | null
          created_at?: string
          empreendimento_id?: string
          id?: string
          identificacao?: string
          observacao?: string | null
          ordem?: number
          situacao?: string
          status?: string
          terreno_area?: string | null
          terreno_dimensoes?: string | null
          tipo_id?: string | null
          updated_at?: string
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "unidades_empreendimento_id_fkey"
            columns: ["empreendimento_id"]
            isOneToOne: false
            referencedRelation: "empreendimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unidades_tipo_id_fkey"
            columns: ["tipo_id"]
            isOneToOne: false
            referencedRelation: "tipos_unidade"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
