import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { WelcomeCard } from "@/components/dashboard/WelcomeCard";
import { ClassesGrid } from "@/components/dashboard/ClassesGrid";
import { useSessionContext } from '@supabase/auth-helpers-react';

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [lastRefresh] = useState(new Date());
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { session } = useSessionContext();

  const { data: profile } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session?.user?.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      console.log('Fetching classes...');
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('code');
      if (error) throw error;
      console.log('Classes fetched:', data);
      return data;
    },
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const paymentStatus = searchParams.get('payment_status');
    const sessionId = searchParams.get('session_id');

    const checkPaymentStatus = async () => {
      if (paymentStatus === 'success' && sessionId) {
        console.log('Checking payment status for session:', sessionId);
        try {
          const { data, error } = await supabase.functions.invoke('check-payment-status', {
            body: { session_id: sessionId }
          });

          if (error) throw error;

          if (data.success) {
            // Rafraîchir les données de l'utilisateur
            await queryClient.invalidateQueries({ queryKey: ['profile'] });
            
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
  }, [location.search, navigate, queryClient, toast]);

  const handleClassClick = (classId: number) => {
    setSelectedClassId(classId);
    navigate(`/subjects/${classId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedClassId={selectedClassId}
        onBackClick={() => setSelectedClassId(null)}
        profile={profile}
        user={session?.user}
      />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <WelcomeCard lastRefresh={lastRefresh} />
          <ClassesGrid 
            classes={classes}
            onClassClick={handleClassClick}
          />
        </div>
      </main>
    </div>
  );
}