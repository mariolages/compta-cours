import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { DeleteUserDialog } from "./DeleteUserDialog";
import type { UserProfile } from "@/types/admin";

interface UserListProps {
  users: UserProfile[];
  onUpdateStatus: (userId: string, field: 'is_validated' | 'is_banned', value: boolean) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
}

export const UserList = ({ users, onUpdateStatus, onDeleteUser }: UserListProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Validé</TableHead>
            <TableHead>Banni</TableHead>
            <TableHead>Actions</TableHead>
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
                  checked={Boolean(user.is_validated)}
                  onCheckedChange={(checked) => 
                    onUpdateStatus(user.id, 'is_validated', checked)
                  }
                  className="data-[state=checked]:bg-primary"
                />
              </TableCell>
              <TableCell>
                <Switch
                  checked={Boolean(user.is_banned)}
                  onCheckedChange={(checked) => 
                    onUpdateStatus(user.id, 'is_banned', checked)
                  }
                  className="data-[state=checked]:bg-primary"
                />
              </TableCell>
              <TableCell>
                <DeleteUserDialog 
                  onConfirm={() => onDeleteUser(user.id)}
                  disabled={user.is_admin}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};