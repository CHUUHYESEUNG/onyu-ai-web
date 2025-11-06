/**
 * Supabase Database 타입 정의
 *
 * 이 파일은 Supabase CLI로 자동 생성할 수 있습니다:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts
 *
 * 현재는 마이그레이션 스키마를 기반으로 수동 정의되었습니다.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          progress: number
          status: 'draft' | 'in_progress' | 'completed' | 'published'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string
          description?: string | null
          progress?: number
          status?: 'draft' | 'in_progress' | 'completed' | 'published'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          progress?: number
          status?: 'draft' | 'in_progress' | 'completed' | 'published'
          created_at?: string
          updated_at?: string
        }
      }
      timeline_events: {
        Row: {
          id: string
          project_id: string
          label: string
          date: string | null
          description: string | null
          order_index: number
          status: 'todo' | 'done' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          project_id: string
          label: string
          date?: string | null
          description?: string | null
          order_index?: number
          status?: 'todo' | 'done' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          label?: string
          date?: string | null
          description?: string | null
          order_index?: number
          status?: 'todo' | 'done' | null
          created_at?: string
          updated_at?: string
        }
      }
      sections: {
        Row: {
          id: string
          project_id: string
          event_id: string | null
          title: string
          excerpt: string | null
          content: string | null
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          project_id: string
          event_id?: string | null
          title: string
          excerpt?: string | null
          content?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          event_id?: string | null
          title?: string
          excerpt?: string | null
          content?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      subsections: {
        Row: {
          id: string
          section_id: string
          title: string
          content: string
          source_type: 'text' | 'voice' | 'file'
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          section_id: string
          title: string
          content: string
          source_type: 'text' | 'voice' | 'file'
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          section_id?: string
          title?: string
          content?: string
          source_type?: 'text' | 'voice' | 'file'
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      audio_assets: {
        Row: {
          id: string
          project_id: string
          section_id: string | null
          file_path: string
          file_size: number | null
          duration: number | null
          status: 'uploaded' | 'transcribing' | 'transcribed' | 'processing' | 'completed' | 'failed'
          progress: number
          transcript: string | null
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          section_id?: string | null
          file_path: string
          file_size?: number | null
          duration?: number | null
          status?: 'uploaded' | 'transcribing' | 'transcribed' | 'processing' | 'completed' | 'failed'
          progress?: number
          transcript?: string | null
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          section_id?: string | null
          file_path?: string
          file_size?: number | null
          duration?: number | null
          status?: 'uploaded' | 'transcribing' | 'transcribed' | 'processing' | 'completed' | 'failed'
          progress?: number
          transcript?: string | null
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      publish_orders: {
        Row: {
          id: string
          project_id: string
          order_number: string
          customer_name: string
          customer_email: string
          customer_phone: string | null
          options: Json
          total_amount: number
          payment_status: 'pending' | 'paid' | 'confirmed' | 'refunded'
          payment_method: string | null
          paid_at: string | null
          production_status: 'waiting' | 'in_production' | 'completed' | 'shipped' | 'delivered'
          pdf_url: string | null
          epub_url: string | null
          audiobook_url: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          order_number: string
          customer_name: string
          customer_email: string
          customer_phone?: string | null
          options: Json
          total_amount: number
          payment_status?: 'pending' | 'paid' | 'confirmed' | 'refunded'
          payment_method?: string | null
          paid_at?: string | null
          production_status?: 'waiting' | 'in_production' | 'completed' | 'shipped' | 'delivered'
          pdf_url?: string | null
          epub_url?: string | null
          audiobook_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          order_number?: string
          customer_name?: string
          customer_email?: string
          customer_phone?: string | null
          options?: Json
          total_amount?: number
          payment_status?: 'pending' | 'paid' | 'confirmed' | 'refunded'
          payment_method?: string | null
          paid_at?: string | null
          production_status?: 'waiting' | 'in_production' | 'completed' | 'shipped' | 'delivered'
          pdf_url?: string | null
          epub_url?: string | null
          audiobook_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
