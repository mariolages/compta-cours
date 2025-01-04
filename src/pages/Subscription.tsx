import { SubscriptionHeader } from "@/components/subscription/SubscriptionHeader";
import { SubscriptionPlans } from "@/components/subscription/SubscriptionPlans";
import { SecurityInfo } from "@/components/subscription/SecurityInfo";

export default function Subscription() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-background py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-12">
        <SubscriptionHeader />

        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Choisissez votre formule</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Accédez à l'intégralité du contenu et des fonctionnalités pour réussir votre DCG ou BTS
          </p>
        </div>

        <SubscriptionPlans />

        <div className="max-w-4xl mx-auto">
          <SecurityInfo />
        </div>
      </div>
    </div>
  );
}