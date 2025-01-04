import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface ProfileMenuProps {
  user: User | null;
  profile: any;
}

export const ProfileMenu = ({ user, profile }: ProfileMenuProps) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{user?.email ? getInitials(user.email) : 'U'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuItem className="flex flex-col items-start">
          <div className="text-sm font-medium">{profile?.full_name || user?.email}</div>
          <div className="text-xs text-muted-foreground overflow-hidden text-ellipsis">
            {user?.email}
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {profile?.is_admin && (
          <DropdownMenuItem onClick={() => navigate('/admin')}>
            Administration
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => navigate('/subscription')} className="text-gray-500">
          Abonnement
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut}>
          Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};