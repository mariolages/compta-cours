import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { QuizResults } from "./QuizResults";

interface QuizInterfaceProps {
  quizId: string;
  onClose: () => void;
}

export function QuizInterface({ quizId, onClose }: QuizInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();

  const { data: quiz, isLoading: isQuizLoading } = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quizzes")
        .select(`
          *,
          quiz_questions (
            id,
            question,
            options,
            correct_answer,
            explanation
          )
        `)
        .eq("id", quizId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (quiz?.time_limit && !timeLeft) {
      setTimeLeft(quiz.time_limit * 60);
    }
  }, [quiz]);

  useEffect(() => {
    if (timeLeft === null) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(timer);
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  if (isQuizLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-600">Quiz introuvable</p>
        <Button onClick={onClose} className="mt-4">Retour</Button>
      </Card>
    );
  }

  const questions = quiz.quiz_questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleNext = () => {
    if (!selectedAnswers[currentQuestion.id]) {
      toast({
        title: "Attention",
        description: "Veuillez sélectionner une réponse avant de continuer",
      });
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    const score = questions.reduce((acc, question) => {
      return acc + (selectedAnswers[question.id] === question.correct_answer ? 1 : 0);
    }, 0);

    try {
      const { data: attempt, error: attemptError } = await supabase
        .from("quiz_attempts")
        .insert({
          quiz_id: quizId,
          score,
          total_questions: questions.length,
          time_taken: quiz.time_limit ? quiz.time_limit * 60 - (timeLeft || 0) : null,
        })
        .select()
        .single();

      if (attemptError) throw attemptError;

      const answers = questions.map((question) => ({
        attempt_id: attempt.id,
        question_id: question.id,
        selected_answers: [selectedAnswers[question.id]],
        is_correct: selectedAnswers[question.id] === question.correct_answer,
      }));

      const { error: answersError } = await supabase
        .from("quiz_answers")
        .insert(answers);

      if (answersError) throw answersError;

      setIsComplete(true);
    } catch (error) {
      console.error("Error saving quiz attempt:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'enregistrer vos réponses",
      });
    }
  };

  if (isComplete) {
    return (
      <QuizResults
        score={questions.reduce((acc, question) => {
          return acc + (selectedAnswers[question.id] === question.correct_answer ? 1 : 0);
        }, 0)}
        totalQuestions={questions.length}
        answers={questions.map((question) => ({
          question: question.question,
          selectedAnswer: selectedAnswers[question.id],
          correctAnswer: question.correct_answer,
          explanation: question.explanation,
          isCorrect: selectedAnswers[question.id] === question.correct_answer,
        }))}
        onRetry={() => {
          setCurrentQuestionIndex(0);
          setSelectedAnswers({});
          setTimeLeft(quiz.time_limit ? quiz.time_limit * 60 : null);
          setIsComplete(false);
        }}
        onExit={onClose}
      />
    );
  }

  const options = Array.isArray(currentQuestion.options)
    ? currentQuestion.options
    : typeof currentQuestion.options === "string"
    ? JSON.parse(currentQuestion.options)
    : [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onClose}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Quitter
        </Button>
        {timeLeft !== null && (
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="h-4 w-4" />
            {formatTime(timeLeft)}
          </div>
        )}
      </div>

      <Card className="p-8 max-w-3xl mx-auto">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                Question {currentQuestionIndex + 1} sur {questions.length}
              </h2>
              <Progress value={progress} className="w-32 h-2" />
            </div>
            <p className="text-lg">{currentQuestion.question}</p>
          </div>

          <RadioGroup
            value={selectedAnswers[currentQuestion.id] || ""}
            onValueChange={(value) =>
              setSelectedAnswers((prev) => ({
                ...prev,
                [currentQuestion.id]: value,
              }))
            }
            className="space-y-3"
          >
            {options.map((option: string, index: number) => (
              <div
                key={index}
                className="flex items-center space-x-2 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleNext}
              className="flex items-center gap-2"
              disabled={!selectedAnswers[currentQuestion.id]}
            >
              {currentQuestionIndex < questions.length - 1 ? (
                <>
                  Suivant
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                "Terminer"
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}