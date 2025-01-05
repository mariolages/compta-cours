import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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
  onRenameCancel,
}: FileCardTitleProps) {
  const isTestFile = title.toLowerCase().includes("test");

  if (isEditing) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onRenameSubmit();
        }}
        className="flex items-center gap-2"
      >
        <Input
          type="text"
          value={newTitle}
          onChange={(e) => onNewTitleChange(e.target.value)}
          className="flex-1"
          autoFocus
        />
        <div className="flex items-center gap-1">
          <button
            type="submit"
            className="px-2 py-1 text-sm bg-primary text-white rounded hover:bg-primary-hover"
          >
            OK
          </button>
          <button
            type="button"
            onClick={onRenameCancel}
            className="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
          >
            Annuler
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <h3
        className={`text-base font-medium truncate ${
          !hasAccess ? "text-gray-400" : ""
        }`}
      >
        {title}
      </h3>
      {isTestFile && (
        <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
          TEST
        </Badge>
      )}
    </div>
  );
}