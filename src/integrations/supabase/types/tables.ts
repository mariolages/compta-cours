export type Tables = {
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
  }
  profiles: {
    Row: {
      created_at: string
      full_name: string | null
      id: string
      is_admin: boolean | null
      is_banned: boolean | null
      is_validated: boolean | null
      updated_at: string
    }
    Insert: {
      created_at?: string
      full_name?: string | null
      id: string
      is_admin?: boolean | null
      is_banned?: boolean | null
      is_validated?: boolean | null
      updated_at?: string
    }
    Update: {
      created_at?: string
      full_name?: string | null
      id?: string
      is_admin?: boolean | null
      is_banned?: boolean | null
      is_validated?: boolean | null
      updated_at?: string
    }
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
  }
  chat_messages: {
    Row: {
      id: string;
      content: string;
      sender_id: string;
      receiver_id: string | null;
      created_at: string;
    };
    Insert: {
      content: string;
      sender_id: string;
      receiver_id?: string | null;
    };
    Update: {
      content?: string;
      sender_id?: string;
      receiver_id?: string | null;
    };
  }
}

export type ChatMessage = Tables['chat_messages']['Row']