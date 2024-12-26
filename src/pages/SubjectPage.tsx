import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { FileUploadDialog } from '@/components/dashboard/FileUploadDialog';
import { SubjectHeader } from "@/components/subject/SubjectHeader";
import { SubjectTabs } from "@/components/subject/SubjectTabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSubjectDetails } from "@/hooks/use-subject-details";
import { useSubjectFiles } from "@/hooks/use-subject-files";

export default function SubjectPage() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("1");
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Check authentication and session
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login', { replace: true });
      }
    };
    checkAuth();
  }, [navigate]);

  const { data: subject, isLoading: isLoadingSubject } = useSubjectDetails(subjectId);
  const { data: files, refetch: refetchFiles } = useSubjectFiles(subjectId, selectedCategory);

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
                  .eq("id", subjectId);

                if (error) throw error;

                toast({
                  title: "Succès",
                  description: "Le cours a été supprimé avec succès",
                });
                navigate("/dashboard", { replace: true });
              } catch (error) {
                toast({
                  variant: "destructive",
                  title: "Erreur",
                  description: "Impossible de supprimer le cours",
                });
              }
            }}
          />

          <SubjectTabs
            files={files}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onDownload={handleDownload}
            isMobile={isMobile}
          />
        </div>

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