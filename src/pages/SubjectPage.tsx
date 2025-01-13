import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { FileUploadDialog } from '@/components/dashboard/FileUploadDialog';
import { SubjectHeader } from "@/components/subject/SubjectHeader";
import { SubjectTabs } from "@/components/subject/SubjectTabs";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Subject } from "@/types/subject";

export default function SubjectPage({ hasSubscription = false }) {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("1");
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Convert subjectId from string to number
  const numericSubjectId = subjectId ? parseInt(subjectId, 10) : undefined;

  // Requête pour vérifier si l'utilisateur est admin
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: subject, isLoading: isLoadingSubject } = useQuery({
    queryKey: ["subject", numericSubjectId],
    queryFn: async () => {
      if (!numericSubjectId) throw new Error("Subject ID is required");

      const { data, error } = await supabase
        .from("subjects")
        .select("*, class:class_id(*)")
        .eq("id", numericSubjectId)
        .single();

      if (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les informations de la matière",
        });
        throw error;
      }
      return data as Subject & { class: { code: string } };
    },
    enabled: !!numericSubjectId,
  });

  const { data: files, refetch: refetchFiles } = useQuery({
    queryKey: ["subject-files", numericSubjectId, selectedCategory],
    queryFn: async () => {
      if (!numericSubjectId) throw new Error("Subject ID is required");

      const { data, error } = await supabase
        .from("files")
        .select(`
          id,
          title,
          created_at,
          file_path,
          category:category_id(id, name),
          subject:subject_id(id, code, name)
        `)
        .eq("subject_id", numericSubjectId)
        .eq("category_id", parseInt(selectedCategory, 10))
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
    enabled: !!numericSubjectId,
  });

  const handleDownload = async (fileId: string, filePath: string, fileName: string) => {
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
      const fileExt = filePath.split('.').pop();
      a.download = `${fileName}.${fileExt}`;
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 md:px-8 py-6 md:py-12 max-w-7xl">
        <div className="space-y-6 md:space-y-8">
          <SubjectHeader
            code={subject?.code || ""}
            name={subject?.name || ""}
            onUploadClick={() => setIsUploadOpen(true)}
            onDeleteClick={async () => {
              try {
                const { error } = await supabase
                  .from("subjects")
                  .delete()
                  .eq("id", numericSubjectId);

                if (error) throw error;

                toast({
                  title: "Succès",
                  description: "Le cours a été supprimé avec succès",
                });
                navigate("/dashboard");
              } catch (error) {
                toast({
                  variant: "destructive",
                  title: "Erreur",
                  description: "Impossible de supprimer le cours",
                });
              }
            }}
            isAdmin={profile?.is_admin}
          />

          <SubjectTabs
            files={files}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onDownload={handleDownload}
            isMobile={isMobile}
            hasSubscription={hasSubscription}
            classCode={subject?.class?.code}
            subjectId={numericSubjectId?.toString()} // Convert to string here
            isAdmin={profile?.is_admin}
          />
        </div>

        <FileUploadDialog
          open={isUploadOpen}
          onOpenChange={setIsUploadOpen}
          onSuccess={() => {
            refetchFiles();
            setIsUploadOpen(false);
          }}
          defaultSubjectId={numericSubjectId?.toString()} // Convert to string here
        />
      </div>
    </div>
  );
}