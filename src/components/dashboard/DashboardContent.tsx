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
import { motion, AnimatePresence } from "framer-motion";

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
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear"
          }}
          className="rounded-full h-32 w-32 border-b-2 border-primary"
        />
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