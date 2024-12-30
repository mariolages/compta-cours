import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { BrainCircuit, Play, Plus } from "lucide-react";
import { QuizInterface } from "./QuizInterface";
import { CreateQuizDialog } from "./CreateQuizDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { File } from "@/types/files";

interface QuizListProps {
  files: File[];
}

export function QuizList({ files }: QuizListProps) {
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();

  const { data: quizzes, isLoading } = useQuery({
    queryKey: ["quizzes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quizzes")
        .select(`
          *,
          file:file_id(title)
        `)
        .order('created_at', { ascending: false });

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
  });

  const handleStartQuiz = (quizId: string) => {
    setSelectedQuizId(quizId);
    setIsQuizOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Quiz disponibles</h2>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Créer un quiz
        </Button>
      </div>

      <div className="grid gap-4">
        {quizzes && quizzes.length > 0 ? (
          quizzes.map((quiz) => (
            <Card key={quiz.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">{quiz.title}</h3>
                  {quiz.description && (
                    <p className="text-sm text-gray-500">{quiz.description}</p>
                  )}
                  {quiz.file && (
                    <p className="text-sm text-gray-500">
                      Basé sur : {quiz.file.title}
                    </p>
                  )}
                </div>
                <Button
                  onClick={() => handleStartQuiz(quiz.id)}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Commencer
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8 bg-gray-50/50 border-dashed border-2">
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <BrainCircuit className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-600">
                Aucun quiz n'a encore été créé
              </p>
              <p className="text-gray-500">
                Cliquez sur "Créer un quiz" pour commencer
              </p>
            </div>
          </Card>
        )}
      </div>

      <Dialog open={isQuizOpen} onOpenChange={setIsQuizOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedQuizId && (
            <QuizInterface
              quizId={selectedQuizId}
              onClose={() => setIsQuizOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <CreateQuizDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        files={files}
      />
    </div>
  );
}