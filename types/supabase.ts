export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      applications: {
        Row: {
          id: string
          user_id: string
          exam_number: string
          track: string
          form_number: string
          state: string
          name: string
          school: string
          phone_number: string
          nationality: string
          country: string | null
          receive_sms: boolean
          has_resignation: boolean
          national_id: string
          gender: string
          application_type: string
          agreed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          exam_number: string
          track: string
          form_number: string
          state: string
          name: string
          school: string
          phone_number: string
          nationality: string
          country?: string | null
          receive_sms?: boolean
          has_resignation?: boolean
          national_id: string
          gender: string
          application_type?: string
          agreed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          exam_number?: string
          track?: string
          form_number?: string
          state?: string
          name?: string
          school?: string
          phone_number?: string
          nationality?: string
          country?: string | null
          receive_sms?: boolean
          has_resignation?: boolean
          national_id?: string
          gender?: string
          application_type?: string
          agreed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      preferences: {
        Row: {
          id: string
          application_id: string
          university: string
          university_name: string
          faculty: string
          faculty_name: string
          type: string
          order: number
          created_at: string
        }
        Insert: {
          id?: string
          application_id: string
          university: string
          university_name: string
          faculty: string
          faculty_name: string
          type: string
          order: number
          created_at?: string
        }
        Update: {
          id?: string
          application_id?: string
          university?: string
          university_name?: string
          faculty?: string
          faculty_name?: string
          type?: string
          order?: number
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string | null
          phone: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email?: string | null
          phone?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          phone?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

