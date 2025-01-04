import { Check, CreditCard } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PremiumPlanProps {
  plan: {
    name: string;
    price: string;
    description: string;
    features: string[];
    icon: any;
  };
  onSubscribe: () => void;
  isLoading: boolean;
}

export const PremiumPlanCard = ({ plan, onSubscribe, isLoading }: PremiumPlanProps) => {
  const Icon = plan.icon;
  
  return (
    <Card className="relative overflow-hidden max-w-md w-full border-primary/10 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
      <div className="absolute -right-20 -top-20 h-40 w-40 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute top-0 right-0 bg-primary text-white px-4 py-1 text-sm rounded-bl-lg font-medium">
        Offre limitée
      </div>
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2">
          <Icon className="h-7 w-7 text-primary" />
          <CardTitle className="text-2xl">{plan.name}</CardTitle>
        </div>
        <CardDescription className="text-base">{plan.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-1">
          <div className="text-4xl font-bold text-primary flex items-start">
            {plan.price}€
            <span className="text-sm font-normal text-muted-foreground mt-2 ml-1">/mois</span>
          </div>
          <div className="text-sm text-muted-foreground">Sans engagement - Annulable à tout moment</div>
        </div>
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <div className="mt-1">
                <Check className="h-4 w-4 text-primary shrink-0" />
              </div>
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={onSubscribe}
          className="w-full text-lg h-12 bg-primary hover:bg-primary-hover gap-2"
          disabled={isLoading}
        >
          <CreditCard className="h-5 w-5" />
          {isLoading ? 'Chargement...' : "S'abonner maintenant"}
        </Button>
      </CardFooter>
    </Card>
  );
};