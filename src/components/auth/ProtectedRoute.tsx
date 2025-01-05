import React from 'react';
import { Navigate } from "react-router-dom";
import { useSessionContext } from '@supabase/auth-helpers-react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { Profile } from "@/types/admin";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  requireSubscription?: boolean;
}

export const ProtectedRoute = ({ 
  children, 
  adminOnly = false,
  requireSubscription = true 
}: ProtectedRouteProps) => {
  const { session, isLoading } = useSessionContext();
  const { toast } = useToast();

  // Récupérer le statut de paiement depuis l'URL
  const paymentStatus = new URLSearchParams(window.location.search).get('payment_status');

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session?.user?.id)
        .single();
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!session?.user?.id,
  });

  const { data: subscription, isLoading: isLoadingSubscription } = useQuery({
    queryKey: ['subscription', session?.user?.id, paymentStatus],
    queryFn: async () => {
      try {
        console.log('Vérification de l\'abonnement pour l\'utilisateur:', session?.user?.id);
        
        // Si le paiement vient d'être effectué, forcer une vérification complète
        if (paymentStatus === 'success') {
          console.log('Paiement réussi détecté, vérification de l\'abonnement...');
          
          const { data: stripeCheck, error: stripeError } = await supabase.functions
            .invoke('check-subscription', {
              body: { user_id: session?.user?.id }
            });

          if (stripeError) {
            console.error('Erreur de vérification Stripe:', stripeError);
            throw stripeError;
          }

          console.log('Résultat de la vérification Stripe après paiement:', stripeCheck);

          if (stripeCheck?.subscribed) {
            // Mettre à jour l'abonnement local
            const { error: upsertError } = await supabase
              .from('subscriptions')
              .upsert({
                user_id: session?.user?.id,
                status: 'active',
                stripe_customer_id: stripeCheck.customerId,
              });

            if (upsertError) {
              console.error('Erreur de mise à jour de l\'abonnement:', upsertError);
              throw upsertError;
            }

            toast({
              title: "Abonnement activé",
              description: "Votre abonnement a été activé avec succès !",
            });

            window.history.replaceState({}, '', window.location.pathname);
            return { status: 'active' };
          }
        }

        // Vérification normale de l'abonnement
        const { data: localSub, error: localError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', session?.user?.id)
          .eq('status', 'active')
          .maybeSingle();

        if (localError) {
          console.error('Erreur de vérification locale:', localError);
          throw localError;
        }

        console.log('Statut d\'abonnement local:', localSub);
        return localSub;

      } catch (error) {
        console.error('Erreur de vérification d\'abonnement:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de vérifier votre abonnement",
        });
        throw error;
      }
    },
    enabled: !!session?.user?.id && requireSubscription,
    refetchInterval: paymentStatus === 'success' ? 1000 : 10000, // Vérifier plus fréquemment après un paiement
    gcTime: 0,
    staleTime: 0,
    retry: 3, // Réessayer 3 fois en cas d'échec
  });

  if (isLoading || isLoadingProfile || (requireSubscription && isLoadingSubscription)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !profile?.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Vérifier si l'utilisateur a un abonnement actif
  const hasActiveSubscription = subscription?.status === 'active';
  console.log('Statut de l\'abonnement actif:', hasActiveSubscription);

  // Si un abonnement est requis et que l'utilisateur n'en a pas, rediriger vers la page d'abonnement
  if (requireSubscription && !hasActiveSubscription && !profile?.is_admin) {
    console.log('Redirection vers la page d\'abonnement - Pas d\'abonnement actif');
    return <Navigate to="/subscription" replace />;
  }

  return <>{React.cloneElement(children as React.ReactElement, { 
    hasSubscription: hasActiveSubscription || profile?.is_admin,
    profile: profile
  })}</>;
};