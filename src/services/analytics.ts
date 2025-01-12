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
      const { error } = await supabase.from('analytics_events').insert({
        event_type,
        user_id,
        metadata,
        created_at: new Date().toISOString()
      });

      if (error) throw error;
    } catch (err) {
      console.error('Error tracking event:', err);
    }
  },

  pageView: (page: string) => {
    const user = supabase.auth.getUser();
    analytics.trackEvent({
      event_type: 'page_view',
      user_id: user?.data?.user?.id,
      metadata: { page }
    });
  }
};