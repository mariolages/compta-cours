import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FileUploadDialog } from './FileUploadDialog';
import { WelcomeCard } from './WelcomeCard';
import { ClassesGrid } from './ClassesGrid';
import { SubjectsGrid } from './SubjectsGrid';
import { DashboardNav } from './DashboardNav';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import type { User } from '@supabase/auth-helpers-react';

interface DashboardContentProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedClassId: number | null;
  onClassSelect: (classId: number | null) => void;
  isUploadOpen: boolean;
  onUploadOpenChange: (isOpen: boolean) => void;
  profile: any;
  user: User | null;
  lastRefresh: Date;
}

export const DashboardContent = ({
  searchQuery,
  onSearchChange,
  selectedClassId,
  onClassSelect,
  isUploadOpen,
  onUploadOpenChange,
  profile,
  user,
  lastRefresh,
}: DashboardContentProps) => {
  // Fetch classes
  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('code');
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch subjects for selected class
  const { data: subjects = [] } = useQuery({
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
    enabled: !!selectedClassId,
  });

  const handleClassClick = (classId: number) => {
    onClassSelect(classId);
  };

  const handleSubjectClick = (subjectId: number) => {
    window.location.href = `/subjects/${subjectId}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <DashboardNav 
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        selectedClassId={selectedClassId}
        onBackClick={() => onClassSelect(null)}
        profile={profile}
        user={user}
      />

      <div className="container mx-auto px-4 py-8 space-y-8">
        <WelcomeCard lastRefresh={lastRefresh} />
        
        {selectedClassId ? (
          <SubjectsGrid subjects={subjects} onSubjectClick={handleSubjectClick} />
        ) : (
          <ClassesGrid classes={classes} onClassClick={handleClassClick} />
        )}

        <FileUploadDialog 
          open={isUploadOpen} 
          onOpenChange={onUploadOpenChange}
          onSuccess={() => {
            onUploadOpenChange(false);
          }}
        />

        <Button
          onClick={() => onUploadOpenChange(true)}
          className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg hover:shadow-xl bg-primary hover:bg-primary-hover transition-all duration-300 animate-fade-in"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};