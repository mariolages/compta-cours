import { useQuery } from "@tanstack/react-query";
import { useSessionContext } from '@supabase/auth-helpers-react';
import { supabase } from "@/integrations/supabase/client";
import { FileCard } from "@/components/subject/FileCard";
import { EmptyFileList } from "@/components/subject/EmptyFileList";
import { Button } from "@/components/ui/button";
import { Grid, List } from "lucide-react";
import { useState } from "react";

export function FavoritesList() {
  const { session } = useSessionContext();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['favorites', session?.user?.id],
    queryFn: async () => {
      console.log("Fetching favorites for user:", session?.user?.id);
      const { data: favoritesData, error } = await supabase
        .from('favorites')
        .select(`
          id,
          file_id,
          files:file_id (
            id,
            title,
            file_path,
            category_id,
            subject_id,
            created_at,
            user_id,
            category:category_id (
              id,
              name
            ),
            subject:subject_id (
              id,
              code,
              name
            )
          )
        `)
        .eq('user_id', session?.user?.id);

      if (error) {
        console.error("Error fetching favorites:", error);
        throw error;
      }
      
      console.log("Fetched favorites data:", favoritesData);
      
      // Filtrer les fichiers valides et les transformer au bon format
      const validFiles = favoritesData
        ?.filter(f => f.files !== null)
        .map(f => ({
          ...f.files,
          category: f.files.category,
          subject: f.files.subject,
          folder_id: null // Adding the missing property to match File type
        })) || [];
        
      console.log("Valid files to display:", validFiles);
      return validFiles;
    },
    enabled: !!session?.user?.id,
  });

  const handleDownload = (fileId: string, filePath: string, fileName: string) => {
    const fileUrl = `https://sxpddyeasmcsnrbtvrgm.supabase.co/storage/v1/object/public/dcg_files/${filePath}`;
    window.open(fileUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!favorites || favorites.length === 0) {
    return <EmptyFileList searchQuery="" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Mes Favoris ({favorites.length})
        </h2>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
        {favorites.map((file) => (
          <FileCard
            key={file.id}
            file={file}
            editingFileId={null}
            newTitle=""
            onRenameClick={() => {}}
            onRenameSubmit={() => {}}
            onRenameCancel={() => {}}
            onNewTitleChange={() => {}}
            onDelete={() => {}}
            onDownload={handleDownload}
            hasSubscription={true}
            selectedCategory=""
          />
        ))}
      </div>
    </div>
  );
}