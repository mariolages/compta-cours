import { Button } from "@/components/ui/button";
import { Eye, Loader2, Save } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";

interface QuizFormActionsProps {
  isLoading: boolean;
  onPreview: () => void;
  onSaveAsDraft: (e: React.MouseEvent) => void;
  onPublish: (e: React.FormEvent) => void;
}

export function QuizFormActions({ isLoading, onPreview, onSaveAsDraft, onPublish }: QuizFormActionsProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <div className="flex justify-between gap-4 pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsPreviewOpen(true)}
        className="flex items-center gap-2"
      >
        <Eye className="h-4 w-4" />
        Aperçu du quiz
      </Button>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onSaveAsDraft}
          disabled={isLoading}
        >
          Sauvegarder en brouillon
        </Button>

        <Button type="submit" disabled={isLoading} onClick={onPublish}>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Création...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Publier le quiz
            </div>
          )}
        </Button>
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Aperçu du quiz</h2>
            <div className="space-y-6">
              {/* Preview content will be added here */}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}