import { SubscriptionHeader } from "@/components/subscription/SubscriptionHeader";
import { SubscriptionPlans } from "@/components/subscription/SubscriptionPlans";
import { SecurityInfo } from "@/components/subscription/SecurityInfo";

export default function Subscription() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light via-white to-secondary py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-12">
        <SubscriptionHeader />

        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Accédez à tous les cours
          </h1>
          <p className="text-lg text-muted-foreground">
            Profitez d'un accès illimité à tous nos contenus pour réussir votre DCG ou BTS
          </p>
        </div>

        <SubscriptionPlans />

        <div className="max-w-lg mx-auto">
          <SecurityInfo />
        </div>
      </div>
    </div>
  );
}