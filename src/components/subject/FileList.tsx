import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface File {
  id: string;
  title: string;
  category: {
    id: number;
    name: string;
  };
  created_at: string;
  file_path: string;
}

interface FileListProps {
  files: File[] | undefined;
  onDownload: (fileId: string, filePath: string) => void;
}

export function FileList({ files, onDownload }: FileListProps) {
  const { toast } = useToast();

  const openInGoogle = async (filePath: string) => {
    try {
      console.log('Tentative d\'ouverture du fichier:', filePath);
      const { data, error } = await supabase.storage
        .from('dcg_files')
        .createSignedUrl(filePath, 3600);

      if (error) {
        console.error('Erreur lors de la création de l\'URL:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible d'ouvrir le fichier",
        });
        return;
      }

      if (data?.signedUrl) {
        console.log('URL signée générée avec succès:', data.signedUrl);
        
        window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
        
        toast({
          title: "Succès",
          description: "Le fichier s'ouvre dans un nouvel onglet",
        });
      } else {
        console.error('Pas d\'URL signée dans la réponse');
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "URL du fichier non disponible",
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du fichier:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ouverture du fichier",
      });
    }
  };

  if (!files || files.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucun fichier n'a encore été déposé dans cette catégorie
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {files.map((file) => (
        <Card
          key={file.id}
          className="hover:shadow-md transition-all duration-300 border-l-4 border-l-primary"
        >
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex-1">
              <h3 className="font-medium text-lg mb-1">{file.title}</h3>
              <p className="text-sm text-gray-500">
                {new Date(file.created_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="hover:bg-primary/10"
                onClick={() => onDownload(file.id, file.file_path)}
              >
                <Download className="h-4 w-4" />
                <span className="ml-2">Télécharger</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}