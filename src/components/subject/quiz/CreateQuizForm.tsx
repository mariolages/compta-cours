import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import { FileImportForm } from "./FileImportForm";
import { ManualQuestionForm } from "./ManualQuestionForm";

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
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le titre du quiz est requis",
      });
      return;
    }

    if (questions.some(q => !q.question.trim() || q.options.some(o => !o.trim()) || q.correct_answers.length === 0)) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Toutes les questions doivent être complètes avec leurs options et au moins une réponse correcte",
      });
      return;
    }

    setIsLoading(true);

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
        })
        .select()
        .single();

      if (quizError) throw quizError;

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
        description: "Le quiz a été créé avec succès",
      });
      onSuccess();
    } catch (error) {
      console.error("Error creating quiz:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer le quiz",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="timeLimit">Limite de temps (minutes)</Label>
            <Input
              id="timeLimit"
              type="number"
              value={timeLimit || ""}
              onChange={(e) => setTimeLimit(e.target.value ? parseInt(e.target.value) : null)}
              placeholder="Optionnel"
              className="w-32"
            />
          </div>

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

      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Saisie manuelle</TabsTrigger>
          <TabsTrigger value="import">Importer un fichier</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="mt-4">
          <ManualQuestionForm
            questions={questions}
            onQuestionsChange={setQuestions}
          />
        </TabsContent>

        <TabsContent value="import" className="mt-4">
          <FileImportForm onQuestionsImported={setQuestions} />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Création...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Créer le quiz
            </div>
          )}
        </Button>
      </div>
    </form>
  );
}