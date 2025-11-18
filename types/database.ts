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
          question_id: string | null
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
          question_id?: string | null
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
          question_id?: string | null
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
      chapters: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string | null
          order_index: number
          status: 'not_started' | 'in_progress' | 'completed'
          estimated_duration: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          description?: string | null
          order_index?: number
          status?: 'not_started' | 'in_progress' | 'completed'
          estimated_duration?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          description?: string | null
          order_index?: number
          status?: 'not_started' | 'in_progress' | 'completed'
          estimated_duration?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          chapter_id: string
          title: string
          description: string | null
          order_index: number
          status: 'not_started' | 'in_progress' | 'completed'
          started_at: string | null
          completed_at: string | null
          total_duration: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          chapter_id: string
          title: string
          description?: string | null
          order_index?: number
          status?: 'not_started' | 'in_progress' | 'completed'
          started_at?: string | null
          completed_at?: string | null
          total_duration?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          chapter_id?: string
          title?: string
          description?: string | null
          order_index?: number
          status?: 'not_started' | 'in_progress' | 'completed'
          started_at?: string | null
          completed_at?: string | null
          total_duration?: number
          created_at?: string
          updated_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          session_id: string
          prompt: string
          order_index: number
          audio_asset_id: string | null
          transcription: string | null
          duration: number | null
          is_skipped: boolean
          is_completed: boolean
          recorded_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          prompt: string
          order_index?: number
          audio_asset_id?: string | null
          transcription?: string | null
          duration?: number | null
          is_skipped?: boolean
          is_completed?: boolean
          recorded_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          prompt?: string
          order_index?: number
          audio_asset_id?: string | null
          transcription?: string | null
          duration?: number | null
          is_skipped?: boolean
          is_completed?: boolean
          recorded_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      text_blocks: {
        Row: {
          id: string
          project_id: string
          chapter_id: string | null
          content: string
          order_index: number
          source_question_ids: string[] | null
          source_type: 'ai_generated' | 'user_edited' | 'user_added'
          is_editable: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          chapter_id?: string | null
          content: string
          order_index?: number
          source_question_ids?: string[] | null
          source_type?: 'ai_generated' | 'user_edited' | 'user_added'
          is_editable?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          chapter_id?: string | null
          content?: string
          order_index?: number
          source_question_ids?: string[] | null
          source_type?: 'ai_generated' | 'user_edited' | 'user_added'
          is_editable?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          text_block_id: string
          user_id: string
          user_name: string
          content: string | null
          comment_type: 'text' | 'voice'
          audio_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          text_block_id: string
          user_id: string
          user_name: string
          content?: string | null
          comment_type?: 'text' | 'voice'
          audio_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          text_block_id?: string
          user_id?: string
          user_name?: string
          content?: string | null
          comment_type?: 'text' | 'voice'
          audio_url?: string | null
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
      calculate_project_progress: {
        Args: { p_project_id: string }
        Returns: number
      }
      update_project_progress_on_session_complete: {
        Args: Record<PropertyKey, never>
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
