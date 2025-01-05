import { Button } from "@/components/ui/button";
import { ArrowUpDown, SortAsc } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface FileListHeaderProps {
  sortOrder: 'asc' | 'desc';
  onSortToggle: () => void;
  sortType: 'date' | 'alpha' | 'ue';
  onSortTypeToggle: () => void;
}

export function FileListHeader({ 
  sortOrder, 
  onSortToggle, 
  sortType,
  onSortTypeToggle 
}: FileListHeaderProps) {
  const { toast } = useToast();

  const handleSort = () => {
    onSortToggle();
    toast({
      title: "Tri mis à jour",
      description: `Les fichiers sont maintenant triés ${sortOrder === 'asc' ? 'croissant' : 'décroissant'}`,
    });
  };

  const handleSortType = () => {
    onSortTypeToggle();
    toast({
      title: "Type de tri mis à jour",
      description: `Les fichiers sont maintenant triés par ${
        sortType === 'date' 
          ? 'ordre alphabétique' 
          : sortType === 'alpha' 
            ? 'numéro d\'UE' 
            : 'date'
      }`,
    });
  };

  return (
    <div className="flex justify-end mb-6 gap-2">
      <Button
        variant="outline"
        onClick={handleSortType}
        className="flex items-center gap-2 hover:bg-gray-50"
      >
        <SortAsc className="h-4 w-4" />
        Trier par {
          sortType === 'date' 
            ? 'date' 
            : sortType === 'alpha' 
              ? 'numéro d\'UE'
              : 'ordre alphabétique'
        }
      </Button>
      <Button
        variant="outline"
        onClick={handleSort}
        className="flex items-center gap-2 hover:bg-gray-50"
      >
        <ArrowUpDown className="h-4 w-4" />
        {sortOrder === 'asc' ? '↑' : '↓'}
      </Button>
    </div>
  );
}