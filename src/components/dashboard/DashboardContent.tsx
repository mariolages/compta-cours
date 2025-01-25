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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSessionContext } from '@supabase/auth-helpers-react';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import type { Class } from "@/types/class";
import type { Subject } from "@/types/subject";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const flashcardSchema = z.object({
  question: z.string().min(1, "La question est requise"),
  answer: z.string().min(1, "La réponse est requise"),
});

const goalSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  target_date: z.string().min(1, "La date limite est requise"),
});

export function DashboardContent() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [lastRefresh] = useState<Date>(new Date());
  const [isFlashcardDialogOpen, setIsFlashcardDialogOpen] = useState(false);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { session } = useSessionContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const flashcardForm = useForm({
    resolver: zodResolver(flashcardSchema),
    defaultValues: {
      question: "",
      answer: "",
    },
  });

  const goalForm = useForm({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: "",
      target_date: new Date().toISOString().split('T')[0],
    },
  });

  // Fetch user profile
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });

  // Fetch study statistics
  const { data: studyStats = { time_spent: 0, completed_exercises: 0, correct_answers: 0 } } = useQuery({
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

  // Fetch classes
  const { data: classes = [], isLoading: isLoadingClasses } = useQuery<Class[]>({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('code');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch subjects for selected class
  const { data: subjects = [], isLoading: isLoadingSubjects } = useQuery<Subject[]>({
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
    enabled: !!selectedClassId
  });

  // Fetch flashcards
  const { data: flashcards = [] } = useQuery({
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

  // Fetch learning goals
  const { data: goals = [] } = useQuery({
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

  const handleClassClick = (classId: number) => {
    setSelectedClassId(classId);
  };

  const handleSubjectClick = (subjectId: number) => {
    navigate(`/subjects/${subjectId}`);
  };

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
      return;
    }

    queryClient.invalidateQueries({ queryKey: ['learning-goals'] });
  };

  const handleCreateFlashcard = async (data: z.infer<typeof flashcardSchema>) => {
    if (!session?.user?.id) return;

    const { error } = await supabase
      .from('flashcards')
      .insert([
        {
          user_id: session.user.id,
          question: data.question,
          answer: data.answer,
          difficulty: 1,
        }
      ]);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer la flashcard"
      });
      return;
    }

    queryClient.invalidateQueries({ queryKey: ['flashcards'] });
    setIsFlashcardDialogOpen(false);
    flashcardForm.reset();
    
    toast({
      title: "Succès",
      description: "Flashcard créée avec succès"
    });
  };

  const handleCreateGoal = async (data: z.infer<typeof goalSchema>) => {
    if (!session?.user?.id) return;

    const { error } = await supabase
      .from('learning_goals')
      .insert([
        {
          user_id: session.user.id,
          title: data.title,
          target_date: data.target_date,
          completed: false,
        }
      ]);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer l'objectif"
      });
      return;
    }

    queryClient.invalidateQueries({ queryKey: ['learning-goals'] });
    setIsGoalDialogOpen(false);
    goalForm.reset();
    
    toast({
      title: "Succès",
      description: "Objectif créé avec succès"
    });
  };

  if (isLoadingProfile || isLoadingClasses || isLoadingSubjects) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

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
          flashcards={flashcards}
          onAddFlashcard={() => setIsFlashcardDialogOpen(true)}
        />
        <LearningGoals
          goals={goals}
          onToggleGoal={handleToggleGoal}
          onAddGoal={() => setIsGoalDialogOpen(true)}
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

      <Dialog open={isFlashcardDialogOpen} onOpenChange={setIsFlashcardDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer une nouvelle flashcard</DialogTitle>
          </DialogHeader>
          <form onSubmit={flashcardForm.handleSubmit(handleCreateFlashcard)} className="space-y-4">
            <FormField
              control={flashcardForm.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Entrez la question" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={flashcardForm.control}
              name="answer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Réponse</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Entrez la réponse" />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Créer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un nouvel objectif</DialogTitle>
          </DialogHeader>
          <form onSubmit={goalForm.handleSubmit(handleCreateGoal)} className="space-y-4">
            <FormField
              control={goalForm.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Entrez le titre de l'objectif" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={goalForm.control}
              name="target_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date limite</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Créer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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