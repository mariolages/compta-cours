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
    queryKey: ['subscription', session?.user?.id],
    queryFn: async () => {
      try {
        console.log('Vérification de l\'abonnement pour l\'utilisateur:', session?.user?.id);
        
        const { data: localSub, error: localError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', session?.user?.id)
          .maybeSingle();

        if (localError) {
          console.error('Erreur de vérification locale:', localError);
          throw localError;
        }

        console.log('Statut d\'abonnement local:', localSub);

        const { data: stripeCheck, error: stripeError } = await supabase.functions
          .invoke('check-subscription', {
            body: { user_id: session?.user?.id }
          });

        if (stripeError) {
          console.error('Erreur de vérification Stripe:', stripeError);
          throw stripeError;
        }

        console.log('Résultat de la vérification Stripe:', stripeCheck);

        if (stripeCheck?.subscribed) {
          if (!localSub || localSub.status !== 'active') {
            const { error: upsertError } = await supabase
              .from('subscriptions')
              .upsert({
                user_id: session?.user?.id,
                status: 'active',
                stripe_customer_id: stripeCheck.customerId,
              });

            if (upsertError) {
              console.error('Erreur de mise à jour de l\'abonnement:', upsertError);
            }
          }
          return { status: 'active' };
        }

        if (localSub?.status === 'active') {
          const { error: updateError } = await supabase
            .from('subscriptions')
            .update({ status: 'inactive' })
            .eq('user_id', session?.user?.id);

          if (updateError) {
            console.error('Erreur de mise à jour du statut:', updateError);
          }
        }

        return null;
      } catch (error) {
        console.error('Erreur de vérification d\'abonnement:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de vérifier votre abonnement",
        });
        return null;
      }
    },
    enabled: !!session?.user?.id && requireSubscription,
    refetchInterval: 10000,
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

  return <>{React.cloneElement(children as React.ReactElement, { 
    hasSubscription: !!subscription || profile?.is_admin,
    profile: profile
  })}</>;
};