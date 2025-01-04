import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, RefreshCw, CreditCard } from "lucide-react";
import { FileUploadDialog } from '@/components/dashboard/FileUploadDialog';
import { SearchBar } from '@/components/dashboard/SearchBar';
import { ProfileMenu } from '@/components/dashboard/ProfileMenu';
import { WelcomeCard } from '@/components/dashboard/WelcomeCard';
import { ClassesGrid } from '@/components/dashboard/ClassesGrid';
import { SubjectsGrid } from '@/components/dashboard/SubjectsGrid';
import { useQuery } from '@tanstack/react-query';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Dashboard() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [lastRefresh] = useState<Date>(new Date());
  const { toast } = useToast();
  const navigate = useNavigate();
  const { session, isLoading: isLoadingSession } = useSessionContext();

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;

      // Try to get the profile
      const { data: existingProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();
      
      // If no profile exists, create one
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

  // Fetch subscription status
  const { data: subscription } = useQuery({
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
  });

  if (!isLoadingSession && !session) {
    navigate('/login', { replace: true });
    return null;
  }

  // Fetch classes
  const { data: classes = [], isLoading: isLoadingClasses } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('code');
      
      if (error) throw error;
      return data;
    },
    enabled: !!session,
  });

  // Fetch subjects for selected class
  const { data: subjects = [], isLoading: isLoadingSubjects } = useQuery({
    queryKey: ['subjects', selectedClassId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('class_id', selectedClassId)
        .order('code');
      
      if (error) throw error;
      return data;
    },
    enabled: !!session && !!selectedClassId,
  });

  const handleClassClick = (classId: number) => {
    setSelectedClassId(classId);
  };

  const handleSubjectClick = (subjectId: number) => {
    navigate(`/subjects/${subjectId}`);
  };

  if (isLoadingSession || isLoadingProfile) {
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
            <div className="flex items-center gap-4">
              {selectedClassId && (
                <Button
                  variant="ghost"
                  onClick={() => setSelectedClassId(null)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  ← Retour
                </Button>
              )}
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
              <ProfileMenu user={session?.user} profile={profile} />
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 space-y-8">
        <WelcomeCard lastRefresh={lastRefresh} />

        {/* Subscription Card */}
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 hover:from-primary/10 hover:to-accent/10 transition-colors cursor-pointer" onClick={() => navigate('/subscription')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              {subscription ? 'Gérer mon abonnement' : 'S\'abonner'}
            </CardTitle>
            <CardDescription>
              {subscription 
                ? 'Accédez à vos informations d\'abonnement'
                : 'Débloquez l\'accès à tous les contenus'}
            </CardDescription>
          </CardHeader>
        </Card>
        
        {selectedClassId ? (
          <SubjectsGrid subjects={subjects} onSubjectClick={handleSubjectClick} />
        ) : (
          <ClassesGrid classes={classes} onClassClick={handleClassClick} />
        )}

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
