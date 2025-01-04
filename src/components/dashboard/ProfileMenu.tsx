import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Settings, Shield, CreditCard } from "lucide-react";

export const ProfileMenu = ({ user, profile }: { user: any; profile: any }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la déconnexion",
      });
      return;
    }
    navigate("/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors">
        <span className="text-sm font-normal">
          {profile?.full_name || user?.email}
        </span>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-secondary text-gray-500 text-xs">
            {profile?.full_name
              ?.split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {profile?.is_admin && (
          <>
            <DropdownMenuItem 
              className="cursor-pointer flex items-center gap-2 text-blue-600"
              onClick={() => navigate("/admin")}
            >
              <Shield className="h-4 w-4" />
              Administration
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem 
          className="cursor-pointer flex items-center gap-2"
          onClick={() => navigate("/subscription")}
        >
          <CreditCard className="h-4 w-4" />
          Abonnement
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="cursor-pointer flex items-center gap-2"
          onClick={() => navigate("/settings")}
        >
          <Settings className="h-4 w-4" />
          Paramètres
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="cursor-pointer flex items-center gap-2 text-red-600"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};