import { supabase } from '@/integrations/supabase/client';

type EventType = 'page_view' | 'button_click' | 'file_download' | 'search' | 'login' | 'signup';

interface AnalyticsEvent {
  event_type: EventType;
  user_id?: string;
  metadata?: Record<string, any>;
}

export const analytics = {
  trackEvent: async ({ event_type, user_id, metadata }: AnalyticsEvent) => {
    try {
      // Using the auth_logs table instead since analytics_events doesn't exist
      const { error } = await supabase.from('auth_logs').insert({
        event_type,
        user_id,
        email: metadata?.email,
        created_at: new Date().toISOString()
      });

      if (error) throw error;
    } catch (err) {
      console.error('Error tracking event:', err);
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