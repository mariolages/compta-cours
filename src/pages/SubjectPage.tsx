import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FileUploadDialog } from '@/components/dashboard/FileUploadDialog';
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubjectHeader } from "@/components/subject/SubjectHeader";
import { FileList } from "@/components/subject/FileList";
import { BookOpen, FileText, CheckSquare, Archive, CheckCircle } from "lucide-react";

interface Subject {
  id: number;
  code: string;
  name: string;
}

export default function SubjectPage() {
  const { subjectId } = useParams();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("1");
  const { toast } = useToast();

  const { data: subject, isLoading: isLoadingSubject } = useQuery({
    queryKey: ["subject", subjectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .eq("id", subjectId)
        .single();

      if (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les informations de la matière",
        });
        throw error;
      }
      return data as Subject;
    },
  });

  const { data: files, refetch: refetchFiles } = useQuery({
    queryKey: ["subject-files", subjectId, selectedCategory],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("files")
        .select(`
          id,
          title,
          created_at,
          file_path,
          category:category_id(id, name)
        `)
        .eq("subject_id", subjectId)
        .eq("category_id", selectedCategory)
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les fichiers",
        });
        throw error;
      }
      return data;
    },
  });

  const handleDownload = async (fileId: string, filePath: string) => {
    try {
      const { data, error: downloadError } = await supabase.storage
        .from("dcg_files")
        .download(filePath);

      if (downloadError) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de télécharger le fichier",
        });
        return;
      }

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = filePath.split("/").pop() || "download";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors du téléchargement",
      });
    }
  };

  if (isLoadingSubject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <SubjectHeader
          code={subject?.code || ""}
          name={subject?.name || ""}
          onUploadClick={() => setIsUploadOpen(true)}
        />

        <Tabs defaultValue="1" onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="w-full flex flex-wrap justify-start gap-2 bg-white p-2 rounded-lg mb-6">
            <TabsTrigger value="1" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Cours
            </TabsTrigger>
            <TabsTrigger value="2" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Exercices
            </TabsTrigger>
            <TabsTrigger value="3" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Corrections d'exercices
            </TabsTrigger>
            <TabsTrigger value="4" className="flex items-center gap-2">
              <Archive className="h-4 w-4" />
              Sujets d'examen
            </TabsTrigger>
            <TabsTrigger value="5" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Corrections de sujets
            </TabsTrigger>
          </TabsList>

          {["1", "2", "3", "4", "5"].map((categoryId) => (
            <TabsContent key={categoryId} value={categoryId}>
              <FileList files={files} onDownload={handleDownload} />
            </TabsContent>
          ))}
        </Tabs>

        <FileUploadDialog
          open={isUploadOpen}
          onOpenChange={setIsUploadOpen}
          onSuccess={() => {
            refetchFiles();
            setIsUploadOpen(false);
          }}
          defaultSubjectId={subjectId}
        />
      </div>
    </div>
  );
}