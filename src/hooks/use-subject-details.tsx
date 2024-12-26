import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export function useSubjectDetails(subjectId: string | undefined) {
  const { toast } = useToast();

  return useQuery({
    queryKey: ["subject", subjectId],
    queryFn: async () => {
      console.log("Fetching subject details for ID:", subjectId);
      
      if (!subjectId) {
        console.error("No subject ID provided");
        return null;
      }

      const { data, error } = await supabase
        .from("subjects")
        .select(`
          id,
          code,
          name,
          class_id
        `)
        .eq("id", subjectId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching subject:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les informations de la matière",
        });
        throw error;
      }
      return data;
    },
  });
}