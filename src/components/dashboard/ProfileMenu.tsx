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
    try {
      // Déconnexion de l'utilisateur
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;

      // Nettoyage complet du stockage local
      localStorage.clear();
      sessionStorage.clear();

      // Suppression des cookies liés à l'authentification
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // Log de la déconnexion réussie
      await supabase
        .from('auth_logs')
        .insert([{ 
          user_id: user?.id,
          email: user?.email,
          event_type: 'logout_success'
        }]);

      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès",
      });

      // Redirection forcée avec reload pour s'assurer que tout est réinitialisé
      window.location.href = '/login';
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      
      // Log de l'erreur
      await supabase
        .from('auth_logs')
        .insert([{ 
          user_id: user?.id,
          email: user?.email,
          event_type: 'logout_error',
        }]);

      toast({
        variant: "destructive",
        title: "Erreur de déconnexion",
        description: "Une erreur est survenue. Veuillez réessayer.",
      });
    }
  };

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => navigate("/subscription")}
        className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
      >
        Abonnement
      </button>
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
    </div>
  );
};