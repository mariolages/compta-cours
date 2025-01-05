import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const paymentStatus = searchParams.get('payment_status');
  const { toast } = useToast();
  const navigate = useNavigate();
  const { session, isLoading: isLoadingSession } = useSessionContext();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (paymentStatus === 'success') {
      console.log('Payment successful, refreshing data...');
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      toast({
        title: "Paiement réussi",
        description: "Votre abonnement a été activé avec succès. Vous avez maintenant accès à tout le contenu.",
      });

      navigate('/dashboard', { replace: true });
    }
  }, [paymentStatus, toast, queryClient, navigate]);

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;

      const { data: existingProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();
      
      if (!existingProfile && !error) {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: session.user.id,
              full_name: session.user.email?.split('@')[0] || null,
              is_admin: false,
              is_validated: false
            }
          ])
          .select()
          .maybeSingle();

        if (createError) {
          console.error('Error creating profile:', createError);
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Impossible de créer votre profil",
          });
          throw createError;
        }

        return newProfile;
      }

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger votre profil",
        });
        throw error;
      }

      return existingProfile;
    },
    enabled: !!session?.user?.id,
  });

  const { data: subscription, isLoading: isLoadingSubscription } = useQuery({
    queryKey: ['subscription', session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', session?.user?.id)
        .eq('status', 'active')
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!session?.user?.id,
    refetchInterval: paymentStatus === 'success' ? 1000 : false,
  });

  if (!isLoadingSession && !session) {
    navigate('/login', { replace: true });
    return null;
  }

  if (isLoadingSession || isLoadingProfile || isLoadingSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <DashboardNav 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedClassId={null}
        onBackClick={() => {}}
        profile={profile}
        user={session?.user}
      />
      <DashboardContent />
    </div>
  );
}