import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { supabase } from "@/integrations/supabase/client";
import { WelcomeCard } from './WelcomeCard';
import { StatsCards } from './StatsCards';
import { ExamCalendar } from './ExamCalendar';
import { LearningGoals } from './LearningGoals';
import { ClassSelector } from './ClassSelector';
import { SubjectsGrid } from './SubjectsGrid';
import { motion } from "framer-motion";

export function DashboardContent() {
  const navigate = useNavigate();
  const { session } = useSessionContext();
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);

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

  const { data: classes = [], isLoading: isLoadingClasses } = useQuery({
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

  const { data: subjects = [], isLoading: isLoadingSubjects } = useQuery({
    queryKey: ['subjects', selectedClassId || profile?.class_id],
    queryFn: async () => {
      const classId = selectedClassId || profile?.class_id;
      if (!classId) return [];
      
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('class_id', classId)
        .order('code');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!(selectedClassId || profile?.class_id)
  });

  const { data: stats } = useQuery({
    queryKey: ['study_statistics', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data, error } = await supabase
        .from('study_statistics')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      // Transform the data to match the expected format
      return {
        totalUsers: 0,
        totalFiles: 0,
        totalDownloads: 0,
        studyTime: data?.time_spent || 0,
        completedExercises: data?.completed_exercises || 0,
        correctAnswers: data?.correct_answers || 0
      };
    },
    enabled: !!session?.user?.id
  });

  const handleClassChange = async (classId: string) => {
    if (!session?.user?.id) return;

    setSelectedClassId(parseInt(classId));

    const { error } = await supabase
      .from('profiles')
      .update({ class_id: parseInt(classId) })
      .eq('id', session.user.id);

    if (error) {
      console.error('Error updating class:', error);
      return;
    }
  };

  if (isLoadingProfile || isLoadingClasses || isLoadingSubjects) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8 space-y-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WelcomeCard lastRefresh={new Date()} />
        </div>
        <div className="lg:col-span-1">
          <ClassSelector 
            classes={classes}
            selectedClassId={selectedClassId || profile?.class_id || null}
            onClassChange={handleClassChange}
          />
        </div>
      </div>

      <StatsCards stats={stats || {
        totalUsers: 0,
        totalFiles: 0,
        totalDownloads: 0,
        studyTime: 0,
        completedExercises: 0,
        correctAnswers: 0
      }} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ExamCalendar />
        <LearningGoals
          goals={[]}
          onToggleGoal={() => {}}
          onAddGoal={() => {}}
        />
      </div>

      {(selectedClassId || profile?.class_id) ? (
        <SubjectsGrid 
          subjects={subjects} 
          onSubjectClick={(subjectId) => navigate(`/subjects/${subjectId}`)}
        />
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Sélectionnez votre classe
          </h3>
          <p className="text-gray-600">
            Pour voir les matières disponibles, veuillez d'abord sélectionner votre classe
          </p>
        </div>
      )}
    </motion.div>
  );
}
