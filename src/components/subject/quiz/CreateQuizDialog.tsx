import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreateQuizForm } from "./CreateQuizForm";
import type { File } from "@/types/files";

interface CreateQuizDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  files: File[];
}

export function CreateQuizDialog({ open, onOpenChange, files }: CreateQuizDialogProps) {
  const currentFile = files[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Créer un nouveau quiz</DialogTitle>
        </DialogHeader>
        <CreateQuizForm
          fileId={currentFile?.id}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}