import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, BookOpen, ArrowRight, Clock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CreateQuizDialog } from "./CreateQuizDialog";
import { QuizInterface } from "./quiz/QuizInterface";
import type { File } from "@/types/files";

interface QuizListProps {
  files: File[];
}

export function QuizList({ files }: QuizListProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const { toast } = useToast();
  const currentFile = files?.[0];

  const { data: quizzes, isLoading } = useQuery({
    queryKey: ["quizzes", currentFile?.id],
    queryFn: async () => {
      if (!currentFile?.id) {
        return [];
      }

      const { data, error } = await supabase
        .from("quizzes")
        .select(`
          *,
          quiz_questions (count),
          file:file_id(title)
        `)
        .eq("file_id", currentFile.id);

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
    enabled: !!currentFile?.id,
  });

  if (selectedQuizId) {
    return (
      <QuizInterface
        quizId={selectedQuizId}
        onClose={() => setSelectedQuizId(null)}
      />
    );
  }

  return (
    <div className="space-y-8 mt-12">
      <div className="flex justify-between items-center max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-900">Quiz disponibles</h2>
        {files && files.length > 0 && (
          <Button 
            onClick={() => setIsCreateOpen(true)} 
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 transition-all duration-300"
          >
            <Plus className="h-4 w-4" />
            Créer un quiz
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : !files || files.length === 0 ? (
        <Card className="p-8 bg-gray-50/50 border-dashed border-2 mx-auto max-w-2xl">
          <div className="text-center space-y-3">
            <p className="text-lg font-medium text-gray-600">
              Aucun fichier n'est disponible pour créer un quiz.
            </p>
            <p className="text-gray-500">
              Veuillez d'abord ajouter un fichier dans cette catégorie.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 max-w-4xl mx-auto">
          {quizzes?.map((quiz) => (
            <Card 
              key={quiz.id} 
              className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary animate-fade-in bg-white"
            >
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-900">{quiz.title}</h3>
                  <div className="flex items-center gap-4 text-gray-500">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <p className="text-sm">
                        {quiz.quiz_questions?.[0]?.count || 0} questions
                      </p>
                    </div>
                    {quiz.time_limit && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <p className="text-sm">{quiz.time_limit} minutes</p>
                      </div>
                    )}
                  </div>
                  {quiz.description && (
                    <p className="text-sm text-gray-600 mt-2">{quiz.description}</p>
                  )}
                </div>
                <Button 
                  variant="outline"
                  onClick={() => setSelectedQuizId(quiz.id)}
                  className="flex items-center gap-2 hover:bg-primary hover:text-white transition-all duration-300"
                >
                  <span>Commencer</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}

          {quizzes?.length === 0 && (
            <Card className="p-8 bg-gray-50/50 border-dashed border-2">
              <div className="text-center space-y-3">
                <p className="text-lg font-medium text-gray-600">
                  Aucun quiz n'a encore été créé pour ce cours.
                </p>
                <p className="text-gray-500">
                  Cliquez sur "Créer un quiz" pour en ajouter un.
                </p>
              </div>
            </Card>
          )}
        </div>
      )}

      <CreateQuizDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        files={files}
      />
    </div>
  );
}