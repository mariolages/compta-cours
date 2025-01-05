import { useQuery } from "@tanstack/react-query";
import { useSessionContext } from '@supabase/auth-helpers-react';
import { supabase } from "@/integrations/supabase/client";
import { FileCard } from "@/components/subject/FileCard";
import { EmptyFileList } from "@/components/subject/EmptyFileList";

export function FavoritesList() {
  const { session } = useSessionContext();

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites', session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          file_id,
          files (
            id,
            title,
            file_path,
            created_at,
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

      if (error) throw error;
      return data?.map(f => f.files) || [];
    },
    enabled: !!session?.user?.id,
  });

  const handleDownload = (fileId: string, filePath: string, fileName: string) => {
    const fileUrl = `https://sxpddyeasmcsnrbtvrgm.supabase.co/storage/v1/object/public/dcg_files/${filePath}`;
    window.open(fileUrl, '_blank');
  };

  if (favorites.length === 0) {
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