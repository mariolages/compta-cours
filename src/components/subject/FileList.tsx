import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ArrowUpDown, Trash2, Edit2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

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

  const handleRenameClick = (fileId: string, currentTitle: string) => {
    setEditingFileId(fileId);
    setNewTitle(currentTitle);
  };

  const handleRenameSubmit = async (fileId: string) => {
    try {
      const { error } = await supabase
        .from('files')
        .update({ title: newTitle })
        .eq('id', fileId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Le fichier a été renommé",
      });

      setEditingFileId(null);
      queryClient.invalidateQueries({ queryKey: ["subject-files"] });
    } catch (error) {
      console.error("Erreur lors du renommage:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de renommer le fichier",
      });
    }
  };

  const handleRenameCancel = () => {
    setEditingFileId(null);
    setNewTitle("");
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
      <div className="flex justify-end mb-4">
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
              {editingFileId === file.id ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="max-w-md"
                    autoFocus
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRenameSubmit(file.id)}
                    className="hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    Enregistrer
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRenameCancel}
                    className="hover:bg-gray-100 transition-colors"
                  >
                    Annuler
                  </Button>
                </div>
              ) : (
                <>
                  <h3 className="font-medium text-lg mb-1">{file.title}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(file.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 hover:bg-primary hover:text-white transition-all duration-300 border-primary/20"
                onClick={() => onDownload(file.id, file.file_path)}
              >
                <Download className="h-4 w-4" />
                <span>Télécharger</span>
              </Button>
              {editingFileId !== file.id && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRenameClick(file.id, file.title)}
                  className="flex items-center gap-2 hover:bg-accent hover:text-white transition-all duration-300 border-accent/20"
                >
                  <Edit2 className="h-4 w-4" />
                  <span>Renommer</span>
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteFile(file.id)}
                className="hover:bg-red-50 hover:text-red-500 transition-colors"
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