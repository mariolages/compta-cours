import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Edit2, Trash2, MoreVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AudioPlayer } from "./AudioPlayer";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FileCardProps {
  file: {
    id: string;
    title: string;
    created_at: string;
    file_path: string;
    category: {
      id: number;
    };
  };
  editingFileId: string | null;
  newTitle: string;
  onDownload: (fileId: string, filePath: string, fileName: string) => void;
  onDelete: (fileId: string) => Promise<void>;
  onRenameClick: (fileId: string, currentTitle: string) => void;
  onRenameSubmit: (fileId: string) => Promise<void>;
  onRenameCancel: () => void;
  onNewTitleChange: (value: string) => void;
}

export function FileCard({
  file,
  editingFileId,
  newTitle,
  onDownload,
  onDelete,
  onRenameClick,
  onRenameSubmit,
  onRenameCancel,
  onNewTitleChange,
}: FileCardProps) {
  const isPodcast = (file: { category: { id: number } }) => file.category.id === 6;
  const isMobile = useIsMobile();

  const MobileActions = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onDownload(file.id, file.file_path, file.title)}>
          <Download className="h-4 w-4 mr-2" />
          Télécharger
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onRenameClick(file.id, file.title)}>
          <Edit2 className="h-4 w-4 mr-2" />
          Renommer
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDelete(file.id)} className="text-red-600">
          <Trash2 className="h-4 w-4 mr-2" />
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const DesktopActions = () => (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2 hover:bg-primary hover:text-white transition-all duration-300 border-primary/20"
        onClick={() => onDownload(file.id, file.file_path, file.title)}
      >
        <Download className="h-4 w-4" />
        <span>Télécharger</span>
      </Button>
      {editingFileId !== file.id && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRenameClick(file.id, file.title)}
          className="flex items-center gap-2 hover:bg-accent hover:text-white transition-all duration-300 border-accent/20"
        >
          <Edit2 className="h-4 w-4" />
          <span>Renommer</span>
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(file.id)}
        className="hover:bg-red-50 hover:text-red-500 transition-colors"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <Card className="hover:shadow-md transition-all duration-300 border-l-4 border-l-primary group">
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {editingFileId === file.id ? (
                <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                  <Input
                    value={newTitle}
                    onChange={(e) => onNewTitleChange(e.target.value)}
                    className="max-w-md"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRenameSubmit(file.id)}
                      className="hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      Enregistrer
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onRenameCancel}
                      className="hover:bg-gray-100 transition-colors"
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <h3 className="font-medium text-lg text-gray-900 truncate">
                    {file.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(file.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              )}
            </div>

            <div className="ml-4">
              {isMobile ? <MobileActions /> : <DesktopActions />}
            </div>
          </div>

          {isPodcast(file) && (
            <div className="mt-4">
              <AudioPlayer filePath={file.file_path} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}