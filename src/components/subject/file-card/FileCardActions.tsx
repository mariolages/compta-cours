import { Button } from "@/components/ui/button";
import { ExternalLink, Download, Star } from "lucide-react";

interface FileCardActionsProps {
  hasAccess: boolean;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onOpenExternal: () => void;
  onDownload: () => void;
}

export function FileCardActions({
  hasAccess,
  isFavorite,
  onToggleFavorite,
  onOpenExternal,
  onDownload
}: FileCardActionsProps) {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleFavorite}
        className={`h-8 w-8 ${isFavorite ? 'text-yellow-500' : 'text-gray-500'} hover:text-yellow-600 hover:bg-yellow-50`}
      >
        <Star className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onOpenExternal}
        className={`h-8 w-8 ${hasAccess ? 'text-gray-500 hover:text-primary hover:bg-primary-light' : 'text-gray-300 cursor-not-allowed'}`}
        disabled={!hasAccess}
      >
        <ExternalLink className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onDownload}
        className={`h-8 w-8 ${hasAccess ? 'text-gray-500 hover:text-primary hover:bg-primary-light' : 'text-gray-300 cursor-not-allowed'}`}
        disabled={!hasAccess}
      >
        <Download className="h-4 w-4" />
      </Button>
    </div>
  );
}