import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileCard } from "./FileCard";
import { EmptyFileList } from "./EmptyFileList";
import { FileListHeader } from "./FileListHeader";
import { hasAccessToContent } from "@/utils/access";
import { FileUploadDialog } from "@/components/dashboard/FileUploadDialog";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import type { File } from "@/types/files";

interface FileListProps {
  files: File[];
  onDownload: (fileId: string, filePath: string, fileName: string) => void;
  hasSubscription?: boolean;
  classCode?: string;
  selectedCategory: string;
  subjectId?: string;
  isAdmin?: boolean;
}

export function FileList({ 
  files, 
  onDownload, 
  hasSubscription = false,
  classCode,
  selectedCategory,
  subjectId,
  isAdmin = false
}: FileListProps) {
  const { toast } = useToast();
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [sortType, setSortType] = useState<'date' | 'alpha' | 'ue'>('date');
  const queryClient = useQueryClient();
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const handleDelete = async (fileId: string) => {
    try {
      const { error } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['subject-files'] });
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

  const handleRenameClick = (fileId: string, currentTitle: string) => {
    setEditingFileId(fileId);
    setNewTitle(currentTitle);
  };

  const handleRenameSubmit = async (fileId: string) => {
    if (!editingFileId || !newTitle) return;

    try {
      const { error } = await supabase
        .from('files')
        .update({ title: newTitle })
        .eq('id', fileId);

      if (error) throw error;

      setEditingFileId(null);
      setNewTitle("");
      queryClient.invalidateQueries({ queryKey: ['subject-files'] });
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
    return (
      <div>
        {isAdmin && (
          <div className="mb-6">
            <Button
              onClick={() => setIsUploadOpen(true)}
              className="w-full md:w-auto flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Ajouter des fichiers
            </Button>
          </div>
        )}
        <EmptyFileList searchQuery="" />
        <FileUploadDialog
          open={isUploadOpen}
          onOpenChange={setIsUploadOpen}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['subject-files'] });
            setIsUploadOpen(false);
          }}
          defaultSubjectId={subjectId}
        />
      </div>
    );
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
      
      const ueA = getUENumber(a.subject?.code || '');
      const ueB = getUENumber(b.subject?.code || '');
      
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
      <div className="flex justify-between items-center">
        <FileListHeader 
          sortOrder={sortOrder} 
          onSortToggle={toggleSort}
          sortType={sortType}
          onSortTypeToggle={toggleSortType}
        />
        {isAdmin && (
          <Button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Ajouter des fichiers
          </Button>
        )}
      </div>
      <div className="space-y-4">
        {sortedFiles.map((file) => (
          <FileCard
            key={file.id}
            file={file}
            editingFileId={editingFileId}
            newTitle={newTitle}
            onRenameClick={handleRenameClick}
            onRenameSubmit={handleRenameSubmit}
            onRenameCancel={() => setEditingFileId(null)}
            onNewTitleChange={setNewTitle}
            onDelete={handleDelete}
            onDownload={onDownload}
            hasSubscription={hasSubscription}
            classCode={classCode}
            selectedCategory={selectedCategory}
          />
        ))}
      </div>
      <FileUploadDialog
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['subject-files'] });
          setIsUploadOpen(false);
        }}
        defaultSubjectId={subjectId}
      />
    </div>
  );
}
