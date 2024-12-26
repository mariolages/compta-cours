import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { SubjectsGrid } from "@/components/dashboard/SubjectsGrid";
import { RecentFiles } from "@/components/dashboard/RecentFiles";
import { FileUploadDialog } from "@/components/dashboard/FileUploadDialog";
import type { File } from "@/types/files";
import type { Subject } from "@/types/subject";

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Check authentication and validation status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session?.user) {
        navigate("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_validated, is_banned")
        .eq("id", sessionData.session.user.id)
        .single();

      if (!profile?.is_validated) {
        navigate("/waiting-validation");
        return;
      }

      if (profile?.is_banned) {
        toast({
          variant: "destructive",
          title: "Accès restreint",
          description: "Votre compte a été banni. Contactez un administrateur.",
        });
        navigate("/");
      }
    };

    checkAuth();
  }, [navigate, toast]);

  const { data: files = [], refetch: refetchFiles } = useQuery({
    queryKey: ["recent-files"],
    queryFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) return [];

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
        .eq("user_id", sessionData.session.user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les fichiers récents",
        });
        return [];
      }

      return data as File[];
    },
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .order("code", { ascending: true });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les matières",
        });
        return [];
      }

      return data as Subject[];
    },
  });

  const handleDeleteFile = async (fileId: string) => {
    const { data: deletedFile } = await supabase
      .from("files")
      .delete()
      .eq("id", fileId)
      .select()
      .single();

    if (deletedFile) {
      await supabase.storage
        .from("dcg_files")
        .remove([deletedFile.file_path]);
    }

    refetchFiles();
  };

  const handleSubjectClick = (subjectId: number) => {
    navigate(`/subjects/${subjectId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>

        <SubjectsGrid 
          subjects={subjects} 
          onSubjectClick={handleSubjectClick}
        />
        
        <RecentFiles
          files={files}
          searchQuery={searchQuery}
          onDelete={handleDeleteFile}
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
    </div>
  );
}