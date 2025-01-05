import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSessionContext } from "@supabase/auth-helpers-react";

interface AccessDeniedProps {
  isFirstYear: boolean;
}

export const AccessDenied = ({ isFirstYear }: AccessDeniedProps) => {
  const navigate = useNavigate();
  const { session } = useSessionContext();

  const { data: subscription } = useQuery({
    queryKey: ["subscription", session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", session?.user?.id)
        .eq("status", "active")
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  // Si l'utilisateur a un abonnement actif, on ne montre pas le composant
  if (subscription?.status === "active") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-lg">
        <Lock className="w-16 h-16 mx-auto text-primary" />
        <h1 className="text-2xl font-bold text-gray-900">Contenu Premium</h1>
        <p className="text-gray-600">
          {isFirstYear 
            ? "Les corrections, exercices et sujets d'examen sont réservés aux membres premium."
            : "Ce cours est réservé aux membres premium."} 
          Abonnez-vous pour accéder à tout le contenu.
        </p>
        <Button 
          onClick={() => navigate('/subscription')}
          size="lg"
          className="w-full md:w-auto"
        >
          S'abonner maintenant
        </Button>
      </div>
    </div>
  );
};