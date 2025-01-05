import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSessionContext } from '@supabase/auth-helpers-react';
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Messages from "./pages/Messages";
import SubjectPage from "./pages/SubjectPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Admin from "./pages/Admin";
import Subscription from "./pages/Subscription";
import { useToast } from "./components/ui/use-toast";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
});

const ProtectedRoute = ({ children, adminOnly = false, requireSubscription = true }: { 
  children: React.ReactNode, 
  adminOnly?: boolean,
  requireSubscription?: boolean 
}) => {
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
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const { data: subscription, isLoading: isLoadingSubscription } = useQuery({
    queryKey: ['subscription', session?.user?.id],
    queryFn: async () => {
      try {
        console.log('Vérification de l\'abonnement pour l\'utilisateur:', session?.user?.id);
        
        // Vérification de l'abonnement local
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

        // Vérification avec Stripe
        const { data: stripeCheck, error: stripeError } = await supabase.functions
          .invoke('check-subscription', {
            body: { user_id: session?.user?.id }
          });

        if (stripeError) {
          console.error('Erreur de vérification Stripe:', stripeError);
          throw stripeError;
        }

        console.log('Résultat de la vérification Stripe:', stripeCheck);

        // Si l'abonnement est actif dans Stripe
        if (stripeCheck?.subscribed) {
          // Mettre à jour ou créer l'abonnement local si nécessaire
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

        // Si pas d'abonnement actif dans Stripe mais un abonnement local actif
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
    refetchInterval: 10000, // Vérifier toutes les 10 secondes
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

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute requireSubscription={false}>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/messages" 
              element={
                <ProtectedRoute requireSubscription={false}>
                  <Messages />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/subjects/:subjectId" 
              element={
                <ProtectedRoute requireSubscription={false}>
                  <SubjectPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute adminOnly>
                  <Admin />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/subscription" 
              element={
                <ProtectedRoute requireSubscription={false}>
                  <Subscription />
                </ProtectedRoute>
              } 
            />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
