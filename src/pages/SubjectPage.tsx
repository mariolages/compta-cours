import React, { useEffect, useState } from 'react';
import { useMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { EmptyFileList } from "@/components/subject/EmptyFileList";
import { File } from "@/types/files";

const SubjectPage = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const isMobile = useMobile();

  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('files')
          .select('*, category:categories(*), subject:subjects(*)')
          .eq('subject_id', parseInt(subjectId || '0', 10));

        if (error) throw error;

        setFiles(data || []);
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

    if (subjectId) {
      fetchFiles();
    }
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
          <div key={file.id} className="p-4 border rounded-lg">
            <h3 className="font-medium">{file.title}</h3>
            <p className="text-sm text-gray-500">
              {file.subject.name} - {file.category.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectPage;