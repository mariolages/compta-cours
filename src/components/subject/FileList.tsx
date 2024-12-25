import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ArrowUpDown, Trash2, FolderPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

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
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const queryClient = useQueryClient();

  const handleDeleteFile = async (fileId: string) => {
    try {
      const { error } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Le fichier a été supprimé",
      });

      // Rafraîchir la liste des fichiers
      queryClient.invalidateQueries({ queryKey: ["subject-files"] });
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer le fichier",
      });
    }
  };

  const handleCreateFolder = async () => {
    try {
      // Pour l'instant, on va simplement afficher un message
      // car la fonctionnalité de sous-dossiers nécessite des modifications de la base de données
      toast({
        title: "Info",
        description: "La fonctionnalité de sous-dossiers sera bientôt disponible",
      });
      setIsNewFolderDialogOpen(false);
      setNewFolderName('');
    } catch (error) {
      console.error("Erreur lors de la création du dossier:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer le dossier",
      });
    }
  };

  const sortedFiles = files ? [...files].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  }) : [];

  const toggleSort = () => {
    setSortOrder(current => current === 'asc' ? 'desc' : 'asc');
    toast({
      title: "Tri mis à jour",
      description: `Les fichiers sont maintenant triés par date ${sortOrder === 'asc' ? 'décroissante' : 'croissante'}`,
    });
  };

  if (!files || files.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucun fichier n'a encore été déposé dans cette catégorie
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between mb-4">
        <Dialog open={isNewFolderDialogOpen} onOpenChange={setIsNewFolderDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2"
            >
              <FolderPlus className="h-4 w-4" />
              Nouveau dossier
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un nouveau dossier</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Nom du dossier"
              />
              <Button onClick={handleCreateFolder} className="w-full">
                Créer
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Button
          variant="outline"
          onClick={toggleSort}
          className="flex items-center gap-2"
        >
          <ArrowUpDown className="h-4 w-4" />
          Trier par date {sortOrder === 'asc' ? '↑' : '↓'}
        </Button>
      </div>
      
      {sortedFiles.map((file) => (
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
              <Button
                variant="destructive"
                size="icon"
                onClick={() => handleDeleteFile(file.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
