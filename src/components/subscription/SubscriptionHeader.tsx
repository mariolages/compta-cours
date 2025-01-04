import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const SubscriptionHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center">
      <Button
        variant="ghost"
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-2 text-primary hover:text-primary-dark"
      >
        <ArrowLeft className="h-5 w-5" />
        Retour au tableau de bord
      </Button>
    </div>
  );
};