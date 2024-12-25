import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileUploadForm } from './FileUploadForm';

interface FileUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  defaultSubjectId?: string;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes

export function FileUploadDialog({ open, onOpenChange, onSuccess, defaultSubjectId }: FileUploadDialogProps) {
  const [subjectId, setSubjectId] = useState(defaultSubjectId || '');
  const [categoryId, setCategoryId] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const validateFiles = (files: FileList): boolean => {
    for (let i = 0; i < files.length; i++) {
      if (files[i].size > MAX_FILE_SIZE) {
        toast({
          variant: "destructive",
          title: "Fichier trop volumineux",
          description: `Le fichier "${files[i].name}" dépasse la limite de 50 Mo`,
        });
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files || files.length === 0 || !subjectId || !categoryId) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez sélectionner des fichiers et remplir tous les champs",
      });
      return;
    }

    if (!validateFiles(files)) {
      return;
    }

    setIsLoading(true);
    setProgress(0);
    
    try {
      const totalFiles = files.length;
      let successCount = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = file.name.replace(`.${fileExt}`, '');
        const filePath = `${crypto.randomUUID()}.${fileExt}`;
        
        // Upload file to storage
        const { error: uploadError } = await supabase.storage
          .from('dcg_files')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Save file metadata to database
        const { error: dbError } = await supabase
          .from('files')
          .insert({
            title: fileName,
            file_path: filePath,
            subject_id: parseInt(subjectId),
            category_id: parseInt(categoryId),
            user_id: (await supabase.auth.getUser()).data.user?.id,
          });

        if (dbError) throw dbError;

        successCount++;
        setProgress((successCount / totalFiles) * 100);
      }

      toast({
        title: "Succès",
        description: `${successCount} fichier(s) déposé(s) avec succès`,
      });
      
      onSuccess();
      resetForm();
    } catch (error: any) {
      console.error("Upload error:", error);
      const errorMessage = error.message?.includes("Payload too large")
        ? "Le fichier est trop volumineux (maximum 50 Mo)"
        : "Une erreur est survenue lors du dépôt des fichiers";
      
      toast({
        variant: "destructive",
        title: "Erreur",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  const resetForm = () => {
    setSubjectId(defaultSubjectId || '');
    setCategoryId('');
    setFiles(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Déposer des fichiers</DialogTitle>
          <DialogDescription>
            Vous pouvez sélectionner plusieurs fichiers à la fois (maximum 50 Mo par fichier). Le titre sera automatiquement repris du nom du fichier.
          </DialogDescription>
        </DialogHeader>
        <FileUploadForm
          subjectId={subjectId}
          categoryId={categoryId}
          isLoading={isLoading}
          progress={progress}
          defaultSubjectId={defaultSubjectId}
          onSubjectChange={setSubjectId}
          onCategoryChange={setCategoryId}
          onFilesChange={setFiles}
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}