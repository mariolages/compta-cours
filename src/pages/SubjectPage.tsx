import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMobile } from '@/hooks/use-mobile';
import { SubjectHeader } from '@/components/subject/SubjectHeader';
import { SubjectContent } from '@/components/subject/SubjectContent';
import { SubjectSidebar } from '@/components/subject/SubjectSidebar';
import { SubjectProgress } from '@/components/subject/SubjectProgress';
import { SubjectQuiz } from '@/components/subject/SubjectQuiz';
import { Skeleton } from '@/components/ui/skeleton';
import { analytics } from '@/services/analytics';

const SubjectPage = () => {
  const { subjectId } = useParams();
  const isMobile = useMobile();
  const [showSidebar, setShowSidebar] = useState(!isMobile);

  const { data: subject, isLoading } = useQuery({
    queryKey: ['subject', Number(subjectId)],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select(`
          *,
          chapters (
            *,
            lessons (*)
          )
        `)
        .eq('id', Number(subjectId))
        .single();

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (subject) {
      analytics.pageView(`subject/${subject.name}`);
    }
  }, [subject]);

  useEffect(() => {
    setShowSidebar(!isMobile);
  }, [isMobile]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Skeleton className="w-full h-[200px]" />
        <div className="container mx-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-[400px]" />
            <Skeleton className="h-[400px] md:col-span-2" />
          </div>
        </div>
      </div>
    );
  }

  if (!subject) {
    return <div>Sujet non trouvé</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <SubjectHeader 
        subject={subject} 
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
      />
      
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {showSidebar && (
            <div className="md:col-span-1">
              <SubjectSidebar subject={subject} />
            </div>
          )}
          
          <div className={showSidebar ? "md:col-span-2" : "md:col-span-3"}>
            <div className="space-y-8">
              <SubjectProgress subject={subject} />
              <SubjectContent subject={subject} />
              <SubjectQuiz subject={subject} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectPage;