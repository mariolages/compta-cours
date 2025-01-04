import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Diamond, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ActiveSubscriptionProps {
  subscription: any;
  isLoading: boolean;
  onCancelSubscription: () => void;
  premiumPlan: {
    price: string;
  };
}

export const ActiveSubscription = ({ 
  subscription, 
  isLoading, 
  onCancelSubscription,
  premiumPlan 
}: ActiveSubscriptionProps) => {
  return (
    <div className="space-y-6">
      <Card className="max-w-md mx-auto border-primary/10 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Diamond className="h-6 w-6 text-primary" />
            Abonnement actif
          </CardTitle>
          <CardDescription>
            Votre abonnement Premium est actuellement actif
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Prochain paiement</p>
            <p className="font-medium">
              {subscription.current_period_end ? (
                format(new Date(subscription.current_period_end * 1000), "d MMMM yyyy", { locale: fr })
              ) : (
                "Date non disponible"
              )}
            </p>
          </div>
          {subscription.cancel_at && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Fin de l'abonnement</p>
              <p className="font-medium text-red-600">
                {format(new Date(subscription.cancel_at * 1000), "d MMMM yyyy", { locale: fr })}
              </p>
            </div>
          )}
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Montant</p>
            <p className="font-medium">{premiumPlan.price}€ / mois</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={onCancelSubscription}
            className="w-full bg-red-600 hover:bg-red-700"
            disabled={isLoading || !!subscription.cancel_at}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : subscription.cancel_at ? (
              "Abonnement déjà annulé"
            ) : (
              "Annuler l'abonnement"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};