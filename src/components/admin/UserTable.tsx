import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { UserProfile } from "@/types/admin";

interface UserTableProps {
  users: UserProfile[];
  isUpdating: boolean;
  onToggleValidation: (userId: string, currentStatus: boolean) => Promise<void>;
}

export const UserTable = ({ users, isUpdating, onToggleValidation }: UserTableProps) => {
  return (
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
                onClick={() => onToggleValidation(user.id, user.is_validated)}
                className="gap-2"
                disabled={isUpdating}
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
  );
};