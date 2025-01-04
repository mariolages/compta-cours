import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSessionContext } from '@supabase/auth-helpers-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SecurityInfo } from './SecurityInfo';

export const SubscriptionPlans = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { session } = useSessionContext();

  const handleSubscribe = async (price_id: string) => {
    try {
      setIsLoading(true);
      console.log('Starting checkout session creation with price ID:', price_id);

      if (!session) {
        toast({
          variant: "destructive",
          title: "Session expirée",
          description: "Veuillez vous connecter pour souscrire à un abonnement.",
        });
        navigate('/login');
        return;
      }

      console.log('Using access token:', session.access_token);

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          price_id,
        }
      });

      if (error) {
        console.error('Error creating checkout session:', error);
        
        if (error.message.includes('refresh_token_not_found') || 
            error.message.includes('JWT expired') ||
            error.message.includes('session_id claim in JWT does not exist')) {
          toast({
            variant: "destructive",
            title: "Session expirée",
            description: "Votre session a expiré. Veuillez vous reconnecter.",
          });
          navigate('/login');
          return;
        }

        throw error;
      }

      if (!data?.url) {
        throw new Error('URL de paiement non reçue');
      }

      // Redirection vers Stripe
      window.location.href = data.url;
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de la session de paiement. Nos équipes ont été notifiées. Veuillez réessayer dans quelques instants.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Nos offres d'abonnement</h1>
        <p className="text-xl text-gray-600">
          Choisissez l'offre qui vous convient le mieux
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Card className="relative">
          <CardHeader>
            <CardTitle>Mensuel</CardTitle>
            <CardDescription>Idéal pour une utilisation à court terme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4">9.99€ <span className="text-lg font-normal text-gray-600">/mois</span></div>
            <ul className="space-y-2">
              <li>✓ Accès à tous les cours</li>
              <li>✓ Exercices corrigés</li>
              <li>✓ Support communautaire</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => handleSubscribe('price_1QdcI0II3n6IJC5voYqaw2hs')}
              disabled={isLoading}
            >
              {isLoading ? "Chargement..." : "Souscrire"}
            </Button>
          </CardFooter>
        </Card>

        <Card className="relative">
          <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 rounded-bl-lg rounded-tr-lg text-sm">
            Meilleure offre
          </div>
          <CardHeader>
            <CardTitle>Annuel</CardTitle>
            <CardDescription>La solution la plus économique</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4">
              89.99€ <span className="text-lg font-normal text-gray-600">/an</span>
              <div className="text-sm text-green-600 mt-1">Économisez 30%</div>
            </div>
            <ul className="space-y-2">
              <li>✓ Tous les avantages du plan mensuel</li>
              <li>✓ 30% de réduction</li>
              <li>✓ Accès prioritaire aux nouveautés</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => handleSubscribe('price_1QdcIaII3n6IJC5vECDkmJXr')}
              disabled={isLoading}
            >
              {isLoading ? "Chargement..." : "Souscrire"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-12">
        <SecurityInfo />
      </div>
    </div>
  );
};