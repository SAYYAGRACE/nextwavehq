export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: { action: string; admin_email: string | null; admin_id: string; created_at: string; id: string; metadata: Json; target_id: string | null; target_table: string }
        Insert: { action: string; admin_email?: string | null; admin_id: string; created_at?: string; id?: string; metadata?: Json; target_id?: string | null; target_table: string }
        Update: { action?: string; admin_email?: string | null; admin_id?: string; created_at?: string; id?: string; metadata?: Json; target_id?: string | null; target_table?: string }
        Relationships: []
      }
      contact_submissions: {
        Row: { created_at: string; email: string; id: string; intent: string; message: string; name: string; organization: string }
        Insert: { created_at?: string; email: string; id?: string; intent: string; message: string; name: string; organization: string }
        Update: { created_at?: string; email?: string; id?: string; intent?: string; message?: string; name?: string; organization?: string }
        Relationships: []
      }
      user_roles: {
        Row: { created_at: string; id: string; role: Database["public"]["Enums"]["app_role"]; user_id: string }
        Insert: { created_at?: string; id?: string; role: Database["public"]["Enums"]["app_role"]; user_id: string }
        Update: { created_at?: string; id?: string; role?: Database["public"]["Enums"]["app_role"]; user_id?: string }
        Relationships: []
      }
      waitlist_signups: {
        Row: { created_at: string; email: string; id: string; source: string }
        Insert: { created_at?: string; email: string; id?: string; source: string }
        Update: { created_at?: string; email?: string; id?: string; source?: string }
        Relationships: []
      }
      staff_conversations: {
        Row: { created_at: string; created_by: string; id: string; subject: string | null; updated_at: string }
        Insert: { created_at?: string; created_by: string; id?: string; subject?: string | null; updated_at?: string }
        Update: { created_at?: string; created_by?: string; id?: string; subject?: string | null; updated_at?: string }
        Relationships: []
      }
      staff_messages: {
        Row: { content: string; conversation_id: string; created_at: string; id: string; sender_email: string; sender_id: string; sender_name: string; sender_role: string }
        Insert: { content: string; conversation_id: string; created_at?: string; id?: string; sender_email: string; sender_id: string; sender_name: string; sender_role: string }
        Update: { content?: string; conversation_id?: string; created_at?: string; id?: string; sender_email?: string; sender_id?: string; sender_name?: string; sender_role?: string }
        Relationships: []
      }
      staff_conversation_participants: {
        Row: { conversation_id: string; id: string; joined_at: string; last_read_at: string | null; user_email: string; user_id: string; user_name: string; user_role: string }
        Insert: { conversation_id: string; id?: string; joined_at?: string; last_read_at?: string | null; user_email: string; user_id: string; user_name: string; user_role: string }
        Update: { conversation_id?: string; id?: string; joined_at?: string; last_read_at?: string | null; user_email?: string; user_id?: string; user_name?: string; user_role?: string }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: {
      app_role: "admin" | "erp" | "member"
    }
    CompositeTypes: { [_ in never]: never }
  }
}
