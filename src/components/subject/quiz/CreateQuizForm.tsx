import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Save, X } from "lucide-react";

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface CreateQuizFormProps {
  fileId: string;
  onSuccess: () => void;
}

export function CreateQuizForm({ fileId, onSuccess }: CreateQuizFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    { question: "", options: ["", "", ""], correctAnswer: "" },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleQuestionChange = (index: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index].question = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const handleCorrectAnswerChange = (questionIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].correctAnswer = value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    if (questions.length < 10) {
      setQuestions([
        ...questions,
        { question: "", options: ["", "", ""], correctAnswer: "" },
      ]);
    }
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      const newQuestions = questions.filter((_, i) => i !== index);
      setQuestions(newQuestions);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le titre du quiz est requis",
      });
      return;
    }

    const invalidQuestions = questions.some(
      (q) =>
        !q.question.trim() ||
        q.options.some((o) => !o.trim()) ||
        !q.correctAnswer
    );

    if (invalidQuestions) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Toutes les questions doivent être complètes avec leurs options et une réponse correcte",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create quiz
      const { data: quiz, error: quizError } = await supabase
        .from("quizzes")
        .insert({
          title,
          description,
          file_id: fileId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (quizError) throw quizError;

      // Create questions
      const { error: questionsError } = await supabase
        .from("quiz_questions")
        .insert(
          questions.map((q) => ({
            quiz_id: quiz.id,
            question: q.question,
            options: JSON.stringify(q.options),
            correct_answer: q.correctAnswer,
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
            className="mt-1"
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
            className="mt-1"
          />
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((question, questionIndex) => (
          <Card key={questionIndex} className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">
                Question {questionIndex + 1}
              </h3>
              {questions.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeQuestion(questionIndex)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div>
              <Label>Question</Label>
              <Input
                value={question.question}
                onChange={(e) =>
                  handleQuestionChange(questionIndex, e.target.value)
                }
                placeholder="Saisissez votre question..."
                className="mt-1"
                required
              />
            </div>

            <div className="space-y-4">
              <Label>Options de réponse</Label>
              {question.options.map((option, optionIndex) => (
                <Input
                  key={optionIndex}
                  value={option}
                  onChange={(e) =>
                    handleOptionChange(
                      questionIndex,
                      optionIndex,
                      e.target.value
                    )
                  }
                  placeholder={`Option ${optionIndex + 1}`}
                  required
                />
              ))}
            </div>

            <div>
              <Label>Réponse correcte</Label>
              <RadioGroup
                value={question.correctAnswer}
                onValueChange={(value) =>
                  handleCorrectAnswerChange(questionIndex, value)
                }
                className="mt-2"
              >
                {question.options.map((option, optionIndex) => (
                  <div
                    key={optionIndex}
                    className="flex items-center space-x-2"
                  >
                    <RadioGroupItem
                      value={option}
                      id={`q${questionIndex}-o${optionIndex}`}
                    />
                    <Label htmlFor={`q${questionIndex}-o${optionIndex}`}>
                      {option || `Option ${optionIndex + 1}`}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </Card>
        ))}

        {questions.length < 10 && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={addQuestion}
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une question
          </Button>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4">
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