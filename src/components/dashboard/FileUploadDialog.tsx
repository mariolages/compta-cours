import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

interface FileUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  defaultSubjectId?: string;
}

export function FileUploadDialog({ open, onOpenChange, onSuccess, defaultSubjectId }: FileUploadDialogProps) {
  const [subjectId, setSubjectId] = useState(defaultSubjectId || '');
  const [categoryId, setCategoryId] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

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
            title: file.name.replace(`.${fileExt}`, ''),
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
    } catch (error) {
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
            Vous pouvez sélectionner plusieurs fichiers à la fois
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Matière</Label>
            <Select
              value={subjectId}
              onValueChange={setSubjectId}
              disabled={defaultSubjectId ? true : isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une matière" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">UE1 - Fondamentaux du droit</SelectItem>
                <SelectItem value="2">UE2 - Droit des sociétés</SelectItem>
                <SelectItem value="3">UE3 - Droit social</SelectItem>
                <SelectItem value="4">UE4 - Droit fiscal</SelectItem>
                <SelectItem value="5">UE5 - Économie contemporaine</SelectItem>
                <SelectItem value="6">UE6 - Finance d'entreprise</SelectItem>
                <SelectItem value="7">UE7 - Management</SelectItem>
                <SelectItem value="8">UE8 - Systèmes d'information de gestion</SelectItem>
                <SelectItem value="9">UE9 - Comptabilité</SelectItem>
                <SelectItem value="10">UE10 - Comptabilité approfondie</SelectItem>
                <SelectItem value="11">UE11 - Contrôle de gestion</SelectItem>
                <SelectItem value="12">UE12 - Anglais des affaires</SelectItem>
                <SelectItem value="13">UE13 - Communication professionnelle</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Catégorie</Label>
            <Select
              value={categoryId}
              onValueChange={setCategoryId}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">📘 Cours</SelectItem>
                <SelectItem value="2">📄 Exercices</SelectItem>
                <SelectItem value="3">✅ Corrections d'exercices</SelectItem>
                <SelectItem value="4">📂 Sujets d'examen</SelectItem>
                <SelectItem value="5">✅ Corrections de sujets d'examen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="files">Fichiers</Label>
            <Input
              id="files"
              type="file"
              onChange={(e) => setFiles(e.target.files)}
              disabled={isLoading}
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              multiple
            />
          </div>

          {isLoading && progress > 0 && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-center text-muted-foreground">
                {Math.round(progress)}% terminé
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Dépôt en cours..." : "Déposer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}