import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { FileUploadDialog } from '@/components/dashboard/FileUploadDialog';
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardContent } from "@/components/dashboard/DashboardContent";

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [lastRefresh] = useState(new Date());

  // Vérification de l'authentification avec meilleure gestion des erreurs
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error("Erreur de session:", sessionError);
          throw sessionError;
        }

        if (!session) {
          console.log("Pas de session active, redirection vers login");
          navigate("/login");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("is_validated, is_banned")
          .eq("id", session.user.id)
          .single();

        if (profileError) {
          console.error("Erreur de profil:", profileError);
          throw profileError;
        }

        if (!profile?.is_validated) {
          console.log("Profil non validé, redirection");
          navigate("/waiting-validation");
          return;
        }

        if (profile?.is_banned) {
          console.log("Compte banni, redirection");
          toast({
            variant: "destructive",
            title: "Accès restreint",
            description: "Votre compte a été banni. Contactez un administrateur.",
          });
          navigate("/");
        }
      } catch (error) {
        console.error("Erreur d'authentification détaillée:", error);
        toast({
          variant: "destructive",
          title: "Erreur d'authentification",
          description: "Une erreur est survenue lors de la vérification de votre session.",
        });
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate, toast]);

  // Récupération des classes avec meilleure gestion des erreurs
  const { data: classes = [] } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("classes")
          .select("*")
          .order("name", { ascending: true });

        if (error) {
          console.error("Erreur détaillée lors de la récupération des classes:", error);
          throw error;
        }

        return data || [];
      } catch (error) {
        console.error("Erreur lors de la récupération des classes:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les classes",
        });
        return [];
      }
    },
  });

  // Récupération des matières avec meilleure gestion des erreurs
  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects", selectedClassId],
    queryFn: async () => {
      if (!selectedClassId) return [];

      try {
        const { data, error } = await supabase
          .from("subjects")
          .select("*")
          .eq("class_id", selectedClassId)
          .order("code", { ascending: true });

        if (error) {
          console.error("Erreur détaillée lors de la récupération des matières:", error);
          throw error;
        }

        console.log("Matières récupérées:", data);
        return data || [];
      } catch (error) {
        console.error("Erreur lors de la récupération des matières:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les matières",
        });
        return [];
      }
    },
    enabled: !!selectedClassId,
  });

  // Récupération des fichiers récents avec meilleure gestion des erreurs
  const { data: files = [], refetch: refetchFiles } = useQuery({
    queryKey: ["recent-files"],
    queryFn: async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          console.log("Pas de session utilisateur pour les fichiers");
          return [];
        }

        const { data, error } = await supabase
          .from("files")
          .select(`
            id,
            title,
            file_path,
            created_at,
            category:categories(id, name),
            subject:subjects(id, code, name)
          `)
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(10);

        if (error) {
          console.error("Erreur détaillée lors de la récupération des fichiers:", error);
          throw error;
        }

        console.log("Fichiers récupérés:", data);
        return data || [];
      } catch (error) {
        console.error("Erreur lors de la récupération des fichiers:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les fichiers récents",
        });
        return [];
      }
    },
  });

  const handleDeleteFile = async (fileId: string) => {
    try {
      const { data: deletedFile, error } = await supabase
        .from("files")
        .delete()
        .eq("id", fileId)
        .select()
        .single();

      if (error) throw error;

      if (deletedFile) {
        await supabase.storage
          .from("dcg_files")
          .remove([deletedFile.file_path]);
      }

      refetchFiles();
      toast({
        title: "Succès",
        description: "Le fichier a été supprimé",
      });
    } catch (error) {
      console.error("Erreur détaillée lors de la suppression:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer le fichier",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <DashboardHeader
        selectedClassId={selectedClassId}
        onBackClick={() => setSelectedClassId(null)}
        onUploadClick={() => setIsUploadOpen(true)}
      />

      <DashboardContent
        selectedClassId={selectedClassId}
        subjects={subjects}
        classes={classes}
        files={files}
        searchQuery={searchQuery}
        lastRefresh={lastRefresh}
        onSearchChange={setSearchQuery}
        onSubjectClick={(subjectId) => navigate(`/subjects/${subjectId}`)}
        onClassClick={setSelectedClassId}
        onDeleteFile={handleDeleteFile}
      />

      <FileUploadDialog
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        onSuccess={() => {
          refetchFiles();
          setIsUploadOpen(false);
        }}
      />
    </div>
  );
}