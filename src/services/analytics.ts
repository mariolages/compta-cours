import { supabase } from "@/integrations/supabase/client";

export const trackEvent = async (eventType: string, metadata?: any) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('No user found when tracking event:', eventType);
      return;
    }

    const { error } = await supabase
      .from('analytics_events')
      .insert([
        {
          event_type: eventType,
          user_id: user.id,
          metadata
        }
      ]);

    if (error) {
      console.error('Error tracking event:', error);
    }
  } catch (error) {
    console.error('Error in trackEvent:', error);
  }
};

export const getAnalytics = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('analytics_events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
};