import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface FileListHeaderProps {
  sortOrder: 'asc' | 'desc';
  onSortToggle: () => void;
}

export function FileListHeader({ sortOrder, onSortToggle }: FileListHeaderProps) {
  const { toast } = useToast();

  const handleSort = () => {
    onSortToggle();
    toast({
      title: "Tri mis à jour",
      description: `Les fichiers sont maintenant triés par date ${sortOrder === 'asc' ? 'décroissante' : 'croissante'}`,
    });
  };

  return (
    <div className="flex justify-end mb-6">
      <Button
        variant="outline"
        onClick={handleSort}
        className="flex items-center gap-2 hover:bg-gray-50"
      >
        <ArrowUpDown className="h-4 w-4" />
        Trier par date {sortOrder === 'asc' ? '↑' : '↓'}
      </Button>
    </div>
  );
}