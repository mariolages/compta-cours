import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FileUploadDialog } from '@/components/dashboard/FileUploadDialog';
import { WelcomeCard } from '@/components/dashboard/WelcomeCard';
import { ClassesGrid } from '@/components/dashboard/ClassesGrid';
import { SubjectsGrid } from '@/components/dashboard/SubjectsGrid';
import { AIChatBox } from '@/components/dashboard/AIChatBox';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { FlashcardSection } from '@/components/dashboard/FlashcardSection';
import { LearningGoals } from '@/components/dashboard/LearningGoals';
import { useQuery } from "@tanstack/react-query";
import { useSessionContext } from '@supabase/auth-helpers-react';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

export function DashboardContent() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [lastRefresh] = useState<Date>(new Date());
  const navigate = useNavigate();
  const { session } = useSessionContext();
  const { toast } = useToast();

  const { data: studyStats } = useQuery({
    queryKey: ['study-stats', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data, error } = await supabase
        .from('study_statistics')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data || {
        time_spent: 0,
        completed_exercises: 0,
        correct_answers: 0
      };
    },
    enabled: !!session?.user?.id
  });

  const { data: flashcards } = useQuery({
    queryKey: ['flashcards', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!session?.user?.id
  });

  const { data: goals } = useQuery({
    queryKey: ['learning-goals', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      const { data, error } = await supabase
        .from('learning_goals')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!session?.user?.id
  });

  const handleToggleGoal = async (goalId: string) => {
    if (!session?.user?.id) return;
    
    const goal = goals?.find(g => g.id === goalId);
    if (!goal) return;

    const { error } = await supabase
      .from('learning_goals')
      .update({ completed: !goal.completed })
      .eq('id', goalId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour l'objectif"
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8 space-y-8"
    >
      <WelcomeCard lastRefresh={lastRefresh} />
      
      <StatsCards
        stats={{
          totalUsers: 0,
          totalFiles: 0,
          totalDownloads: 0,
          studyTime: studyStats?.time_spent || 0,
          completedExercises: studyStats?.completed_exercises || 0,
          correctAnswers: studyStats?.correct_answers || 0
        }}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <FlashcardSection
          flashcards={flashcards || []}
          onAddFlashcard={() => {
            toast({
              title: "Bientôt disponible",
              description: "La création de flashcards sera bientôt disponible"
            });
          }}
        />
        <LearningGoals
          goals={goals || []}
          onToggleGoal={handleToggleGoal}
          onAddGoal={() => {
            toast({
              title: "Bientôt disponible",
              description: "La création d'objectifs sera bientôt disponible"
            });
          }}
        />
      </div>
      
      <Tabs defaultValue="classes" className="w-full">
        <TabsList className="w-full sm:w-auto flex justify-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <TabsTrigger value="classes" className="flex-1 sm:flex-none">Classes et Matières</TabsTrigger>
          <TabsTrigger value="ai" className="flex-1 sm:flex-none">Assistant IA</TabsTrigger>
        </TabsList>
        
        <AnimatePresence mode="wait">
          <TabsContent value="classes" className="mt-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {selectedClassId ? (
                <SubjectsGrid subjects={subjects} onSubjectClick={handleSubjectClick} />
              ) : (
                <ClassesGrid classes={classes} onClassClick={handleClassClick} />
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="ai">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AIChatBox />
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>

      <FileUploadDialog 
        open={isUploadOpen} 
        onOpenChange={setIsUploadOpen}
        onSuccess={() => {
          setIsUploadOpen(false);
        }}
      />

      {profile?.is_admin && (
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={() => setIsUploadOpen(true)}
            className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg hover:shadow-xl bg-primary hover:bg-primary/90 transition-all duration-300"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
