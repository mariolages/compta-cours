export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      auth_logs: {
        Row: {
          created_at: string | null
          email: string | null
          event_type: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          event_type?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          event_type?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auth_logs_profile_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      chat_groups: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
          participants: string[]
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name: string
          participants: string[]
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          participants?: string[]
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read: boolean | null
          receiver_id: string | null
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read?: boolean | null
          receiver_id?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read?: boolean | null
          receiver_id?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          code: string
          color: string
          created_at: string
          id: number
          name: string
        }
        Insert: {
          code: string
          color?: string
          created_at?: string
          id?: number
          name: string
        }
        Update: {
          code?: string
          color?: string
          created_at?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          course_id: string | null
          created_at: string
          id: string
          user_id: string | null
        }
        Insert: {
          content: string
          course_id?: string | null
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Update: {
          content?: string
          course_id?: string | null
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "custom_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_tags: {
        Row: {
          course_id: string
          tag_id: string
        }
        Insert: {
          course_id: string
          tag_id: string
        }
        Update: {
          course_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_tags_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "custom_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "custom_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_courses: {
        Row: {
          content: string
          created_at: string
          id: string
          is_public: boolean | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_public?: boolean | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_public?: boolean | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      custom_tags: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      exams: {
        Row: {
          chapter: string | null
          created_at: string
          date: string
          description: string | null
          id: string
          subject_id: number | null
          title: string
          user_id: string
        }
        Insert: {
          chapter?: string | null
          created_at?: string
          date: string
          description?: string | null
          id?: string
          subject_id?: number | null
          title: string
          user_id: string
        }
        Update: {
          chapter?: string | null
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          subject_id?: number | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exams_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          file_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          category_id: number
          created_at: string
          file_path: string
          folder_id: string | null
          id: string
          subject_id: number
          title: string
          user_id: string
        }
        Insert: {
          category_id: number
          created_at?: string
          file_path: string
          folder_id?: string | null
          id?: string
          subject_id: number
          title: string
          user_id: string
        }
        Update: {
          category_id?: number
          created_at?: string
          file_path?: string
          folder_id?: string | null
          id?: string
          subject_id?: number
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "files_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcards: {
        Row: {
          answer: string
          created_at: string | null
          difficulty: number | null
          id: string
          next_review: string | null
          question: string
          subject_id: number | null
          user_id: string
        }
        Insert: {
          answer: string
          created_at?: string | null
          difficulty?: number | null
          id?: string
          next_review?: string | null
          question: string
          subject_id?: number | null
          user_id: string
        }
        Update: {
          answer?: string
          created_at?: string | null
          difficulty?: number | null
          id?: string
          next_review?: string | null
          question?: string
          subject_id?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcards_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      folders: {
        Row: {
          created_at: string
          id: string
          name: string
          parent_folder_id: string | null
          subject_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          parent_folder_id?: string | null
          subject_id: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          parent_folder_id?: string | null
          subject_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "folders_parent_folder_id_fkey"
            columns: ["parent_folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folders_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_goals: {
        Row: {
          completed: boolean | null
          created_at: string | null
          id: string
          subject_id: number | null
          target_date: string | null
          title: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          subject_id?: number | null
          target_date?: string | null
          title: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          subject_id?: number | null
          target_date?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_goals_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean | null
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean | null
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          class_id: number | null
          created_at: string
          full_name: string | null
          id: string
          is_admin: boolean | null
          is_banned: boolean | null
          is_validated: boolean | null
          school_year: number | null
          updated_at: string
        }
        Insert: {
          class_id?: number | null
          created_at?: string
          full_name?: string | null
          id: string
          is_admin?: boolean | null
          is_banned?: boolean | null
          is_validated?: boolean | null
          school_year?: number | null
          updated_at?: string
        }
        Update: {
          class_id?: number | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          is_banned?: boolean | null
          is_validated?: boolean | null
          school_year?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_answers: {
        Row: {
          attempt_id: string | null
          created_at: string | null
          id: string
          is_correct: boolean
          question_id: string | null
          selected_answers: string[] | null
        }
        Insert: {
          attempt_id?: string | null
          created_at?: string | null
          id?: string
          is_correct: boolean
          question_id?: string | null
          selected_answers?: string[] | null
        }
        Update: {
          attempt_id?: string | null
          created_at?: string | null
          id?: string
          is_correct?: boolean
          question_id?: string | null
          selected_answers?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "quiz_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_attempts: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          quiz_id: string | null
          score: number
          time_taken: number | null
          total_questions: number
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          quiz_id?: string | null
          score: number
          time_taken?: number | null
          total_questions: number
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          quiz_id?: string | null
          score?: number
          time_taken?: number | null
          total_questions?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_answer: string | null
          correct_answers: string[] | null
          created_at: string
          explanation: string | null
          id: string
          options: Json
          question: string
          quiz_id: string | null
        }
        Insert: {
          correct_answer?: string | null
          correct_answers?: string[] | null
          created_at?: string
          explanation?: string | null
          id?: string
          options: Json
          question: string
          quiz_id?: string | null
        }
        Update: {
          correct_answer?: string | null
          correct_answers?: string[] | null
          created_at?: string
          explanation?: string | null
          id?: string
          options?: Json
          question?: string
          quiz_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          created_at: string
          description: string | null
          file_id: string | null
          id: string
          shuffle_answers: boolean | null
          shuffle_questions: boolean | null
          time_limit: number | null
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_id?: string | null
          id?: string
          shuffle_answers?: boolean | null
          shuffle_questions?: boolean | null
          time_limit?: number | null
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          file_id?: string | null
          id?: string
          shuffle_answers?: boolean | null
          shuffle_questions?: boolean | null
          time_limit?: number | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
        ]
      }
      ratings: {
        Row: {
          course_id: string
          created_at: string
          rating: number | null
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          rating?: number | null
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          rating?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "custom_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      study_statistics: {
        Row: {
          completed_exercises: number | null
          correct_answers: number | null
          created_at: string | null
          id: string
          subject_id: number | null
          time_spent: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_exercises?: number | null
          correct_answers?: number | null
          created_at?: string | null
          id?: string
          subject_id?: number | null
          time_spent?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_exercises?: number | null
          correct_answers?: number | null
          created_at?: string | null
          id?: string
          subject_id?: number | null
          time_spent?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_statistics_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          class_id: number
          code: string
          created_at: string
          id: number
          name: string
        }
        Insert: {
          class_id: number
          code: string
          created_at?: string
          id?: number
          name: string
        }
        Update: {
          class_id?: number
          code?: string
          created_at?: string
          id?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "subjects_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          id: string
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
