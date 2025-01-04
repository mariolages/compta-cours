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
import SubjectPage from "./pages/SubjectPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Admin from "./pages/Admin";
import Subscription from "./pages/Subscription";

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
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', session?.user?.id)
        .eq('status', 'active')
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!session?.user?.id && requireSubscription,
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

  if (requireSubscription && !subscription && !profile?.is_admin) {
    return <Navigate to="/subscription" replace />;
  }

  return <>{children}</>;
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
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/subjects/:subjectId" 
              element={
                <ProtectedRoute>
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