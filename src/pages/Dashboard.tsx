import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FileUploadDialog } from '@/components/dashboard/FileUploadDialog';
import { WelcomeCard } from '@/components/dashboard/WelcomeCard';
import { ClassesGrid } from '@/components/dashboard/ClassesGrid';
import { SubjectsGrid } from '@/components/dashboard/SubjectsGrid';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { DashboardLoader } from '@/components/dashboard/DashboardLoader';

export default function Dashboard() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [lastRefresh] = useState<Date>(new Date());
  const { toast } = useToast();
  const navigate = useNavigate();
  const { session, isLoading: isLoadingSession } = useSessionContext();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const paymentStatus = searchParams.get('payment_status');

  // Effet pour gérer le statut du paiement
  useEffect(() => {
    if (paymentStatus === 'success') {
      console.log('Payment successful, refreshing data...');
      
      // Rafraîchir les données de l'abonnement et du profil
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      // Afficher le message de succès
      toast({
        title: "Paiement réussi",
        description: "Votre abonnement a été activé avec succès. Vous avez maintenant accès à tout le contenu.",
      });

      // Nettoyer l'URL
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
          .single();

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

  // Fetch subscription status with more frequent updates after payment
  const { data: subscription, isLoading: isLoadingSubscription } = useQuery({
    queryKey: ['subscription', session?.user?.id],
    queryFn: async () => {
      console.log('Fetching subscription status...');
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', session?.user?.id)
        .eq('status', 'active')
        .maybeSingle();
      
      console.log('Subscription data:', data);
      console.log('Subscription error:', error);
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!session?.user?.id,
    refetchInterval: paymentStatus === 'success' ? 1000 : false, // Rafraîchir toutes les secondes si le paiement vient d'être effectué
  });

  if (!isLoadingSession && !session) {
    navigate('/login', { replace: true });
    return null;
  }

  if (isLoadingSession || isLoadingProfile || isLoadingSubscription) {
    return <DashboardLoader />;
  }

  return (
    <DashboardContent
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      selectedClassId={selectedClassId}
      onClassSelect={setSelectedClassId}
      isUploadOpen={isUploadOpen}
      onUploadOpenChange={setIsUploadOpen}
      profile={profile}
      user={session?.user}
      lastRefresh={lastRefresh}
    />
  );
}