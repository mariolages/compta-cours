import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, RefreshCw } from "lucide-react";
import { FileUploadDialog } from '@/components/dashboard/FileUploadDialog';
import { SearchBar } from '@/components/dashboard/SearchBar';
import { ProfileMenu } from '@/components/dashboard/ProfileMenu';
import { WelcomeCard } from '@/components/dashboard/WelcomeCard';
import { SubjectsGrid } from '@/components/dashboard/SubjectsGrid';
import type { Subject } from '@/types/subject';
import { useQuery } from '@tanstack/react-query';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function Dashboard() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastRefresh] = useState<Date>(new Date());
  const [isValidated, setIsValidated] = useState<boolean | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Vérifier si l'utilisateur est connecté et validé
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_validated, is_banned')
        .eq('id', user.id)
        .single();

      if (profile?.is_banned) {
        toast({
          variant: "destructive",
          title: "Compte banni",
          description: "Votre compte a été banni. Contactez l'administrateur pour plus d'informations.",
        });
        await supabase.auth.signOut();
        navigate('/login');
        return;
      }

      setIsValidated(profile?.is_validated ?? false);
    };

    checkAuth();
  }, [navigate]);

  const { data: subjects = [], isLoading, error } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      console.log("Fetching subjects...");
      const { data, error } = await supabase
        .from('subjects')
        .select('*');
      
      if (error) {
        console.error("Error fetching subjects:", error);
        throw error;
      }
      
      return data.sort((a, b) => {
        const numA = parseInt(a.code.match(/\d+/)[0]);
        const numB = parseInt(b.code.match(/\d+/)[0]);
        return numA - numB;
      });
    },
    enabled: isValidated === true, // Ne charge les sujets que si l'utilisateur est validé
  });

  if (error) {
    console.error("Query error:", error);
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Impossible de charger les matières",
    });
  }

  if (isValidated === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-4">
        <div className="max-w-2xl mx-auto mt-20">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Compte non validé</AlertTitle>
            <AlertDescription>
              Votre compte est en attente de validation par un administrateur. 
              Vous recevrez une notification par email une fois votre compte validé.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (isLoading || isValidated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                compta-cours.fr
              </h1>
            </div>
            
            <SearchBar value={searchQuery} onChange={setSearchQuery} />

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.location.reload()}
                className="relative"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <ProfileMenu />
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 space-y-8">
        <WelcomeCard lastRefresh={lastRefresh} />
        <SubjectsGrid subjects={subjects} onSubjectClick={(id) => navigate(`/subjects/${id}`)} />

        <FileUploadDialog 
          open={isUploadOpen} 
          onOpenChange={setIsUploadOpen}
          onSuccess={() => {
            setIsUploadOpen(false);
          }}
        />

        <Button
          onClick={() => setIsUploadOpen(true)}
          className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg hover:shadow-xl bg-primary hover:bg-primary-hover transition-all duration-300 animate-fade-in"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}