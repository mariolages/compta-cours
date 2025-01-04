import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, CreditCard, Diamond } from "lucide-react";
import { useState } from "react";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const premiumPlan = {
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
};

export const SubscriptionPlans = () => {
  const { session } = useSessionContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
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
      setIsLoading(true);
      console.log('Starting checkout session creation...');
      console.log('Session token:', session.access_token);
      
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
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center">
      <Card 
        className="relative overflow-hidden max-w-md w-full border-primary"
      >
        <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-sm">
          Recommandé
        </div>
        <CardHeader>
          <div className="flex items-center gap-2">
            <premiumPlan.icon className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">{premiumPlan.name}</CardTitle>
          </div>
          <CardDescription>{premiumPlan.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="text-3xl font-bold">{premiumPlan.price}€</div>
            <div className="text-sm text-muted-foreground">par mois</div>
          </div>
          <ul className="space-y-2">
            {premiumPlan.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleSubscribe}
            className="w-full text-lg h-12"
            disabled={isLoading}
          >
            <CreditCard className="mr-2" />
            {isLoading ? 'Chargement...' : "Choisir ce plan"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};