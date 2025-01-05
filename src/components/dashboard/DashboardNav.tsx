import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "./SearchBar";
import { ProfileMenu } from "./ProfileMenu";
import { ArrowLeft, MessageSquare, Upload } from "lucide-react";
import { FileUploadDialog } from "./FileUploadDialog";
import type { Profile } from "@/types/admin";
import type { User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";

interface DashboardNavProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedClassId: number | null;
  onBackClick: () => void;
  profile?: Profile | null;
  user?: User | null;
}

export function DashboardNav({
  searchQuery,
  onSearchChange,
  selectedClassId,
  onBackClick,
  profile,
  user,
}: DashboardNavProps) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between gap-4 px-4">
        <div className="flex flex-1 items-center gap-4">
          {selectedClassId && (
            <Button
              onClick={onBackClick}
              variant="ghost"
              size="icon"
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <SearchBar value={searchQuery} onChange={onSearchChange} />
        </div>

        <div className="flex items-center gap-2">
          {/* Le bouton de chat est maintenant visible pour tous les utilisateurs */}
          <Button 
            onClick={() => navigate('/messages')} 
            variant="ghost" 
            size="icon"
            className="shrink-0"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>

          {/* Le bouton de dépôt de fichier reste uniquement pour les administrateurs */}
          {profile?.is_admin && (
            <Button onClick={() => setIsUploadOpen(true)} className="gap-2">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Déposer un fichier</span>
            </Button>
          )}
          <ProfileMenu profile={profile} user={user} />
        </div>

        <FileUploadDialog
          open={isUploadOpen}
          onOpenChange={setIsUploadOpen}
          onSuccess={() => setIsUploadOpen(false)}
        />
      </div>
    </div>
  );
}