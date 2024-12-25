import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderPlus, Folder, ChevronRight, ChevronDown, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface Folder {
  id: string;
  name: string;
  parent_folder_id: string | null;
}

interface FolderListProps {
  folders: Folder[];
  currentFolderId: string | null;
  onFolderClick: (folderId: string | null) => void;
  subjectId: string;
}

export function FolderList({ folders, currentFolderId, onFolderClick, subjectId }: FolderListProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (expandedFolders.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleCreateFolder = async (parentFolderId: string | null) => {
    const folderName = prompt("Nom du dossier :");
    if (!folderName) return;

    try {
      const { data, error } = await supabase
        .from('folders')
        .insert({
          name: folderName,
          subject_id: parseInt(subjectId),
          parent_folder_id: parentFolderId,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["folders"] });
      toast({
        title: "Succès",
        description: "Dossier créé avec succès",
      });
    } catch (error) {
      console.error("Erreur lors de la création du dossier:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer le dossier",
      });
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce dossier ?")) return;

    try {
      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', folderId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["folders"] });
      toast({
        title: "Succès",
        description: "Dossier supprimé avec succès",
      });
      
      if (currentFolderId === folderId) {
        onFolderClick(null);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du dossier:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer le dossier",
      });
    }
  };

  const renderFolderTree = (parentId: string | null = null, level = 0) => {
    const folderItems = folders.filter(f => f.parent_folder_id === parentId);
    
    if (folderItems.length === 0 && parentId === null) {
      return (
        <div className="text-center py-4 text-gray-500">
          Aucun dossier créé
        </div>
      );
    }

    return folderItems.map((folder) => {
      const hasChildren = folders.some(f => f.parent_folder_id === folder.id);
      const isExpanded = expandedFolders.has(folder.id);
      const isSelected = currentFolderId === folder.id;

      return (
        <div key={folder.id} style={{ marginLeft: `${level * 20}px` }}>
          <div className={`flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg ${isSelected ? 'bg-gray-100' : ''}`}>
            <Button
              variant="ghost"
              size="sm"
              className="p-0 w-6 h-6"
              onClick={() => toggleFolder(folder.id)}
            >
              {hasChildren ? (
                isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
              ) : <div className="w-4" />}
            </Button>
            
            <Button
              variant="ghost"
              className={`flex items-center gap-2 flex-1 justify-start ${isSelected ? 'bg-gray-200' : ''}`}
              onClick={() => onFolderClick(folder.id)}
            >
              <Folder className="h-4 w-4" />
              {folder.name}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteFolder(folder.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          
          {isExpanded && renderFolderTree(folder.id, level + 1)}
          
          {isExpanded && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCreateFolder(folder.id)}
              className="ml-8 mt-2"
            >
              <FolderPlus className="h-4 w-4 mr-2" />
              Nouveau sous-dossier
            </Button>
          )}
        </div>
      );
    });
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Dossiers</h3>
          <Button
            variant="outline"
            onClick={() => handleCreateFolder(null)}
            className="flex items-center gap-2"
          >
            <FolderPlus className="h-4 w-4" />
            Nouveau dossier
          </Button>
        </div>
        {renderFolderTree()}
      </CardContent>
    </Card>
  );
}