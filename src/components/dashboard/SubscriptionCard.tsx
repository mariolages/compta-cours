import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSessionContext } from "@supabase/auth-helpers-react";

interface SubscriptionCardProps {
  subscription: any;
}

export const SubscriptionCard = ({ subscription }: SubscriptionCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session } = useSessionContext();

  const handleSubscriptionClick = async () => {
    if (subscription) {
      navigate('/subscription');
      return;
    }

    if (!session) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Vous devez être connecté pour souscrire à un abonnement",
      });
      navigate('/login');
      return;
    }

    navigate('/subscription');
  };

  return (
    <Card 
      className="bg-white/50 hover:bg-white/80 transition-colors cursor-pointer border border-gray-100 shadow-sm hover:shadow-md" 
      onClick={handleSubscriptionClick}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-700">
          <CreditCard className="h-5 w-5 text-gray-500" />
          {subscription ? 'Gérer mon abonnement' : 'Accéder à plus de contenu'}
        </CardTitle>
        <CardDescription className="text-gray-500">
          {subscription 
            ? 'Consultez les détails de votre abonnement'
            : 'Découvrez nos offres premium'}
        </CardDescription>
      </CardHeader>
    </Card>
  );
};