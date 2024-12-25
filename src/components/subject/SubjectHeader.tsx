import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { MoreVertical, ArrowLeft, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface SubjectHeaderProps {
  code: string;
  name: string;
  onUploadClick: () => void;
  onDeleteClick?: () => Promise<void>; // Added optional delete prop
}

export function SubjectHeader({ code, name, onUploadClick, onDeleteClick }: SubjectHeaderProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newName, setNewName] = useState(name);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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
    <div className="mb-8 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{name}</h1>
            <p className="text-gray-500">{code}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={onUploadClick}>
            Ajouter un fichier
          </Button>

          {onDeleteClick && (
            <Button 
              variant="destructive" 
              size="icon" 
              onClick={onDeleteClick}
              className="hover:bg-red-600"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          )}

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Modifier le nom du cours</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nouveau nom du cours"
                />
                <Button onClick={handleUpdateName} className="w-full">
                  Enregistrer
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}