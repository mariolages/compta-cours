import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Ban, CheckCircle } from 'lucide-react';
import type { UserProfile } from '@/types/admin';

const Admin = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminStatus();
    fetchUsers();
    fetchLogs();
  }, []);

  const checkAdminStatus = async () => {
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
      return;
    }

    setIsAdmin(true);
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

    setUsers(profiles);
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

  const toggleBan = async (userId: string, currentBanStatus: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_banned: !currentBanStatus })
      .eq('id', userId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de modifier le statut de l'utilisateur",
      });
      return;
    }

    toast({
      title: "Succès",
      description: `L'utilisateur a été ${!currentBanStatus ? 'banni' : 'débanni'}`,
    });

    fetchUsers();
  };

  if (!isAdmin) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Portail Administrateur</h1>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Utilisateurs</h2>
          <ScrollArea className="h-[400px] rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.full_name || 'Non renseigné'}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.is_banned ? (
                        <span className="text-red-500">Banni</span>
                      ) : (
                        <span className="text-green-500">Actif</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant={user.is_banned ? "outline" : "destructive"}
                        size="sm"
                        onClick={() => toggleBan(user.id, user.is_banned || false)}
                      >
                        {user.is_banned ? (
                          <><CheckCircle className="h-4 w-4 mr-2" /> Débannir</>
                        ) : (
                          <><Ban className="h-4 w-4 mr-2" /> Bannir</>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Logs de Connexion</h2>
          <ScrollArea className="h-[400px] rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Événement</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.email}</TableCell>
                    <TableCell>{log.event_type}</TableCell>
                    <TableCell>
                      {new Date(log.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default Admin;