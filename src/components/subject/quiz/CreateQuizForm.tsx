import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { QuestionAccordion } from "./QuestionAccordion";
import { QuizSettings } from "./QuizSettings";
import { QuizFormActions } from "./QuizFormActions";

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

  const validateQuestions = (questions: Question[]) => {
    const invalidQuestions = questions.filter(q => 
      !q.question.trim() || 
      q.options.some(o => !o.trim()) ||
      q.correct_answers.length === 0
    );

    if (invalidQuestions.length > 0) {
      toast({
        variant: "destructive",
        title: "Erreur de validation",
        description: "Toutes les questions doivent avoir un énoncé, des options et au moins une bonne réponse",
      });
      return false;
    }
    return true;
  };

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

    if (!validateQuestions(questions)) {
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

      if (quizError) {
        console.error("Erreur lors de la création du quiz:", quizError);
        throw quizError;
      }

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

      if (questionsError) {
        console.error("Erreur lors de la création des questions:", questionsError);
        throw questionsError;
      }

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
      <QuizSettings
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        timeLimit={timeLimit}
        setTimeLimit={setTimeLimit}
        shuffleQuestions={shuffleQuestions}
        setShuffleQuestions={setShuffleQuestions}
        shuffleAnswers={shuffleAnswers}
        setShuffleAnswers={setShuffleAnswers}
      />

      <div className="border rounded-lg p-4 bg-white">
        <ScrollArea className="h-[400px] pr-4">
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
      </div>

      <QuizFormActions
        isLoading={isLoading}
        onPreview={() => {}}
        onSaveAsDraft={(e) => handleSubmit(e, true)}
        onPublish={(e) => handleSubmit(e, false)}
      />
    </form>
  );
}