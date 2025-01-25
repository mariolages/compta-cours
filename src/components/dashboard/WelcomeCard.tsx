import { useQuery } from "@tanstack/react-query";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Calendar } from "lucide-react";
import { motion } from "framer-motion";

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-primary/5 via-white to-primary/10 backdrop-blur-sm border-2 border-primary/10 hover:border-primary/20 transition-all duration-300">
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="p-3 bg-primary/10 rounded-xl">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                Bienvenue, {profile?.full_name || 'Étudiant'}
              </h2>
              {profile?.class?.code && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <p className="text-sm">
                    {profile.class.code} - {profile.class.name}
                    {profile.school_year && (
                      <span className="ml-2 text-primary">
                        {profile.school_year}ème année
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}