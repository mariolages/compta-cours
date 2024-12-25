import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

interface FileUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function FileUploadDialog({ open, onOpenChange, onSuccess }: FileUploadDialogProps) {
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !subjectId || !categoryId) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('dcg_files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Save file metadata to database
      const { error: dbError } = await supabase
        .from('files')
        .insert({
          title,
          file_path: filePath,
          subject_id: parseInt(subjectId),
          category_id: parseInt(categoryId),
          user_id: (await supabase.auth.getUser()).data.user?.id,
        });

      if (dbError) throw dbError;

      toast({
        title: "Succès",
        description: "Votre fichier a été déposé avec succès",
      });
      
      onSuccess();
      resetForm();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors du dépôt du fichier",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setSubjectId('');
    setCategoryId('');
    setFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Déposer un fichier</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre du document"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subject">Matière</Label>
            <Select
              value={subjectId}
              onValueChange={setSubjectId}
              disabled={isLoading}
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
                <SelectItem value="1">Cours</SelectItem>
                <SelectItem value="2">Exercices</SelectItem>
                <SelectItem value="3">Corrections</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Fichier</Label>
            <Input
              id="file"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={isLoading}
              accept=".pdf,.doc,.docx,.xls,.xlsx"
            />
          </div>

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