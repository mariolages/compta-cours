import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  MoreVertical, 
  Download, 
  Pencil, 
  Trash2, 
  Check, 
  X
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AudioPlayer } from "./AudioPlayer";
import type { File } from "@/types/files";

interface FileCardProps {
  file: File;
  editingFileId: string | null;
  newTitle: string;
  onRenameClick: (fileId: string, currentTitle: string) => void;
  onRenameSubmit: (fileId: string) => void;
  onRenameCancel: () => void;
  onNewTitleChange: (value: string) => void;
  onDelete: (fileId: string) => void;
  onDownload: (fileId: string, filePath: string, fileName: string) => void;
}

export function FileCard({
  file,
  editingFileId,
  newTitle,
  onRenameClick,
  onRenameSubmit,
  onRenameCancel,
  onNewTitleChange,
  onDelete,
  onDownload,
}: FileCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isEditing = editingFileId === file.id;
  const isPodcast = file.category?.id === 6;

  return (
    <Card className="p-4 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={newTitle}
                onChange={(e) => onNewTitleChange(e.target.value)}
                className="flex-1"
                autoFocus
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onRenameSubmit(file.id)}
                className="h-8 w-8"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={onRenameCancel}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-medium text-gray-900 truncate">
                {file.title}
              </h3>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDownload(file.id, file.file_path, file.title)}
            className="h-8 w-8"
          >
            <Download className="h-4 w-4" />
          </Button>

          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                className="flex items-center gap-2"
                onClick={() => {
                  setIsMenuOpen(false);
                  onRenameClick(file.id, file.title);
                }}
              >
                <Pencil className="h-4 w-4" />
                Renommer
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 text-red-600"
                onClick={() => {
                  setIsMenuOpen(false);
                  onDelete(file.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isPodcast && (
        <div className="mt-4">
          <AudioPlayer filePath={file.file_path} />
        </div>
      )}
    </Card>
  );
}