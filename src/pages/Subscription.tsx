import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useSessionContext } from '@supabase/auth-helpers-react';
import { supabase } from "@/integrations/supabase/client";
import { SubscriptionHeader } from "@/components/subscription/SubscriptionHeader";
import { SubscriptionPlans } from "@/components/subscription/SubscriptionPlans";
import { SecurityInfo } from "@/components/subscription/SecurityInfo";
import { useToast } from "@/hooks/use-toast";

export default function Subscription() {
  const navigate = useNavigate();
  const { session } = useSessionContext();
  const { toast } = useToast();

  const { data: subscription } = useQuery({
    queryKey: ['subscription', session?.user?.id],
    queryFn: async () => {
      const { data: localSub, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', session?.user?.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      return localSub;
    },
    enabled: !!session?.user?.id,
  });

  useEffect(() => {
    if (subscription?.status === 'active') {
      toast({
        title: "Déjà abonné",
        description: "Vous êtes déjà abonné à nos services.",
      });
      navigate('/dashboard');
    }
  }, [subscription, navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light via-white to-secondary py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-12">
        <SubscriptionHeader />

        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Accédez à tous les cours
          </h1>
          <p className="text-lg text-muted-foreground">
            Profitez d'un accès illimité à tous nos contenus pour réussir votre DCG ou BTS
          </p>
        </div>

        <SubscriptionPlans />

        <div className="max-w-lg mx-auto">
          <SecurityInfo />
        </div>
      </div>
    </div>
  );
}