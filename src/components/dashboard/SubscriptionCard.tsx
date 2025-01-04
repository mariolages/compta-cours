import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionCardProps {
  subscription: any;
}

export const SubscriptionCard = ({ subscription }: SubscriptionCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubscriptionClick = async () => {
    if (subscription) {
      navigate('/subscription');
      return;
    }

    try {
      console.log('Starting checkout session creation...');
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          priceId: 'price_1QdaT0II3n6IJC5vJGKapUGb'
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
    }
  };

  return (
    <Card 
      className="bg-gradient-to-r from-primary/5 to-accent/5 hover:from-primary/10 hover:to-accent/10 transition-colors cursor-pointer" 
      onClick={handleSubscriptionClick}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          {subscription ? 'Gérer mon abonnement' : 'S\'abonner'}
        </CardTitle>
        <CardDescription>
          {subscription 
            ? 'Accédez à vos informations d\'abonnement'
            : 'Débloquez l\'accès à tous les contenus'}
        </CardDescription>
      </CardHeader>
    </Card>
  );
};