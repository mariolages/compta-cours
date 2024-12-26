import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { SubjectHeader } from "@/components/subject/SubjectHeader";
import { SubjectTabs } from "@/components/subject/SubjectTabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSessionContext } from '@supabase/auth-helpers-react';
import type { Subject } from "@/types/subject";

export default function SubjectPage() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("1");
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { session, isLoading: isSessionLoading } = useSessionContext();

  const { data: subject, isLoading: isLoadingSubject } = useQuery({
    queryKey: ["subject", subjectId],
    queryFn: async () => {
      if (!subjectId) {
        throw new Error("No subject ID provided");
      }

      const { data, error } = await supabase
        .from("subjects")
        .select(`
          id,
          name,
          code
        `)
        .eq("id", subjectId)
        .single();

      if (error) {
        console.error("Error fetching subject:", error);
        throw error;
      }
      return data as Subject;
    },
    enabled: !!session,
    retry: false
  });

  const { data: files, refetch: refetchFiles } = useQuery({
    queryKey: ["subject-files", subjectId, selectedCategory],
    queryFn: async () => {
      if (!subjectId) {
        throw new Error("No subject ID provided");
      }

      const query = supabase
        .from("files")
        .select(`
          id,
          title,
          file_path,
          created_at,
          category:categories (
            id,
            name
          )
        `)
        .eq("subject_id", subjectId);

      if (selectedCategory !== "all") {
        query.eq("category_id", selectedCategory);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching files:", error);
        throw error;
      }
      return data;
    },
    enabled: !!session && !!subjectId,
    retry: false
  });

  const handleDownload = async (fileId: string, filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("dcg_files")
        .download(filePath);

      if (error) {
        throw error;
      }

      const url = window.URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Téléchargement réussi",
        description: "Le fichier a été téléchargé avec succès",
      });
    } catch (error) {
      console.error("Error downloading file:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de télécharger le fichier",
      });
    }
  };

  if (isSessionLoading || isLoadingSubject) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {subject && (
        <div className="container mx-auto px-4 py-8 space-y-8">
          <SubjectHeader
            code={subject.code}
            name={subject.name}
            onUploadClick={() => setIsUploadOpen(true)}
          />
          <SubjectTabs
            files={files || []}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onDownload={handleDownload}
            isUploadOpen={isUploadOpen}
            onUploadOpenChange={setIsUploadOpen}
            onUploadSuccess={() => {
              refetchFiles();
              setIsUploadOpen(false);
            }}
            isMobile={isMobile}
          />
        </div>
      )}
    </div>
  );
}