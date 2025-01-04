import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";

export const SecurityInfo = () => {
  return (
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
  );
};