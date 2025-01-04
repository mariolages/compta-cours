import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { SearchBar } from './SearchBar';
import { ProfileMenu } from './ProfileMenu';

interface DashboardNavProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedClassId: number | null;
  onBackClick: () => void;
  profile: any;
  user: any;
}

export const DashboardNav = ({ 
  searchQuery, 
  onSearchChange, 
  selectedClassId, 
  onBackClick,
  profile,
  user
}: DashboardNavProps) => {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            {selectedClassId && (
              <Button
                variant="ghost"
                onClick={onBackClick}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Retour
              </Button>
            )}
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              compta-cours.fr
            </h1>
          </div>
          
          <SearchBar value={searchQuery} onChange={onSearchChange} />

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.location.reload()}
              className="relative"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <ProfileMenu user={user} profile={profile} />
          </div>
        </div>
      </div>
    </nav>
  );
};