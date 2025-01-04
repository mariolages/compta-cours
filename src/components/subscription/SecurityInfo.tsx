import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, ShieldCheck, CreditCard } from "lucide-react";

export const SecurityInfo = () => {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-primary/10 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <ShieldCheck className="h-6 w-6" />
          Paiement 100% Sécurisé
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <Lock className="h-5 w-5 text-primary mt-1" />
          <div>
            <p className="font-medium">Protection de vos données</p>
            <p className="text-sm text-muted-foreground">
              Vos informations personnelles sont chiffrées et sécurisées
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <CreditCard className="h-5 w-5 text-primary mt-1" />
          <div>
            <p className="font-medium">Paiement via Stripe</p>
            <p className="text-sm text-muted-foreground">
              Leader mondial du paiement en ligne sécurisé
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}