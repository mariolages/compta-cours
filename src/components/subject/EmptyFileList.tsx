import React from 'react';
import { FileIcon } from 'lucide-react';

interface EmptyFileListProps {
  searchQuery: string;
}

export const EmptyFileList = ({ searchQuery }: EmptyFileListProps) => {
  return (
    <tr>
      <td colSpan={5} className="h-24 text-center">
        <div className="flex flex-col items-center justify-center gap-2">
          <FileIcon className="h-8 w-8 text-gray-400" />
          <p className="text-sm text-gray-500">
            {searchQuery
              ? `Aucun fichier ne correspond à "${searchQuery}"`
              : "Aucun fichier disponible"}
          </p>
        </div>
      </td>
    </tr>
  );
};