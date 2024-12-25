import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUploadDialog } from "@/components/dashboard/FileUploadDialog";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Download, Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Subject {
  id: number;
  code: string;
  name: string;
}

interface File {
  id: string;
  title: string;
  category: {
    name: string;
  };
  created_at: string;
}

export default function SubjectPage() {
  const { subjectId } = useParams();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const { toast } = useToast();

  const { data: subject } = useQuery({
    queryKey: ["subject", subjectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .eq("id", subjectId)
        .single();

      if (error) throw error;
      return data as Subject;
    },
  });

  const { data: files, refetch: refetchFiles } = useQuery({
    queryKey: ["subject-files", subjectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("files")
        .select(`
          id,
          title,
          created_at,
          category:category_id(name)
        `)
        .eq("subject_id", subjectId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as File[];
    },
  });

  const handleDownload = async (fileId: string) => {
    const { data, error } = await supabase
      .from("files")
      .select("file_path")
      .eq("id", fileId)
      .single();

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de télécharger le fichier",
      });
      return;
    }

    const { data: fileData, error: downloadError } = await supabase.storage
      .from("dcg_files")
      .download(data.file_path);

    if (downloadError) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de télécharger le fichier",
      });
      return;
    }

    const url = URL.createObjectURL(fileData);
    const a = document.createElement("a");
    a.href = url;
    a.download = data.file_path.split("/").pop() || "download";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {subject?.code} - {subject?.name}
            </h1>
            <Button
              onClick={() => setIsUploadOpen(true)}
              className="bg-primary hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <Upload className="mr-2 h-4 w-4" />
              Déposer un fichier
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {files?.map((file) => (
            <Card
              key={file.id}
              className="hover:shadow-md transition-all duration-300 border-l-4 border-l-primary"
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <h3 className="font-medium text-lg mb-1">{file.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {file.category.name} |{" "}
                    {new Date(file.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="ml-4 hover:bg-primary/10"
                  onClick={() => handleDownload(file.id)}
                >
                  <Download className="h-4 w-4" />
                  <span className="ml-2">Télécharger</span>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <FileUploadDialog
          open={isUploadOpen}
          onOpenChange={setIsUploadOpen}
          onSuccess={() => {
            refetchFiles();
            setIsUploadOpen(false);
          }}
          defaultSubjectId={subjectId}
        />
      </div>
    </div>
  );
}