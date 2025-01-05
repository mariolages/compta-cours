import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CreateGroupDialogProps {
  onGroupCreated: () => void;
}

export const CreateGroupDialog = ({ onGroupCreated }: CreateGroupDialogProps) => {
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const { session } = useSessionContext();
  const { toast } = useToast();

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.id) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour créer un groupe",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('chat_groups')
        .insert({
          name: groupName,
          created_by: session.user.id,
          participants: [session.user.id]
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Le groupe a été créé",
      });
      
      setGroupName("");
      setOpen(false);
      onGroupCreated();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le groupe",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white rounded-full"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer un nouveau groupe</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateGroup} className="space-y-4">
          <div>
            <Label htmlFor="groupName">Nom du groupe</Label>
            <Input
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Entrez le nom du groupe"
            />
          </div>
          <Button type="submit" className="w-full">
            Créer le groupe
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};