import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import type { UserProfile } from "@/types/admin";

export default function Admin() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (!profile?.is_admin) {
        toast({
          variant: "destructive",
          title: "Accès refusé",
          description: "Vous n'avez pas les droits d'administration.",
        });
        navigate('/dashboard');
      }
    };

    checkAdmin();
  }, [navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger la liste des utilisateurs",
        });
        return;
      }

      setUsers(profiles);
      setIsLoading(false);
    };

    fetchUsers();
  }, []);

  const updateUserStatus = async (userId: string, field: 'is_validated' | 'is_banned', value: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ [field]: value })
      .eq('id', userId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour le statut de l'utilisateur",
      });
      return;
    }

    setUsers(users.map(user => 
      user.id === userId ? { ...user, [field]: value } : user
    ));

    toast({
      title: "Succès",
      description: "Le statut de l'utilisateur a été mis à jour",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold mb-6">Administration des utilisateurs</h1>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Validé</TableHead>
                  <TableHead>Banni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.full_name || "Sans nom"}</TableCell>
                    <TableCell>
                      {user.is_admin ? (
                        <Badge>Admin</Badge>
                      ) : (
                        <Badge variant="secondary">Utilisateur</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={user.is_validated ?? false}
                        onCheckedChange={(checked) => 
                          updateUserStatus(user.id, 'is_validated', checked)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={user.is_banned ?? false}
                        onCheckedChange={(checked) => 
                          updateUserStatus(user.id, 'is_banned', checked)
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}