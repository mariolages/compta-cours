import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { MoreVertical, ArrowLeft, Upload } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface SubjectHeaderProps {
  code: string;
  name: string;
  onUploadClick: () => void;
  onDeleteClick: () => Promise<void>;
}

export function SubjectHeader({ code, name, onUploadClick, onDeleteClick }: SubjectHeaderProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newName, setNewName] = useState(name);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleUpdateName = async () => {
    try {
      const { data, error } = await supabase
        .from("subjects")
        .update({ name: newName })
        .eq("code", code)
        .select();

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
    <div className="mb-6 md:mb-8 space-y-4 bg-[#1A1F2C] text-white rounded-lg shadow-xl p-4 md:p-6 border border-white/10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-white hover:bg-white/10 transition-colors duration-200"
            variant="ghost"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="hidden md:inline">Retour au tableau de bord</span>
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{name}</h1>
            <p className="text-sm md:text-base text-gray-300">{code}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Button 
            onClick={onUploadClick} 
            className="w-full md:w-auto bg-[#1EAEDB] hover:bg-[#0FA0CE] text-white shadow-lg transition-all duration-300"
          >
            {isMobile ? (
              <Upload className="h-5 w-5" />
            ) : (
              "Ajouter un fichier"
            )}
          </Button>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="rounded-full w-10 h-10 flex items-center justify-center hover:bg-white/10"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-[#1A1F2C] border border-white/10 p-6">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-white">Modifier le nom du cours</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nouveau nom du cours"
                  className="w-full px-4 py-2 text-base bg-[#221F26] border-white/10 text-white"
                />
                <div className="flex gap-3">
                  <Button 
                    onClick={handleUpdateName} 
                    className="flex-1 bg-[#1EAEDB] hover:bg-[#0FA0CE] text-white"
                  >
                    Enregistrer
                  </Button>
                  <Button 
                    onClick={() => setIsEditDialogOpen(false)}
                    variant="outline" 
                    className="flex-1 border-white/10 text-white hover:bg-white/10"
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}