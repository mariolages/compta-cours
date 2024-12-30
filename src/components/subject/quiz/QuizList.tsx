import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { BrainCircuit, Play, Plus } from "lucide-react";
import { QuizInterface } from "./QuizInterface";
import { CreateQuizDialog } from "./CreateQuizDialog";
import type { File } from "@/types/files";

interface QuizListProps {
  files: File[];
}

export function QuizList({ files }: QuizListProps) {
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleStartQuiz = (quizId: string) => {
    setSelectedQuizId(quizId);
    setIsQuizOpen(true);
  };

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
        {files.map((file) => (
          <Card key={file.id} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">{file.title}</h3>
                <p className="text-sm text-gray-500">
                  Quiz basé sur ce document
                </p>
              </div>
              <Button
                onClick={() => handleStartQuiz(file.id)}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Commencer
              </Button>
            </div>
          </Card>
        ))}

        {files.length === 0 && (
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