import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Save, Eye } from "lucide-react";
import { QuestionAccordion } from "./QuestionAccordion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CreateQuizFormProps {
  fileId?: string;
  onSuccess: () => void;
}

interface Question {
  question: string;
  options: string[];
  correct_answers: string[];
  explanation?: string;
}

export function CreateQuizForm({ fileId, onSuccess }: CreateQuizFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleAnswers, setShuffleAnswers] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([
    { question: "", options: ["", "", ""], correct_answers: [], explanation: "" }
  ]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent, isDraft: boolean = false) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le titre du quiz est requis",
      });
      return;
    }

    setIsLoading(true);
    console.log("Création du quiz...", { title, description, fileId, questions });

    try {
      const { data: quiz, error: quizError } = await supabase
        .from("quizzes")
        .insert({
          title,
          description,
          file_id: fileId || null,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          time_limit: timeLimit,
          shuffle_questions: shuffleQuestions,
          shuffle_answers: shuffleAnswers,
          is_draft: isDraft,
        })
        .select()
        .single();

      if (quizError) throw quizError;

      console.log("Quiz créé:", quiz);

      const { error: questionsError } = await supabase
        .from("quiz_questions")
        .insert(
          questions.map(q => ({
            quiz_id: quiz.id,
            question: q.question,
            options: q.options,
            correct_answers: q.correct_answers,
            explanation: q.explanation,
          }))
        );

      if (questionsError) throw questionsError;

      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      toast({
        title: "Succès",
        description: isDraft ? "Le brouillon a été enregistré" : "Le quiz a été créé avec succès",
      });
      onSuccess();
    } catch (error) {
      console.error("Error creating quiz:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de créer le quiz",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Titre du quiz</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Quiz sur le chapitre 1"
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description (optionnelle)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez brièvement le contenu du quiz..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="timeLimit">Limite de temps (minutes)</Label>
            <Input
              id="timeLimit"
              type="number"
              value={timeLimit || ""}
              onChange={(e) => setTimeLimit(e.target.value ? parseInt(e.target.value) : null)}
              placeholder="Optionnel"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="shuffleQuestions">Mélanger les questions</Label>
              <Switch
                id="shuffleQuestions"
                checked={shuffleQuestions}
                onCheckedChange={setShuffleQuestions}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="shuffleAnswers">Mélanger les réponses</Label>
              <Switch
                id="shuffleAnswers"
                checked={shuffleAnswers}
                onCheckedChange={setShuffleAnswers}
              />
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="h-[50vh] pr-4">
        <QuestionAccordion
          questions={questions}
          onQuestionsChange={setQuestions}
          onSaveQuestion={(index) => {
            toast({
              title: "Question enregistrée",
              description: `La question ${index + 1} a été enregistrée`,
            });
          }}
        />
      </ScrollArea>

      <div className="flex justify-between gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsPreviewOpen(true)}
          className="flex items-center gap-2"
        >
          <Eye className="h-4 w-4" />
          Aperçu du quiz
        </Button>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={(e) => handleSubmit(e, true)}
            disabled={isLoading}
          >
            Sauvegarder en brouillon
          </Button>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Création...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Publier le quiz
              </div>
            )}
          </Button>
        </div>
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">{title || "Sans titre"}</h2>
            {description && <p className="text-gray-600">{description}</p>}
            
            <div className="space-y-6">
              {questions.map((question, index) => (
                <div key={index} className="space-y-4 p-4 border rounded-lg">
                  <h3 className="font-medium">Question {index + 1}</h3>
                  <p>{question.question}</p>
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center gap-2">
                        <input type="radio" disabled />
                        <span>{option}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </form>
  );
}