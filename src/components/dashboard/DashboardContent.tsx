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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

  // Fetch user profile with class information
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*, class:class_id(*)')
        .eq('id', session.user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
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

  // Fetch subjects for user's class
  const { data: subjects = [], isLoading: isLoadingSubjects } = useQuery<Subject[]>({
    queryKey: ['subjects', profile?.class_id],
    queryFn: async () => {
      if (!profile?.class_id) return [];
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('class_id', profile.class_id)
        .order('code');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.class_id
  });

  const handleClassChange = async (classId: string) => {
    if (!session?.user?.id) return;

    const { error } = await supabase
      .from('profiles')
      .update({ class_id: parseInt(classId) })
      .eq('id', session.user.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour votre classe"
      });
      return;
    }

    queryClient.invalidateQueries({ queryKey: ['profile'] });
    toast({
      title: "Succès",
      description: "Votre classe a été mise à jour"
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
      <div className="flex justify-between items-center">
        <WelcomeCard lastRefresh={lastRefresh} />
        {!profile?.class_id && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Sélectionnez votre classe :</span>
            <Select onValueChange={handleClassChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Choisir une classe" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id.toString()}>
                    {cls.code} - {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      
      <StatsCards
        stats={{
          totalUsers: 0,
          totalFiles: 0,
          totalDownloads: 0,
          studyTime: 0,
          completedExercises: 0,
          correctAnswers: 0
        }}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <FlashcardSection
          flashcards={[]}
          onAddFlashcard={() => setIsFlashcardDialogOpen(true)}
        />
        <LearningGoals
          goals={[]}
          onToggleGoal={() => {}}
          onAddGoal={() => setIsGoalDialogOpen(true)}
        />
      </div>
      
      <Tabs defaultValue="subjects" className="w-full">
        <TabsList className="w-full flex justify-start bg-gray-50/50 p-4 rounded-lg mb-8">
          <TabsTrigger value="subjects" className="flex-1">Matières</TabsTrigger>
          <TabsTrigger value="ai" className="flex-1">Assistant IA</TabsTrigger>
        </TabsList>
        
        <AnimatePresence mode="wait">
          <TabsContent value="subjects" className="mt-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {profile?.class_id ? (
                <SubjectsGrid subjects={subjects} onSubjectClick={() => {}} />
              ) : (
                <div className="text-center py-8">
                  <h3 className="text-lg font-semibold text-gray-700">
                    Veuillez sélectionner votre classe pour voir les matières
                  </h3>
                </div>
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
          <form onSubmit={flashcardForm.handleSubmit(() => {})} className="space-y-4">
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
          <form onSubmit={goalForm.handleSubmit(() => {})} className="space-y-4">
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
