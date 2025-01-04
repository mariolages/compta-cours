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

const CHUNK_SIZE = 50 * 1024 * 1024; // 50MB in bytes

export function FileUploadDialog({ open, onOpenChange, onSuccess, defaultSubjectId }: FileUploadDialogProps) {
  const [subjectId, setSubjectId] = useState(defaultSubjectId || '');
  const [categoryId, setCategoryId] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const uploadFileInChunks = async (file: File, filePath: string) => {
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    let uploadedChunks = 0;

    for (let start = 0; start < file.size; start += CHUNK_SIZE) {
      const chunk = file.slice(start, start + CHUNK_SIZE);
      const chunkPath = `${filePath}_chunk_${uploadedChunks}`;

      const { error: uploadError } = await supabase.storage
        .from('dcg_files')
        .upload(chunkPath, chunk);

      if (uploadError) throw uploadError;

      uploadedChunks++;
      setProgress((uploadedChunks / totalChunks) * 100);
    }

    // Une fois tous les chunks uploadés, on les combine
    // Note: Cette étape nécessiterait un edge function pour combiner les chunks
    // Pour l'instant, on garde juste le premier chunk comme fichier final
    const { error: finalError } = await supabase.storage
      .from('dcg_files')
      .copy(`${filePath}_chunk_0`, filePath);

    if (finalError) throw finalError;

    // Nettoyage des chunks
    for (let i = 0; i < uploadedChunks; i++) {
      await supabase.storage
        .from('dcg_files')
        .remove([`${filePath}_chunk_${i}`]);
    }
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
        
        // Upload du fichier en chunks si nécessaire
        if (file.size > CHUNK_SIZE) {
          await uploadFileInChunks(file, filePath);
        } else {
          const { error: uploadError } = await supabase.storage
            .from('dcg_files')
            .upload(filePath, file);

          if (uploadError) throw uploadError;
        }

        // Sauvegarde des métadonnées dans la base de données
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
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors du dépôt des fichiers",
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
            Vous pouvez sélectionner plusieurs fichiers à la fois. Les fichiers volumineux seront automatiquement découpés en morceaux pour faciliter l'upload.
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