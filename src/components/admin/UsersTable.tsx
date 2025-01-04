import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { UserProfile } from "@/types/admin";

interface UsersTableProps {
  users: UserProfile[];
  onUserUpdate: () => void;
}

export const UsersTable = ({ users, onUserUpdate }: UsersTableProps) => {
  const { toast } = useToast();

  const handleUserValidation = async (userId: string, isValidated: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_validated: isValidated })
        .eq('id', userId);

      if (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de mettre à jour le statut de l'utilisateur",
        });
        return;
      }

      toast({
        title: "Succès",
        description: `L'utilisateur a été ${isValidated ? 'validé' : 'invalidé'}`,
      });
      
      onUserUpdate();
    } catch (error) {
      console.error('Error validating user:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la validation",
      });
    }
  };

  const handleUserBan = async (userId: string, isBanned: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: isBanned })
        .eq('id', userId);

      if (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de mettre à jour le statut de l'utilisateur",
        });
        return;
      }

      toast({
        title: "Succès",
        description: `L'utilisateur a été ${isBanned ? 'banni' : 'débanni'}`,
      });
      
      onUserUpdate();
    } catch (error) {
      console.error('Error banning user:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors du bannissement",
      });
    }
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.full_name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.is_banned 
                        ? 'bg-red-100 text-red-800'
                        : user.is_validated
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.is_banned 
                        ? 'Banni'
                        : user.is_validated
                          ? 'Validé'
                          : 'En attente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {!user.is_banned && (
                      <Button
                        variant={user.is_validated ? "destructive" : "default"}
                        size="sm"
                        onClick={() => handleUserValidation(user.id, !user.is_validated)}
                      >
                        {user.is_validated ? 'Invalider' : 'Valider'}
                      </Button>
                    )}
                    <Button
                      variant={user.is_banned ? "outline" : "destructive"}
                      size="sm"
                      onClick={() => handleUserBan(user.id, !user.is_banned)}
                    >
                      {user.is_banned ? 'Débannir' : 'Bannir'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};