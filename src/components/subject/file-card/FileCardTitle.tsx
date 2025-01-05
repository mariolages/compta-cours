import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X, Lock } from "lucide-react";

interface FileCardTitleProps {
  title: string;
  isEditing: boolean;
  hasAccess: boolean;
  newTitle: string;
  onNewTitleChange: (value: string) => void;
  onRenameSubmit: () => void;
  onRenameCancel: () => void;
}

export function FileCardTitle({
  title,
  isEditing,
  hasAccess,
  newTitle,
  onNewTitleChange,
  onRenameSubmit,
  onRenameCancel
}: FileCardTitleProps) {
  if (isEditing) {
    return (
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
          onClick={onRenameSubmit}
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
    );
  }

  return (
    <div className="flex items-center gap-4">
      <h3 className="text-lg font-medium text-gray-900 truncate flex items-center gap-2">
        {!hasAccess && <Lock className="h-4 w-4 text-gray-400" />}
        {title}
      </h3>
    </div>
  );
}