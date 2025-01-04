import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Trash2 } from "lucide-react";

interface SubjectHeaderProps {
  code: string;
  name: string;
  onUploadClick: () => void;
  onDeleteClick: () => void;
}

export function SubjectHeader({ code, name, onUploadClick, onDeleteClick }: SubjectHeaderProps) {
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
      <div>
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
        <Button
          variant="outline"
          onClick={onDeleteClick}
          className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
          Supprimer
        </Button>
      </div>
    </div>
  );
}