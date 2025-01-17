import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GlobalSearch } from "../search/GlobalSearch";
import { RealtimeNotifications } from "../notifications/RealtimeNotifications";
import { ProfileMenu } from "./ProfileMenu";
import { ArrowLeft, MessageSquare, Upload } from "lucide-react";
import { FileUploadDialog } from "./FileUploadDialog";
import type { Profile } from "@/types/admin";
import type { User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface DashboardNavProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedClassId: number | null;
  onBackClick: () => void;
  profile?: Profile | null;
  user?: User | null;
}

export function DashboardNav({
  selectedClassId,
  onBackClick,
  profile,
  user,
}: DashboardNavProps) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <motion.div 
      className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
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
          <GlobalSearch />
        </div>

        <div className="flex items-center gap-2">
          <Button 
            onClick={() => navigate('/messages')} 
            variant="ghost" 
            size="icon"
            className="shrink-0"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>

          <RealtimeNotifications />

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
    </motion.div>
  );
}