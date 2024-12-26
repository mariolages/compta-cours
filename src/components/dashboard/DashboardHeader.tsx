import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload } from "lucide-react";
import { ProfileMenu } from "./ProfileMenu";

interface DashboardHeaderProps {
  selectedClassId: number | null;
  onBackClick: () => void;
  onUploadClick: () => void;
}

export const DashboardHeader = ({
  selectedClassId,
  onBackClick,
  onUploadClick,
}: DashboardHeaderProps) => {
  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {selectedClassId && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onBackClick}
                className="hover:bg-gray-100 rounded-full w-10 h-10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <h1 className="text-xl font-semibold text-primary">DCGHub</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              onClick={onUploadClick}
              className="bg-primary hover:bg-primary-hover text-white"
            >
              <Upload className="h-5 w-5 mr-2" />
              Déposer des fichiers
            </Button>
            <ProfileMenu />
          </div>
        </div>
      </div>
    </nav>
  );
};