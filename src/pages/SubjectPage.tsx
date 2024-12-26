import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SubjectHeader } from "@/components/subject/SubjectHeader";
import { SubjectTabs } from "@/components/subject/SubjectTabs";
import { useToast } from "@/components/ui/use-toast";
import type { Subject } from "@/types/files";

export default function SubjectPage() {
  const { subjectId } = useParams();
  const [selectedCategory, setSelectedCategory] = useState("1");
  const { toast } = useToast();

  const { data: subject } = useQuery({
    queryKey: ["subject", subjectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .eq("id", subjectId)
        .single();

      if (error) throw error;
      return data as Subject;
    },
  });

  const { data: files = [] } = useQuery({
    queryKey: ["subject-files", subjectId, selectedCategory],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("files")
        .select(`
          id,
          title,
          created_at,
          file_path,
          category:categories(id, name),
          subject:subjects(id, code, name)
        `)
        .eq("subject_id", subjectId)
        .eq("category_id", selectedCategory);

      if (error) throw error;
      return data;
    },
  });

  const handleDownload = async (fileId: string, filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("dcg_files")
        .download(filePath);

      if (error) throw error;

      const url = window.URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Succès",
        description: "Le téléchargement a commencé",
      });
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de télécharger le fichier",
      });
    }
  };

  if (!subject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <SubjectHeader subject={subject} />
      <div className="container mx-auto px-4 py-8">
        <SubjectTabs
          files={files}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onDownload={handleDownload}
        />
      </div>
    </div>
  );
}