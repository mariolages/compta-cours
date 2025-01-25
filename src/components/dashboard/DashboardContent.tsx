import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { supabase } from "@/integrations/supabase/client";
import { WelcomeCard } from './WelcomeCard';
import { StatsCards } from './StatsCards';
import { ExamCalendar } from './ExamCalendar';
import { LearningGoals } from './LearningGoals';
import { ClassSelector } from './ClassSelector';
import { SubjectsGrid } from './SubjectsGrid';

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
        .order('name');
      
      if (error) throw error;
      return data;
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
      return data;
    },
    enabled: !!(selectedClassId || profile?.class_id)
  });

  const { data: studyStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['study_statistics', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;

      const { data, error } = await supabase
        .from('study_statistics')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      // If no stats exist yet, return default values
      if (!data) {
        return {
          totalUsers: 0,
          totalFiles: 0,
          totalDownloads: 0,
          studyTime: 0,
          completedExercises: 0,
          correctAnswers: 0
        };
      }

      // Transform the data to match the expected format
      return {
        totalUsers: 1,
        totalFiles: 0,
        totalDownloads: 0,
        studyTime: data.time_spent || 0,
        completedExercises: data.completed_exercises || 0,
        correctAnswers: data.correct_answers || 0
      };
    },
    enabled: !!session?.user?.id
  });

  // Show loading state while critical data is being fetched
  if (isLoadingProfile || isLoadingClasses) {
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
      <WelcomeCard lastRefresh={new Date()} />

      <ClassSelector
        classes={classes}
        selectedClassId={selectedClassId}
        onClassSelect={setSelectedClassId}
      />

      <StatsCards stats={studyStats || {
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
          onSubjectClick={(subjectId) => {
            navigate(`/subjects/${subjectId}`);
          }}
        />
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">
            Sélectionnez une classe pour voir les matières disponibles
          </p>
        </div>
      )}
    </motion.div>
  );
}