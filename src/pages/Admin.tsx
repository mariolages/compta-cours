import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import type { UserProfile } from "@/types/admin";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatsCards } from "@/components/admin/StatsCards";
import { UsersTable } from "@/components/admin/UsersTable";
import { LogsTable } from "@/components/admin/LogsTable";

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
      totalDownloads: 0,
    });
  };

  const fetchUsers = async () => {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return;
    }

    // Get emails from auth_logs
    const { data: authLogs } = await supabase
      .from('auth_logs')
      .select('user_id, email')
      .order('created_at', { ascending: false });

    // Create a map of user_id to email
    const emailMap = new Map();
    authLogs?.forEach(log => {
      if (!emailMap.has(log.user_id)) {
        emailMap.set(log.user_id, log.email);
      }
    });

    // Combine profile data with email
    const usersWithEmail = profiles.map(profile => ({
      ...profile,
      email: emailMap.get(profile.id) || 'N/A'
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto py-8 px-4">
        <AdminHeader />
        <StatsCards stats={stats} />

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users" className="flex items-center gap-2">
              Utilisateurs
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              Logs de connexion
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-2">
              Support
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UsersTable users={users} onUserUpdate={fetchUsers} />
          </TabsContent>

          <TabsContent value="logs">
            <LogsTable logs={logs} />
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