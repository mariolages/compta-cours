import React, { useEffect, useState } from 'react';
import { useMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { FileCard } from "@/components/subject/FileCard";
import { EmptyFileList } from "@/components/subject/EmptyFileList";

const SubjectPage = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const isMobile = useMobile();

  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('files')
          .select('*')
          .eq('subject_id', subjectId);

        if (error) throw error;

        setFiles(data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les fichiers.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [subjectId, toast]);

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  if (files.length === 0) {
    return <EmptyFileList searchQuery="" />;
  }

  return (
    <div className={`container mx-auto px-4 py-8 ${isMobile ? 'mobile-class' : 'desktop-class'}`}>
      <h1 className="text-2xl font-bold mb-4">Fichiers pour la matière</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map(file => (
          <FileCard key={file.id} file={file} />
        ))}
      </div>
    </div>
  );
};

export default SubjectPage;
