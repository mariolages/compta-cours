import { supabase } from "@/integrations/supabase/client";

interface AnalyticsEvent {
  event_type: string;
  user_id?: string;
  metadata?: Record<string, any>;
}

export const analytics = {
  trackEvent: async ({ event_type, user_id, metadata }: AnalyticsEvent) => {
    try {
      const { error } = await supabase.from('auth_logs').insert({
        event_type,
        user_id,
        email: metadata?.email,
        created_at: new Date().toISOString()
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  },

  pageView: async (page: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    analytics.trackEvent({
      event_type: 'page_view',
      user_id: user?.id,
      metadata: { page }
    });
  }
};