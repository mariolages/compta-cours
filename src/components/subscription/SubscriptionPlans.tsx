import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, CreditCard, Diamond, Loader2 } from "lucide-react";
import { useState } from "react";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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
        // Fetch additional details from Stripe
        const response = await fetch('/functions/get-subscription-details', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch subscription details');
        }

        const stripeDetails = await response.json();
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
      
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          priceId: 'price_1QdaT0II3n6IJC5vJGKapUGb',
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
      const response = await fetch('/functions/cancel-subscription', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          subscriptionId: subscription.stripe_subscription_id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

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
      <div className="space-y-6">
        <Card className="max-w-md mx-auto border-primary/10 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Diamond className="h-6 w-6 text-primary" />
              Abonnement actif
            </CardTitle>
            <CardDescription>
              Votre abonnement Premium est actuellement actif
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Prochain paiement</p>
              <p className="font-medium">
                {subscription.current_period_end ? (
                  format(new Date(subscription.current_period_end * 1000), "d MMMM yyyy", { locale: fr })
                ) : (
                  "Date non disponible"
                )}
              </p>
            </div>
            {subscription.cancel_at && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Fin de l'abonnement</p>
                <p className="font-medium text-red-600">
                  {format(new Date(subscription.cancel_at * 1000), "d MMMM yyyy", { locale: fr })}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Montant</p>
              <p className="font-medium">{premiumPlan.price}€ / mois</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleCancelSubscription}
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={isLoading || !!subscription.cancel_at}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : subscription.cancel_at ? (
                "Abonnement déjà annulé"
              ) : (
                "Annuler l'abonnement"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-center px-4">
        <Card className="relative overflow-hidden max-w-md w-full border-primary/10 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
          <div className="absolute -right-20 -top-20 h-40 w-40 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute top-0 right-0 bg-primary text-white px-4 py-1 text-sm rounded-bl-lg font-medium">
            Offre limitée
          </div>
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <premiumPlan.icon className="h-7 w-7 text-primary" />
              <CardTitle className="text-2xl">{premiumPlan.name}</CardTitle>
            </div>
            <CardDescription className="text-base">{premiumPlan.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-1">
              <div className="text-4xl font-bold text-primary flex items-start">
                {premiumPlan.price}€
                <span className="text-sm font-normal text-muted-foreground mt-2 ml-1">/mois</span>
              </div>
              <div className="text-sm text-muted-foreground">Sans engagement - Annulable à tout moment</div>
            </div>
            <ul className="space-y-3">
              {premiumPlan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="mt-1">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                  </div>
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleSubscribe}
              className="w-full text-lg h-12 bg-primary hover:bg-primary-hover gap-2"
              disabled={isLoading}
            >
              <CreditCard className="h-5 w-5" />
              {isLoading ? 'Chargement...' : "S'abonner maintenant"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};