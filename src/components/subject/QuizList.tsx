import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CreateQuizDialog } from "./CreateQuizDialog";
import type { File } from "@/types/files";

interface QuizListProps {
  files: File[];
}

export function QuizList({ files }: QuizListProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();

  const { data: quizzes, isLoading } = useQuery({
    queryKey: ["quizzes", files[0]?.subject_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quizzes")
        .select(`
          *,
          file:file_id(title)
        `)
        .eq("file_id", files[0]?.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les quiz",
        });
        throw error;
      }

      return data;
    },
    enabled: !!files.length,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Quiz disponibles</h2>
        <Button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Créer un quiz
        </Button>
      </div>

      <div className="grid gap-4">
        {quizzes?.map((quiz) => (
          <Card key={quiz.id} className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">{quiz.title}</h3>
                <p className="text-sm text-gray-500">
                  Basé sur : {quiz.file?.title}
                </p>
              </div>
              <Button variant="outline">Commencer</Button>
            </div>
          </Card>
        ))}

        {!quizzes?.length && (
          <Card className="p-8">
            <div className="text-center text-gray-500">
              <p>Aucun quiz n'a encore été créé pour ce cours.</p>
              <p>Cliquez sur "Créer un quiz" pour en ajouter un.</p>
            </div>
          </Card>
        )}
      </div>

      <CreateQuizDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        files={files}
      />
    </div>
  );
}