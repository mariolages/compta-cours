import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EmptyFileList } from "@/components/subject/EmptyFileList";
import { File } from "@/types/files";
import { FileCard } from "@/components/subject/FileCard";

const SubjectPage = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const [files, setFiles] = useState<File[]>([]);
  const [editingFileId, setEditingFileId] = useState<string>("");
  const [newTitle, setNewTitle] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    fetchFiles();
  }, [subjectId]);

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase
        .from("files")
        .select(`
          *,
          subject:subjects(id, name, code),
          category:categories(id, name)
        `)
        .eq("subject_id", parseInt(subjectId!));

      if (error) {
        throw error;
      }

      setFiles(data || []);
    } catch (error: any) {
      console.error("Error fetching files:", error.message);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les fichiers",
      });
    }
  };

  const handleRenameClick = (id: string) => {
    const file = files.find((f) => f.id === id);
    if (file) {
      setEditingFileId(id);
      setNewTitle(file.title);
    }
  };

  const handleRenameSubmit = async (id: string) => {
    try {
      const { error } = await supabase
        .from("files")
        .update({ title: newTitle })
        .eq("id", id);

      if (error) {
        throw error;
      }

      setEditingFileId("");
      setNewTitle("");
      fetchFiles();

      toast({
        title: "Succès",
        description: "Le fichier a été renommé",
      });
    } catch (error: any) {
      console.error("Error renaming file:", error.message);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de renommer le fichier",
      });
    }
  };

  const handleRenameCancel = () => {
    setEditingFileId("");
    setNewTitle("");
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("files").delete().eq("id", id);

      if (error) {
        throw error;
      }

      fetchFiles();
      toast({
        title: "Succès",
        description: "Le fichier a été supprimé",
      });
    } catch (error: any) {
      console.error("Error deleting file:", error.message);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer le fichier",
      });
    }
  };

  const handleDownload = async (fileId: string, filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("dcg_files")
        .download(filePath);

      if (error) {
        throw error;
      }

      // Créer un URL pour le fichier téléchargé
      const url = window.URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Succès",
        description: "Le téléchargement a commencé",
      });
    } catch (error: any) {
      console.error("Error downloading file:", error.message);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de télécharger le fichier",
      });
    }
  };

  if (!files.length) {
    return <EmptyFileList searchQuery="" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {files.map((file) => (
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
            onDownload={handleDownload}
            selectedCategory=""
          />
        ))}
      </div>
    </div>
  );
};

export default SubjectPage;