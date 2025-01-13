import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FileUploadDialog } from '@/components/dashboard/FileUploadDialog';
import { WelcomeCard } from '@/components/dashboard/WelcomeCard';
import { ClassesGrid } from '@/components/dashboard/ClassesGrid';
import { SubjectsGrid } from '@/components/dashboard/SubjectsGrid';
import { AIChatBox } from '@/components/dashboard/AIChatBox';
import { useQuery } from "@tanstack/react-query";
import { useSessionContext } from '@supabase/auth-helpers-react';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function DashboardContent() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [lastRefresh] = useState<Date>(new Date());
  const navigate = useNavigate();
  const { session } = useSessionContext();

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error) {
        console.error('Erreur lors du chargement du profil:', error);
        throw error;
      }
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const { data: classes = [], isLoading: isLoadingClasses, error: classesError } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      console.log('Chargement des classes...');
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('code');
      
      if (error) {
        console.error('Erreur lors du chargement des classes:', error);
        throw error;
      }
      console.log('Classes chargées:', data);
      return data || [];
    },
    enabled: !!session,
  });

  const { data: subjects = [], isLoading: isLoadingSubjects, error: subjectsError } = useQuery({
    queryKey: ['subjects', selectedClassId],
    queryFn: async () => {
      console.log('Chargement des matières pour la classe:', selectedClassId);
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('class_id', selectedClassId)
        .order('code');
      
      if (error) {
        console.error('Erreur lors du chargement des matières:', error);
        throw error;
      }
      console.log('Matières chargées:', data);
      return data || [];
    },
    enabled: !!session && !!selectedClassId,
  });

  const handleClassClick = (classId: number) => {
    console.log('Classe sélectionnée:', classId);
    setSelectedClassId(classId);
  };

  const handleSubjectClick = (subjectId: number) => {
    navigate(`/subjects/${subjectId}`);
  };

  if (isLoadingProfile || isLoadingClasses) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (classesError || subjectsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-500">Une erreur est survenue lors du chargement des données</p>
          <Button onClick={() => window.location.reload()}>Réessayer</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <WelcomeCard lastRefresh={lastRefresh} />
      
      <Tabs defaultValue="classes" className="w-full">
        <TabsList>
          <TabsTrigger value="classes">Classes et Matières</TabsTrigger>
          <TabsTrigger value="ai">Assistant IA</TabsTrigger>
        </TabsList>
        
        <TabsContent value="classes">
          {selectedClassId ? (
            <SubjectsGrid 
              subjects={subjects} 
              onSubjectClick={handleSubjectClick} 
            />
          ) : (
            <ClassesGrid 
              classes={classes} 
              onClassClick={handleClassClick} 
            />
          )}
        </TabsContent>

        <TabsContent value="ai">
          <AIChatBox />
        </TabsContent>
      </Tabs>

      <FileUploadDialog 
        open={isUploadOpen} 
        onOpenChange={setIsUploadOpen}
        onSuccess={() => {
          setIsUploadOpen(false);
        }}
      />

      {profile?.is_admin && (
        <Button
          onClick={() => setIsUploadOpen(true)}
          className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg hover:shadow-xl bg-primary hover:bg-primary-hover transition-all duration-300 animate-fade-in"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}