import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export function useSubjectFiles(subjectId: string | undefined, selectedCategory: string) {
  const { toast } = useToast();

  return useQuery({
    queryKey: ["subject-files", subjectId, selectedCategory],
    queryFn: async () => {
      console.log("Fetching files for subject:", subjectId, "category:", selectedCategory);
      
      if (!subjectId) {
        console.error("No subject ID provided");
        return [];
      }

      const { data, error } = await supabase
        .from("files")
        .select(`
          id,
          title,
          created_at,
          file_path,
          category:category_id(id, name),
          subject:subject_id(
            id,
            code,
            name
          )
        `)
        .eq("subject_id", subjectId)
        .eq("category_id", selectedCategory)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching files:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les fichiers",
        });
        throw error;
      }

      // Filter files to ensure they belong to UE subjects
      const ueFiles = data.filter(file => {
        const subjectCode = file.subject?.code || "";
        return /^UE\d+$/.test(subjectCode);
      });

      // Sort files by UE number
      return ueFiles.sort((a, b) => {
        const getUENumber = (code: string) => parseInt(code.replace("UE", ""));
        const aNum = getUENumber(a.subject?.code || "");
        const bNum = getUENumber(b.subject?.code || "");
        return aNum - bNum;
      });
    },
  });
}