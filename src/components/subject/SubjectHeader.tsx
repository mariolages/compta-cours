import { Button } from "@/components/ui/button";
import { Upload, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface SubjectHeaderProps {
  code: string;
  name: string;
  onUploadClick: () => void;
}

export function SubjectHeader({ code, name, onUploadClick }: SubjectHeaderProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newName, setNewName] = useState(name);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleUpdateName = async () => {
    try {
      console.log("Tentative de mise à jour du nom du cours:", {
        code,
        nouveauNom: newName,
      });

      const { data, error } = await supabase
        .from("subjects")
        .update({ name: newName })
        .eq("code", code)
        .select();

      console.log("Réponse de Supabase:", { data, error });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Le nom du cours a été mis à jour",
      });
      
      // Invalider le cache pour forcer un rechargement des données
      queryClient.invalidateQueries({ queryKey: ["subject"] });
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Erreur détaillée lors de la mise à jour:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour le nom du cours",
      });
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-4">
            {name}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  Modifier le nom
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </h1>
          <p className="text-gray-500">Code: {code}</p>
        </div>
        <Button onClick={onUploadClick} className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Déposer un fichier
        </Button>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le nom du cours</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nouveau nom du cours"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateName}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}