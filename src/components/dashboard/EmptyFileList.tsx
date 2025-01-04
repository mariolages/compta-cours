import React from 'react';

interface EmptyFileListProps {
  searchQuery: string;
}

export const EmptyFileList = ({ searchQuery }: EmptyFileListProps) => {
  return (
    <tr>
      <td colSpan={5} className="px-6 py-8 text-center text-gray-500 bg-gray-50">
        <div className="flex flex-col items-center justify-center space-y-2">
          <p className="text-lg font-medium">
            {searchQuery 
              ? `Aucun fichier trouvé pour "${searchQuery}"`
              : "Aucun fichier disponible"}
          </p>
          <p className="text-sm text-gray-400">
            Essayez une recherche différente ou ajoutez de nouveaux fichiers
          </p>
        </div>
      </td>
    </tr>
  );
};