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
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export default function SubjectPage({ hasSubscription = false }) {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("1");
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const { data: subject, isLoading: isLoadingSubject } = useQuery({
    queryKey: ["subject", subjectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subjects")
        .select("*, class:class_id(*)")
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
      return data as Subject & { class: { code: string } };
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
          category:category_id(id, name),
          subject:subject_id(id, code, name)
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

  // Vérifie si c'est le premier cours de n'importe quelle classe (DCG1 ou BTS1)
  const isFirstCourse = subject?.class?.code?.endsWith('1');

  // Vérifie si la catégorie sélectionnée est "Cours" (id: 1)
  const isCourseCategory = selectedCategory === "1";

  // L'accès est autorisé si :
  // - l'utilisateur a un abonnement, OU
  // - c'est un cours de première année ET c'est la catégorie "Cours"
  const hasAccess = hasSubscription || (isFirstCourse && isCourseCategory);

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-lg">
          <Lock className="w-16 h-16 mx-auto text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">Contenu Premium</h1>
          <p className="text-gray-600">
            {isFirstCourse 
              ? "Les corrections, exercices et sujets d'examen sont réservés aux membres premium."
              : "Ce cours est réservé aux membres premium."} 
            Abonnez-vous pour accéder à tout le contenu.
          </p>
          <Button 
            onClick={() => navigate('/subscription')}
            size="lg"
            className="w-full md:w-auto"
          >
            S'abonner maintenant
          </Button>
        </div>
      </div>
    );
  }

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
                navigate("/dashboard");
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