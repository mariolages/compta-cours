import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { WelcomeCard } from "@/components/dashboard/WelcomeCard";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { SubjectsGrid } from "@/components/dashboard/SubjectsGrid";
import { ClassesGrid } from "@/components/dashboard/ClassesGrid";
import { RecentFiles } from "@/components/dashboard/RecentFiles";
import { FileUploadDialog } from "@/components/dashboard/FileUploadDialog";
import { ProfileMenu } from "@/components/dashboard/ProfileMenu";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload } from "lucide-react";
import type { File } from "@/types/files";
import type { Subject } from "@/types/subject";
import type { Class } from "@/types/class";
import { useSession } from "@supabase/auth-helpers-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const session = useSession(); // Use the session hook from auth-helpers-react
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [lastRefresh] = useState(new Date());

  // Check authentication and validation status
  useEffect(() => {
    const checkAuth = async () => {
      // If no session, redirect to login
      if (!session) {
        navigate("/login");
        return;
      }

      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_validated, is_banned")
          .eq("id", session.user.id)
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
      } catch (error) {
        console.error("Authentication check failed:", error);
        navigate("/login");
      }
    };

    checkAuth();
  }, [session, navigate, toast]);

  const { data: classes = [] } = useQuery<Class[]>({
    queryKey: ["classes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("classes")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching classes:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les classes",
        });
        return [];
      }

      return data;
    },
  });

  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: ["subjects", selectedClassId],
    queryFn: async () => {
      if (!selectedClassId) return [];

      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .eq("class_id", selectedClassId)
        .order("code", { ascending: true });

      if (error) {
        console.error("Error fetching subjects:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les matières",
        });
        return [];
      }

      console.log("Fetched subjects:", data);
      return data;
    },
    enabled: !!selectedClassId,
  });

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
        console.error("Error fetching files:", error);
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

  const handleClassClick = (classId: number) => {
    console.log("Selected class ID:", classId);
    setSelectedClassId(classId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-white border-b border-gray-200 fixed w-full top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {selectedClassId && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedClassId(null)}
                  className="hover:bg-gray-100 rounded-full w-10 h-10"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              <h1 className="text-xl font-semibold text-primary">DCGHub</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => setIsUploadOpen(true)}
                className="bg-primary hover:bg-primary-hover text-white"
              >
                <Upload className="h-5 w-5 mr-2" />
                Déposer des fichiers
              </Button>
              <ProfileMenu />
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl pt-20">
        <WelcomeCard lastRefresh={lastRefresh} />
        
        {selectedClassId ? (
          <>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
              />
            </div>

            {subjects && subjects.length > 0 ? (
              <SubjectsGrid 
                subjects={subjects} 
                onSubjectClick={handleSubjectClick}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Aucune matière n'est disponible pour cette classe.</p>
              </div>
            )}
            
            <RecentFiles
              files={files}
              searchQuery={searchQuery}
              onDelete={handleDeleteFile}
            />
          </>
        ) : (
          <ClassesGrid 
            classes={classes}
            onClassClick={handleClassClick}
          />
        )}

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
