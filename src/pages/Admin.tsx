import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Home } from "lucide-react";
import { UserTable } from "@/components/admin/UserTable";
import type { UserProfile } from "@/types/admin";

export default function Admin() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
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
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      console.log(`Toggling validation for user ${userId} from ${currentStatus} to ${!currentStatus}`);
      
      // Update local state immediately for better UX
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, is_validated: !currentStatus }
            : user
        )
      );

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          is_validated: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        // Revert local state if update fails
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId 
              ? { ...user, is_validated: currentStatus }
              : user
          )
        );
        console.error("Error updating validation status:", updateError);
        throw updateError;
      }

      toast({
        title: "Succès",
        description: `L'utilisateur a été ${!currentStatus ? 'validé' : 'invalidé'}`,
      });

    } catch (error) {
      console.error("Error toggling validation:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour le statut de l'utilisateur",
      });
    } finally {
      setIsUpdating(false);
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
        <UserTable 
          users={users}
          isUpdating={isUpdating}
          onToggleValidation={toggleValidation}
        />
      </div>
    </div>
  );
}