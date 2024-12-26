import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { FileCard } from "./FileCard";
import { FileListHeader } from "./FileListHeader";
import { EmptyFileList } from "./EmptyFileList";

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
  onDownload: (fileId: string, filePath: string, fileName: string) => void;
}

export function FileList({ files, onDownload }: FileListProps) {
  console.log("FileList rendering with files:", files);
  
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

  const toggleSort = () => {
    setSortOrder(current => current === 'asc' ? 'desc' : 'asc');
    toast({
      title: "Tri mis à jour",
      description: `Les fichiers sont maintenant triés par date ${sortOrder === 'asc' ? 'décroissante' : 'croissante'}`,
    });
  };

  if (!files || files.length === 0) {
    console.log("No files to display");
    return <EmptyFileList />;
  }

  const sortedFiles = [...files].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  console.log("Displaying sorted files:", sortedFiles);

  return (
    <div className="space-y-6">
      <FileListHeader sortOrder={sortOrder} onSortToggle={toggleSort} />
      <div className="space-y-4">
        {sortedFiles.map((file) => (
          <FileCard
            key={file.id}
            file={file}
            editingFileId={editingFileId}
            newTitle={newTitle}
            onDownload={onDownload}
            onDelete={handleDeleteFile}
            onRenameClick={handleRenameClick}
            onRenameSubmit={handleRenameSubmit}
            onRenameCancel={handleRenameCancel}
            onNewTitleChange={setNewTitle}
          />
        ))}
      </div>
    </div>
  );
}