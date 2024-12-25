import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SubjectHeaderProps {
  code: string;
  name: string;
  onUploadClick: () => void;
}

export function SubjectHeader({ code, name, onUploadClick }: SubjectHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="mb-8 bg-white rounded-xl p-6 shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 w-full">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="group hover:bg-primary/10 transition-all duration-300"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:translate-x-[-2px] transition-transform" />
            Retour
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {code} - {name}
          </h1>
        </div>
        <Button
          onClick={onUploadClick}
          className="bg-primary hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          <Upload className="mr-2 h-4 w-4" />
          Déposer un fichier
        </Button>
      </div>
    </div>
  );
}