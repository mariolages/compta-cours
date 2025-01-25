import { useQuery } from "@tanstack/react-query";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";

interface WelcomeCardProps {
  lastRefresh: Date;
}

export function WelcomeCard({ lastRefresh }: WelcomeCardProps) {
  const { session } = useSessionContext();

  const { data: profile } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*, class:class_id(*)')
        .eq('id', session.user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-primary/10 rounded-full">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Bienvenue, {profile?.full_name || 'Étudiant'}
            </h2>
            {profile?.class?.code && (
              <p className="text-sm text-gray-600">
                Classe : {profile.class.code} - {profile.class.name}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}