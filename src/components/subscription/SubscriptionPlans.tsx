import { useState } from "react";
import { Diamond, Loader2 } from "lucide-react";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ActiveSubscription } from "./ActiveSubscription";
import { PremiumPlanCard } from "./PremiumPlanCard";

const premiumPlan = {
  id: "premium",
  name: "Premium",
  price: "9.99",
  icon: Diamond,
  description: "Accès complet",
  features: [
    "Accès à tous les cours et ressources",
    "Téléchargement illimité des supports",
    "Accès aux quiz et exercices",
    "Support prioritaire",
    "Mises à jour en avant-première",
    "Accès sur tous vos appareils"
  ]
};

export const SubscriptionPlans = () => {
  const { session } = useSessionContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const { data: subscription, isLoading: isLoadingSubscription, refetch: refetchSubscription } = useQuery({
    queryKey: ['subscription', session?.user?.id],
    queryFn: async () => {
      const { data: subscriptionData, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', session?.user?.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;

      if (subscriptionData) {
        const { data: stripeDetails, error: stripeError } = await supabase.functions.invoke('get-subscription-details', {
          body: { subscriptionId: subscriptionData.stripe_subscription_id },
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        });

        if (stripeError) throw stripeError;

        return {
          ...subscriptionData,
          ...stripeDetails,
        };
      }

      return null;
    },
    enabled: !!session?.user?.id,
  });

  const handleSubscribe = async () => {
    if (!session) {
      toast({
        variant: "destructive",
        title: "Connexion requise",
        description: "Vous devez être connecté pour souscrire à un abonnement",
      });
      navigate('/login');
      return;
    }

    try {
      setIsLoading(true);
      
      console.log('Creating checkout session...');
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          priceId: 'price_1OgkXuHVlJhYKxGPbvmhzjbP',
          returnUrl: `${window.location.origin}/dashboard`
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error creating checkout session:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Une erreur est survenue lors de la création de la session de paiement. Veuillez réessayer.",
        });
        return;
      }

      console.log('Checkout session created:', data);
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Une erreur est survenue. Veuillez réessayer plus tard.",
        });
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!session || !subscription?.stripe_subscription_id) return;

    try {
      setIsLoading(true);
      const { error } = await supabase.functions.invoke('cancel-subscription', {
        body: {
          subscriptionId: subscription.stripe_subscription_id,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      await refetchSubscription();
      
      toast({
        title: "Abonnement annulé",
        description: "Votre abonnement sera actif jusqu'à la fin de la période en cours",
      });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de l'annulation de l'abonnement",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingSubscription) {
    return (
      <div className="flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (subscription?.status === 'active') {
    return (
      <ActiveSubscription 
        subscription={subscription}
        isLoading={isLoading}
        onCancelSubscription={handleCancelSubscription}
        premiumPlan={premiumPlan}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-center px-4">
        <PremiumPlanCard 
          plan={premiumPlan}
          onSubscribe={handleSubscribe}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};