import React from 'react';
import { Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { File } from '@/types/files';

interface FileTableRowProps {
  file: File;
  onDelete: (fileId: string) => void;
}

export const FileTableRow = ({ file, onDelete }: FileTableRowProps) => {
  const handleFileClick = () => {
    const fileUrl = `https://sxpddyeasmcsnrbtvrgm.supabase.co/storage/v1/object/public/dcg_files/${file.file_path}`;
    
    // Log pour déboguer l'URL du fichier
    console.log('Opening file URL:', fileUrl);
    
    // Utiliser Google PDF Viewer pour ouvrir le fichier
    const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}`;
    window.open(googleViewerUrl, '_blank');
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        <button
          onClick={handleFileClick}
          className="hover:text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
        >
          {file.title}
        </button>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {file.subject.code} - {file.subject.name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <span className="px-3 py-1 rounded-full bg-primary-light text-primary">
          {file.category.name}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(file.created_at).toLocaleDateString('fr-FR')}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleFileClick}
            className="text-primary hover:text-primary-hover hover:bg-primary-light"
          >
            <Download className="h-4 w-4 mr-2" />
            Ouvrir
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onDelete(file.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer
          </Button>
        </div>
      </td>
    </tr>
  );
};