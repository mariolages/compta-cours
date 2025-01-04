import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Upload, ArrowLeft } from "lucide-react";

interface SubjectHeaderProps {
  code: string;
  name: string;
  onUploadClick: () => void;
}

export function SubjectHeader({ code, name, onUploadClick }: SubjectHeaderProps) {
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

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          {code} - {name}
        </h1>
      </div>
      <div className="flex items-center gap-2">
        {profile?.is_admin && (
          <Button onClick={onUploadClick} className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Déposer des fichiers
          </Button>
        )}
      </div>
    </div>
  );
}