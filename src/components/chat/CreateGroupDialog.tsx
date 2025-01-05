import { useState } from "react";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CreateGroupDialogProps {
  onGroupCreated: () => void;
}

export const CreateGroupDialog = ({ onGroupCreated }: CreateGroupDialogProps) => {
  const { session } = useSessionContext();
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .neq('id', session?.user?.id);
      
      if (error) throw error;
      return profiles;
    },
    enabled: !!session?.user?.id,
  });

  const handleCreateGroup = async () => {
    if (!session?.user?.id || !groupName.trim() || selectedParticipants.length === 0) return;

    const { error } = await supabase
      .from('chat_groups')
      .insert({
        name: groupName.trim(),
        created_by: session.user.id,
        participants: [session.user.id, ...selectedParticipants]
      });

    if (error) {
      console.error('Error creating group:', error);
      return;
    }

    setOpen(false);
    setGroupName("");
    setSelectedParticipants([]);
    onGroupCreated();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer un groupe</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="group-name">Nom du groupe</Label>
            <Input
              id="group-name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Entrez le nom du groupe"
            />
          </div>
          <div className="space-y-2">
            <Label>Participants</Label>
            {users?.map((user) => (
              <div key={user.id} className="flex items-center space-x-2">
                <Checkbox
                  id={user.id}
                  checked={selectedParticipants.includes(user.id)}
                  onCheckedChange={(checked) => {
                    setSelectedParticipants(current =>
                      checked
                        ? [...current, user.id]
                        : current.filter(id => id !== user.id)
                    );
                  }}
                />
                <Label htmlFor={user.id}>{user.full_name || 'Utilisateur'}</Label>
              </div>
            ))}
          </div>
          <Button 
            onClick={handleCreateGroup} 
            disabled={!groupName.trim() || selectedParticipants.length === 0}
          >
            Créer le groupe
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};