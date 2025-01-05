import { useState } from "react";
import { Card } from "@/components/ui/card";
import { AudioPlayer } from "./AudioPlayer";
import { hasAccessToContent } from "@/utils/access";
import type { File } from "@/types/files";
import { FileCardActions } from "./file-card/FileCardActions";
import { FileCardMenu } from "./file-card/FileCardMenu";
import { FileCardTitle } from "./file-card/FileCardTitle";

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
    <Card className="p-4 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <FileCardTitle
            title={file.title}
            isEditing={isEditing}
            hasAccess={hasAccess}
            newTitle={newTitle}
            onNewTitleChange={onNewTitleChange}
            onRenameSubmit={() => onRenameSubmit(file.id)}
            onRenameCancel={onRenameCancel}
          />
        </div>

        <div className="flex items-center gap-1">
          <FileCardActions
            hasAccess={hasAccess}
            onOpenExternal={() => window.open(getFileUrl(), '_blank')}
            onDownload={() => onDownload(file.id, file.file_path, file.title)}
          />
          <FileCardMenu
            onRenameClick={() => {
              setIsMenuOpen(false);
              onRenameClick(file.id, file.title);
            }}
            onDelete={() => {
              setIsMenuOpen(false);
              onDelete(file.id);
            }}
            setIsMenuOpen={setIsMenuOpen}
          />
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