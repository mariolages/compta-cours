import { useQuery } from "@tanstack/react-query";
import { useSessionContext } from '@supabase/auth-helpers-react';
import { supabase } from "@/integrations/supabase/client";
import { FileCard } from "@/components/subject/FileCard";
import { EmptyFileList } from "@/components/subject/EmptyFileList";

export function FavoritesList() {
  const { session } = useSessionContext();

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['favorites', session?.user?.id],
    queryFn: async () => {
      console.log("Fetching favorites for user:", session?.user?.id);
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          files (
            *,
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
      
      console.log("Fetched favorites:", data);
      const validFiles = data?.map(f => f.files).filter(f => f !== null) || [];
      console.log("Valid files:", validFiles);
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
  );
}