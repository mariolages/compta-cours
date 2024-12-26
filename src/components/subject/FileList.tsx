import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileCard } from "./FileCard";
import { EmptyFileList } from "./EmptyFileList";
import { FileListHeader } from "./FileListHeader";
import type { File } from "@/types/files";

interface FileListProps {
  files: File[];
  onDownload: (file: File) => void;
}

export function FileList({ files, onDownload }: FileListProps) {
  const { toast } = useToast();
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [sortType, setSortType] = useState<'date' | 'alpha' | 'ue'>('date');
  const queryClient = useQueryClient();
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const handleDelete = async (fileId: string) => {
    try {
      const { error } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId);

      if (error) throw error;

      queryClient.invalidateQueries(['files']);
      toast({
        title: "Succès",
        description: "Le fichier a été supprimé avec succès",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer le fichier",
      });
    }
  };

  const handleEdit = (file: File) => {
    setEditingFileId(file.id);
    setNewTitle(file.title);
  };

  const handleSave = async () => {
    if (!editingFileId || !newTitle) return;

    try {
      const { error } = await supabase
        .from('files')
        .update({ title: newTitle })
        .eq('id', editingFileId);

      if (error) throw error;

      setEditingFileId(null);
      setNewTitle("");
      queryClient.invalidateQueries(['files']);
      toast({
        title: "Succès",
        description: "Le titre a été mis à jour avec succès",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour le titre",
      });
    }
  };

  const toggleSort = () => {
    setSortOrder(current => current === 'asc' ? 'desc' : 'asc');
  };

  const toggleSortType = () => {
    setSortType(current => {
      if (current === 'date') return 'alpha';
      if (current === 'alpha') return 'ue';
      return 'date';
    });
  };

  if (!files || files.length === 0) {
    return <EmptyFileList />;
  }

  const sortedFiles = [...files].sort((a, b) => {
    if (sortType === 'date') {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (sortType === 'ue') {
      const getUENumber = (str: string) => {
        const match = str.match(/UE(\d+)/i);
        return match ? parseInt(match[1]) : 0;
      };
      
      const ueA = getUENumber(a.subject.code);
      const ueB = getUENumber(b.subject.code);
      
      if (ueA !== ueB) {
        return sortOrder === 'asc' ? ueA - ueB : ueB - ueA;
      }
      
      return sortOrder === 'asc' 
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    } else {
      return sortOrder === 'asc' 
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    }
  });

  return (
    <div className="space-y-6">
      <FileListHeader 
        sortOrder={sortOrder} 
        onSortToggle={toggleSort}
        sortType={sortType}
        onSortTypeToggle={toggleSortType}
      />
      <div className="space-y-4">
        {sortedFiles.map((file) => (
          <FileCard
            key={file.id}
            file={file}
            isEditing={editingFileId === file.id}
            newTitle={newTitle}
            onEdit={() => handleEdit(file)}
            onSave={handleSave}
            onCancel={() => setEditingFileId(null)}
            onTitleChange={setNewTitle}
            onDelete={() => handleDelete(file.id)}
            onDownload={() => onDownload(file)}
          />
        ))}
      </div>
    </div>
  );
}
