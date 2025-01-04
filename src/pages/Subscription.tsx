import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, CreditCard, Lock, Shield } from "lucide-react";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";

const features = [
  "Accès à tous les contenus premium",
  "Téléchargement illimité",
  "Mises à jour régulières",
  "Support prioritaire",
  "Accès aux quiz avancés",
  "Contenus exclusifs"
];

export default function Subscription() {
  const { session } = useSessionContext();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubscribe = async () => {
    try {
      const { data: { url }, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { },
      });

      if (error) throw error;

      if (url) {
        window.location.href = url;
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création de la session de paiement",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-background py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Abonnement Premium DCGHub</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Accédez à l'intégralité du contenu et des fonctionnalités pour réussir votre DCG
          </p>
        </div>

        <Card className="w-full max-w-lg mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center justify-between">
              <span>Premium</span>
              <span className="text-3xl font-bold">19.99€/mois</span>
            </CardTitle>
            <CardDescription>
              Tout ce dont vous avez besoin pour réussir
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
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
            >
              <CreditCard className="mr-2" />
              S'abonner maintenant
            </Button>
          </CardFooter>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Satisfait ou Remboursé
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Garantie de remboursement de 30 jours si vous n'êtes pas satisfait
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}