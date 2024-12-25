import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

interface FileListHeaderProps {
  sortOrder: 'asc' | 'desc';
  onSortToggle: () => void;
}

export function FileListHeader({ sortOrder, onSortToggle }: FileListHeaderProps) {
  return (
    <div className="flex justify-end mb-6">
      <Button
        variant="outline"
        onClick={onSortToggle}
        className="flex items-center gap-2 hover:bg-gray-50"
      >
        <ArrowUpDown className="h-4 w-4" />
        Trier par date {sortOrder === 'asc' ? '↑' : '↓'}
      </Button>
    </div>
  );
}