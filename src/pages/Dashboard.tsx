import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { WelcomeCard } from "@/components/dashboard/WelcomeCard";
import { ClassesGrid } from "@/components/dashboard/ClassesGrid";

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const paymentStatus = searchParams.get('payment_status');
    const sessionId = searchParams.get('session_id');

    const checkPaymentStatus = async () => {
      if (paymentStatus === 'success' && sessionId) {
        try {
          const { data, error } = await supabase.functions.invoke('check-payment-status', {
            body: { session_id: sessionId }
          });

          if (error) throw error;

          if (data.success) {
            // Rafraîchir les données de l'utilisateur
            await queryClient.invalidateQueries({ queryKey: ['user'] });
            
            toast({
              title: "Paiement réussi",
              description: "Votre abonnement a été activé avec succès.",
            });
          }
        } catch (error) {
          console.error('Error checking payment status:', error);
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Une erreur est survenue lors de la vérification du paiement.",
          });
        }
      }

      // Nettoyer l'URL
      if (paymentStatus || sessionId) {
        navigate('/dashboard', { replace: true });
      }
    };

    checkPaymentStatus();
  }, [location.search]);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <WelcomeCard />
          <ClassesGrid />
        </div>
      </main>
    </div>
  );
}