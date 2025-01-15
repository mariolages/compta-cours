import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useMobile } from "@/hooks/use-mobile";
import { EmptyFileList } from "@/components/subject/EmptyFileList";
import { File } from "@/types/files";
import { FileCard } from "@/components/subject/FileCard";

const SubjectPage = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const { toast } = useToast();
  const isMobile = useMobile();

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const { data, error } = await supabase
          .from('files')
          .select('*, category:categories(*), subject:subjects(*)')
          .eq('subject_id', parseInt(subjectId || '0', 10));

        if (error) throw error;

        setFiles(data || []);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les fichiers",
        });
      } finally {
        setLoading(false);
      }
    };

    if (subjectId) {
      fetchFiles();
    }
  }, [subjectId, toast]);

  const handleRenameClick = (id: string) => {
    const file = files.find(f => f.id === id);
    if (file) {
      setEditingFileId(id);
      setNewTitle(file.title);
    }
  };

  const handleRenameSubmit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('files')
        .update({ title: newTitle })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Le fichier a été renommé avec succès",
      });

      setEditingFileId(null);
      setNewTitle("");
      // Refetch files after renaming
      const { data } = await supabase
        .from('files')
        .select('*, category:categories(*), subject:subjects(*)')
        .eq('subject_id', parseInt(subjectId || '0', 10));
      setFiles(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de renommer le fichier",
      });
    }
  };

  const handleRenameCancel = () => {
    setEditingFileId(null);
    setNewTitle("");
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('files')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Le fichier a été supprimé avec succès",
      });

      // Refetch files after deletion
      const { data } = await supabase
        .from('files')
        .select('*, category:categories(*), subject:subjects(*)')
        .eq('subject_id', parseInt(subjectId || '0', 10));
      setFiles(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer le fichier",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!files.length) {
    return <EmptyFileList searchQuery="" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Fichiers pour la matière</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map(file => (
          <FileCard
            key={file.id}
            file={file}
            editingFileId={editingFileId}
            newTitle={newTitle}
            onRenameClick={handleRenameClick}
            onRenameSubmit={handleRenameSubmit}
            onRenameCancel={handleRenameCancel}
            onNewTitleChange={setNewTitle}
            onDelete={handleDelete}
            selectedCategory=""
          />
        ))}
      </div>
    </div>
  );
};

export default SubjectPage;