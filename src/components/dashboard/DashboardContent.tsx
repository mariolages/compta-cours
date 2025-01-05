import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Star } from "lucide-react";
import { FileUploadDialog } from '@/components/dashboard/FileUploadDialog';
import { WelcomeCard } from '@/components/dashboard/WelcomeCard';
import { ClassesGrid } from '@/components/dashboard/ClassesGrid';
import { SubjectsGrid } from '@/components/dashboard/SubjectsGrid';
import { ExamCalendar } from '@/components/dashboard/ExamCalendar';
import { FavoritesList } from '@/components/dashboard/FavoritesList';
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

  const { data: profile } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const { data: classes = [], isLoading: isLoadingClasses } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('code');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!session,
  });

  const { data: subjects = [], isLoading: isLoadingSubjects } = useQuery({
    queryKey: ['subjects', selectedClassId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('class_id', selectedClassId)
        .order('code');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!session && !!selectedClassId,
  });

  const handleClassClick = (classId: number) => {
    setSelectedClassId(classId);
  };

  const handleSubjectClick = (subjectId: number) => {
    navigate(`/subjects/${subjectId}`);
  };

  if (isLoadingClasses || isLoadingSubjects) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <WelcomeCard lastRefresh={lastRefresh} />
      
      <Tabs defaultValue="classes" className="w-full">
        <TabsList>
          <TabsTrigger value="classes">Classes et Matières</TabsTrigger>
          <TabsTrigger value="favorites">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Favoris
            </div>
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendrier d'examens
            </div>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="classes">
          {selectedClassId ? (
            <SubjectsGrid subjects={subjects} onSubjectClick={handleSubjectClick} />
          ) : (
            <ClassesGrid classes={classes} onClassClick={handleClassClick} />
          )}
        </TabsContent>

        <TabsContent value="favorites">
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-8">
            <FavoritesList />
          </div>
        </TabsContent>
        
        <TabsContent value="calendar">
          <ExamCalendar />
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