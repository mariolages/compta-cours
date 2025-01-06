import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function SubscriptionPlans() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubscribe = async (priceId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Vous devez être connecté pour souscrire à un abonnement",
        });
        return;
      }

      const response = await fetch(`${window.location.origin}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}/dashboard?payment_status=success`,
          cancelUrl: `${window.location.origin}/subscription`,
        }),
      });

      const { url } = await response.json();
      
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de la session de paiement",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary hover:bg-primary/5"
        >
          <ArrowLeft className="h-5 w-5" />
          Retour
        </Button>
      </div>

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Nos offres d'abonnement</h1>
        <p className="text-xl text-gray-600">Choisissez l'offre qui vous convient le mieux</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Card className="relative overflow-hidden">
          <CardHeader>
            <CardTitle>Mensuel</CardTitle>
            <CardDescription>Idéal pour essayer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4">
              9.99€ <span className="text-lg font-normal text-gray-600">/mois</span>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>Accès à tous les cours</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>Support premium</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>Mises à jour régulières</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => handleSubscribe('price_1OqhQoKMGjOJw7bNmwLGXzxE')}
            >
              Commencer
            </Button>
          </CardFooter>
        </Card>

        <Card className="relative overflow-hidden border-primary">
          <div className="absolute top-0 right-0 bg-primary text-white px-4 py-1 rounded-bl-lg text-sm">
            Populaire
          </div>
          <CardHeader>
            <CardTitle>Annuel</CardTitle>
            <CardDescription>La meilleure offre</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4">
              83.99€ <span className="text-lg font-normal text-gray-600">/an</span>
              <div className="text-sm text-green-600 mt-1">Économisez 30%</div>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>Tout ce qui est inclus dans l'offre mensuelle</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>30% de réduction</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>Accès prioritaire aux nouveautés</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-primary hover:bg-primary-hover" 
              onClick={() => handleSubscribe('price_1OqhQoKMGjOJw7bNYSF5T4k8')}
            >
              Commencer
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}