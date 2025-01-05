import { Link } from "react-router-dom";
import { SearchBar } from "./SearchBar";
import { ProfileMenu } from "./ProfileMenu";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/types/admin";
import type { User } from "@supabase/supabase-js";

interface DashboardNavProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedClassId: number | null;
  onBackClick: () => void;
  profile?: Profile | null;
  user?: User | null;
}

export const DashboardNav = ({
  searchQuery,
  onSearchChange,
  selectedClassId,
  onBackClick,
  profile,
  user,
}: DashboardNavProps) => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex items-center gap-2 flex-1">
          {selectedClassId ? (
            <Button
              onClick={onBackClick}
              variant="ghost"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
          ) : (
            <SearchBar value={searchQuery} onChange={onSearchChange} />
          )}
        </div>

        <div className="flex items-center gap-4">
          <Link to="/messages">
            <Button variant="ghost" size="icon">
              <MessageSquare className="h-5 w-5" />
            </Button>
          </Link>
          <ProfileMenu profile={profile} user={user} />
        </div>
      </div>
    </nav>
  );
};