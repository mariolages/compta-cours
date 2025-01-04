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
      className="bg-[#F1F0FB]/50 hover:bg-[#F1F0FB]/70 transition-colors cursor-pointer border-none shadow-none" 
      onClick={handleSubscriptionClick}
    >
      <CardHeader className="py-4">
        <CardTitle className="flex items-center gap-2 text-gray-600 text-lg font-medium">
          <CreditCard className="h-4 w-4 text-gray-400" />
          {subscription ? 'Gérer mon abonnement' : 'Contenu premium'}
        </CardTitle>
        <CardDescription className="text-gray-400 text-sm">
          {subscription 
            ? 'Voir mes options'
            : 'Explorer les fonctionnalités avancées'}
        </CardDescription>
      </CardHeader>
    </Card>
  );
};