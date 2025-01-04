import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, CreditCard, Lock, Shield, Star, ArrowLeft } from "lucide-react";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

const features = [
  {
    title: "Accès à tous les cours",
    description: "Débloquez l'accès à tous les cours DCG et BTS",
    icon: Lock
  },
  {
    title: "Téléchargement illimité",
    description: "Téléchargez tous les supports de cours",
    icon: Star
  },
  {
    title: "Mises à jour régulières",
    description: "Accédez aux nouveaux contenus dès leur publication",
    icon: Shield
  }
];

const freeFeatures = [
  "Accès aux premiers cours (DCG1 et BTS1)",
  "Consultation des supports de cours",
  "Accès au tableau de bord"
];

export default function Subscription() {
  const { session } = useSessionContext();
  const navigate = useNavigate();
  const { toast } = useToast();
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
          priceId: 'price_1QdaT0II3n6IJC5vJGKapUGb'
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
    <div className="min-h-screen bg-gradient-to-b from-secondary to-background py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-primary hover:text-primary-dark"
          >
            <ArrowLeft className="h-5 w-5" />
            Retour au tableau de bord
          </Button>
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Choisissez votre formule</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Accédez à l'intégralité du contenu et des fonctionnalités pour réussir votre DCG ou BTS
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Plan Gratuit */}
          <Card className="relative overflow-hidden">
            <CardHeader>
              <CardTitle className="text-2xl">Gratuit</CardTitle>
              <CardDescription>
                Pour découvrir la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-2xl font-bold">0€</div>
              <ul className="space-y-2">
                {freeFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Plan Premium */}
          <Card className="relative overflow-hidden border-primary">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-sm">
              Recommandé
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">Premium</CardTitle>
              <CardDescription>
                Accès complet à tous les contenus
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="text-3xl font-bold">9.99€</div>
                <div className="text-sm text-muted-foreground">par mois</div>
              </div>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <feature.icon className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <div className="font-medium">{feature.title}</div>
                      <div className="text-sm text-muted-foreground">{feature.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleSubscribe}
                className="w-full text-lg h-12"
                disabled={isLoading}
              >
                <CreditCard className="mr-2" />
                {isLoading ? 'Chargement...' : "S'abonner maintenant"}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Paiement Sécurisé
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Vos paiements sont sécurisés par Stripe, leader mondial du paiement en ligne
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}