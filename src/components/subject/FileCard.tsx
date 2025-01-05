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
  X,
  ExternalLink,
  Lock
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AudioPlayer } from "./AudioPlayer";
import { hasAccessToContent } from "@/utils/access";
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
  hasSubscription?: boolean;
  classCode?: string;
  selectedCategory: string;
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
  hasSubscription = false,
  classCode,
  selectedCategory,
}: FileCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isEditing = editingFileId === file.id;
  const isPodcast = file.category?.id === 6;
  const hasAccess = hasAccessToContent(hasSubscription, classCode, selectedCategory, file.title);

  const getFileUrl = () => {
    return `https://sxpddyeasmcsnrbtvrgm.supabase.co/storage/v1/object/public/dcg_files/${file.file_path}`;
  };

  return (
    <Card className="p-4 bg-[#1A1F2C] border border-white/10 hover:border-white/20 transition-all duration-300">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={newTitle}
                onChange={(e) => onNewTitleChange(e.target.value)}
                className="flex-1 bg-[#221F26] border-white/10 text-white"
                autoFocus
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onRenameSubmit(file.id)}
                className="h-8 w-8 hover:bg-white/10 text-white"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={onRenameCancel}
                className="h-8 w-8 hover:bg-white/10 text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-medium text-white truncate flex items-center gap-2">
                {!hasAccess && <Lock className="h-4 w-4 text-gray-400" />}
                {file.title}
              </h3>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.open(getFileUrl(), '_blank')}
            className={`h-8 w-8 ${hasAccess ? 'text-white hover:bg-white/10' : 'text-gray-500 cursor-not-allowed'}`}
            disabled={!hasAccess}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDownload(file.id, file.file_path, file.title)}
            className={`h-8 w-8 ${hasAccess ? 'text-white hover:bg-white/10' : 'text-gray-500 cursor-not-allowed'}`}
            disabled={!hasAccess}
          >
            <Download className="h-4 w-4" />
          </Button>

          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 text-white">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-[#1A1F2C] border border-white/10">
              <DropdownMenuItem
                className="flex items-center gap-2 text-white hover:bg-white/10"
                onClick={() => {
                  setIsMenuOpen(false);
                  onRenameClick(file.id, file.title);
                }}
              >
                <Pencil className="h-4 w-4" />
                Renommer
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 text-red-400 hover:bg-white/10"
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
          <AudioPlayer filePath={file.file_path} isLocked={!hasAccess} />
        </div>
      )}
    </Card>
  );
}