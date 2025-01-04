import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

interface SubscriptionCardProps {
  subscription: any;
}

export const SubscriptionCard = ({ subscription }: SubscriptionCardProps) => {
  const navigate = useNavigate();

  return (
    <Card 
      className="bg-gradient-to-r from-primary/5 to-accent/5 hover:from-primary/10 hover:to-accent/10 transition-colors cursor-pointer" 
      onClick={() => navigate('/subscription')}
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