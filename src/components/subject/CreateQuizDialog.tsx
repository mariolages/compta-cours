import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CreateQuizForm } from "./quiz/CreateQuizForm";
import type { File } from "@/types/files";

interface CreateQuizDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  files: File[];
}

export function CreateQuizDialog({ open, onOpenChange, files }: CreateQuizDialogProps) {
  const currentFile = files[0];

  if (!currentFile) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] h-[90vh]">
        <DialogHeader>
          <DialogTitle>Créer un nouveau quiz</DialogTitle>
          <DialogDescription>
            Créez un quiz interactif basé sur le contenu de votre fichier. 
            Vous pouvez ajouter autant de questions que vous le souhaitez.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-2">
          <CreateQuizForm
            fileId={currentFile.id}
            onSuccess={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}