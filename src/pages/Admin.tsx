import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, X, Home } from "lucide-react";

interface UserProfile {
  id: string;
  full_name: string | null;
  is_admin: boolean;
  is_validated: boolean;
  email?: string;
}

export default function Admin() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
    fetchUsers();
  }, []);

  const checkAdminAccess = async () => {
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
      navigate('/dashboard');
      toast({
        variant: "destructive",
        title: "Accès refusé",
        description: "Vous n'avez pas les droits d'administration",
      });
    }
  };

  const fetchUsers = async () => {
    try {
      setError(null);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No session');
      }

      console.log("Fetching users...");
      const response = await fetch(
        'https://sxpddyeasmcsnrbtvrgm.functions.supabase.co/get-users',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch users');
      }

      const users = await response.json();
      console.log("Users fetched successfully:", users);
      setUsers(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(error.message);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Impossible de charger la liste des utilisateurs: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleValidation = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_validated: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: `L'utilisateur a été ${!currentStatus ? 'validé' : 'invalidé'}`,
      });

      fetchUsers();
    } catch (error) {
      console.error("Error toggling validation:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour le statut de l'utilisateur",
      });
    }
  };

  if (isLoading) {
    return <div className="p-8">Chargement...</div>;
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-red-500 mb-4">Erreur: {error}</div>
        <Button onClick={fetchUsers}>Réessayer</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Administration des utilisateurs</h1>
        <Button 
          variant="outline" 
          onClick={() => navigate('/dashboard')}
          className="gap-2"
        >
          <Home className="h-4 w-4" />
          Retour à l'accueil
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email || "Email non disponible"}</TableCell>
                <TableCell>{user.full_name || "Sans nom"}</TableCell>
                <TableCell>
                  {user.is_admin ? (
                    <Badge variant="default">Admin</Badge>
                  ) : (
                    <Badge variant="secondary">Utilisateur</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {user.is_validated ? (
                    <Badge variant="default" className="bg-green-500">Validé</Badge>
                  ) : (
                    <Badge variant="destructive">Non validé</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant={user.is_validated ? "destructive" : "default"}
                    size="sm"
                    onClick={() => toggleValidation(user.id, user.is_validated)}
                    className="gap-2"
                  >
                    {user.is_validated ? (
                      <>
                        <X className="h-4 w-4" />
                        Invalider
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Valider
                      </>
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}