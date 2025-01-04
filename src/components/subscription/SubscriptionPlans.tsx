import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, CreditCard, Diamond, Star, Trophy } from "lucide-react";
import { useState } from "react";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    id: "basic",
    name: "Basique",
    price: "4.99",
    icon: Star,
    description: "Pour commencer",
    features: [
      "Accès aux cours DCG1 et BTS1",
      "Téléchargement limité",
      "Support basique"
    ]
  },
  {
    id: "premium",
    name: "Premium",
    price: "9.99",
    icon: Diamond,
    description: "Recommandé",
    isPopular: true,
    features: [
      "Accès à tous les cours",
      "Téléchargement illimité",
      "Support prioritaire",
      "Mises à jour en avant-première"
    ]
  },
  {
    id: "pro",
    name: "Professionnel",
    price: "19.99",
    icon: Trophy,
    description: "Pour les experts",
    features: [
      "Tout le contenu Premium",
      "Sessions de mentorat",
      "Contenus exclusifs",
      "Support dédié 24/7"
    ]
  }
];

const priceIds = {
  basic: "price_1QdaT0II3n6IJC5vJGKapUGb",
  premium: "price_1QdaT0II3n6IJC5vJGKapUGb",
  pro: "price_1QdaT0II3n6IJC5vJGKapUGb"
};

export const SubscriptionPlans = () => {
  const { session } = useSessionContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    if (!session) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Vous devez être connecté pour souscrire à un abonnement",
      });
      navigate('/login');
      return;
    }

    try {
      setIsLoading(planId);
      console.log('Starting checkout session creation...');
      console.log('Session token:', session.access_token);
      
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          priceId: priceIds[planId as keyof typeof priceIds],
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
          description: "Une erreur est survenue lors de la création de la session de paiement. Veuillez réessayer plus tard.",
        });
        return;
      }

      console.log('Checkout session response:', data);

      if (data?.url) {
        console.log('Redirecting to:', data.url);
        window.location.href = data.url;
      } else {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "URL de paiement manquante dans la réponse",
        });
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création de la session de paiement",
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {plans.map((plan) => (
        <Card 
          key={plan.id}
          className={`relative overflow-hidden ${plan.isPopular ? 'border-primary' : ''}`}
        >
          {plan.isPopular && (
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-sm">
              Recommandé
            </div>
          )}
          <CardHeader>
            <div className="flex items-center gap-2">
              <plan.icon className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
            </div>
            <CardDescription>{plan.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="text-3xl font-bold">{plan.price}€</div>
              <div className="text-sm text-muted-foreground">par mois</div>
            </div>
            <ul className="space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => handleSubscribe(plan.id)}
              className="w-full text-lg h-12"
              disabled={!!isLoading}
            >
              <CreditCard className="mr-2" />
              {isLoading === plan.id ? 'Chargement...' : "Choisir ce plan"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};