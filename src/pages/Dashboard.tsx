import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { WelcomeCard } from "@/components/dashboard/WelcomeCard";
import { ClassesGrid } from "@/components/dashboard/ClassesGrid";
import type { Class } from "@/types/class";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [lastRefresh] = useState(new Date());
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: classes, isLoading: isLoadingClasses } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      console.log('Fetching classes...');
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('code');
      
      if (error) throw error;
      console.log('Classes fetched:', data);
      return data as Class[];
    }
  });

  const handleClassClick = (classId: number) => {
    navigate(`/subjects/${classId}`);
  };

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
            await queryClient.invalidateQueries({ queryKey: ['subscription'] });
            
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

      if (paymentStatus || sessionId) {
        navigate('/dashboard', { replace: true });
      }
    };

    checkPaymentStatus();
  }, [location.search]);

  if (isLoadingClasses) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedClassId={null}
        onBackClick={() => {}}
      />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <WelcomeCard lastRefresh={lastRefresh} />
          <ClassesGrid 
            classes={classes || []} 
            onClassClick={handleClassClick}
          />
        </div>
      </main>
    </div>
  );
}