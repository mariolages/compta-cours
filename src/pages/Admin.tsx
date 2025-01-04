import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Users, FileText, Activity, MessageSquare } from "lucide-react";
import type { UserProfile } from "@/types/admin";

const Admin = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFiles: 0,
    totalDownloads: 0,
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
    fetchStats();
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
      toast({
        variant: "destructive",
        title: "Accès refusé",
        description: "Vous n'avez pas les droits d'administrateur",
      });
      navigate('/dashboard');
      return;
    }

    fetchUsers();
    fetchLogs();
  };

  const fetchStats = async () => {
    const { data: usersCount } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' });

    const { data: filesCount } = await supabase
      .from('files')
      .select('id', { count: 'exact' });

    setStats({
      totalUsers: usersCount?.length || 0,
      totalFiles: filesCount?.length || 0,
      totalDownloads: 0, // À implémenter avec un système de tracking des téléchargements
    });
  };

  const fetchUsers = async () => {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*, auth_logs(email)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return;
    }

    // Combine profile data with email from auth_logs
    const usersWithEmail = profiles.map(profile => ({
      ...profile,
      email: profile.auth_logs?.[0]?.email || 'N/A'
    }));

    setUsers(usersWithEmail);
  };

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from('auth_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching logs:', error);
      return;
    }

    setLogs(data);
  };

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
      
      // Refresh the users list
      fetchUsers();
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
      
      // Refresh the users list
      fetchUsers();
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Administration DCG</h1>
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au tableau de bord
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs Total</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fichiers Total</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFiles}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Téléchargements</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDownloads}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Utilisateurs
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Logs de connexion
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Support
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
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
          </TabsContent>

          <TabsContent value="logs">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type d'événement
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {logs.map((log) => (
                        <tr key={log.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {log.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {log.event_type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support">
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <MessageSquare className="h-12 w-12 mx-auto text-gray-400" />
                  <h3 className="text-lg font-medium">Support utilisateurs</h3>
                  <p className="text-gray-500">
                    Cette fonctionnalité sera bientôt disponible. Elle permettra de gérer les demandes de support des utilisateurs.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
