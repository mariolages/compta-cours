import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowRight, CheckCircle2, XCircle } from "lucide-react";

interface QuizInterfaceProps {
  quizId: string;
  onClose: () => void;
}

export function QuizInterface({ quizId, onClose }: QuizInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const { toast } = useToast();

  const { data: quiz, isLoading } = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: async () => {
      const { data: quizData, error: quizError } = await supabase
        .from("quizzes")
        .select(`
          *,
          quiz_questions (
            id,
            question,
            correct_answer,
            options
          )
        `)
        .eq("id", quizId)
        .single();

      if (quizError) throw quizError;
      return quizData;
    },
  });

  if (isLoading || !quiz) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const questions = quiz.quiz_questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswer = () => {
    if (!selectedAnswer) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez sélectionner une réponse",
      });
      return;
    }

    const isAnswerCorrect = selectedAnswer === currentQuestion.correct_answer;
    setIsCorrect(isAnswerCorrect);
    setShowFeedback(true);

    if (isAnswerCorrect) {
      setScore(score + 1);
    }

    setTimeout(() => {
      setShowFeedback(false);
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
      } else {
        setIsComplete(true);
      }
    }, 1500);
  };

  if (isComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <Card className="p-6 space-y-6">
        <h2 className="text-2xl font-bold text-center">Quiz terminé !</h2>
        <div className="space-y-4">
          <p className="text-center text-lg">
            Votre score : {score} / {questions.length} ({percentage}%)
          </p>
          <Progress value={percentage} className="h-3" />
        </div>
        <div className="flex justify-center">
          <Button onClick={onClose}>Fermer</Button>
        </div>
      </Card>
    );
  }

  const options = Array.isArray(currentQuestion.options)
    ? currentQuestion.options
    : typeof currentQuestion.options === "string"
    ? JSON.parse(currentQuestion.options)
    : currentQuestion.options;

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            Question {currentQuestionIndex + 1} / {questions.length}
          </h2>
          <Progress value={progress} className="w-32 h-2" />
        </div>
        <p className="text-lg">{currentQuestion.question}</p>
      </div>

      <RadioGroup
        value={selectedAnswer || ""}
        onValueChange={setSelectedAnswer}
        className="space-y-3"
      >
        {options.map((option: string, index: number) => (
          <div
            key={index}
            className={`flex items-center space-x-2 p-4 rounded-lg border ${
              showFeedback
                ? option === currentQuestion.correct_answer
                  ? "border-green-500 bg-green-50"
                  : option === selectedAnswer
                  ? "border-red-500 bg-red-50"
                  : "border-gray-200"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <RadioGroupItem value={option} id={`option-${index}`} />
            <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
              {option}
            </Label>
            {showFeedback && option === currentQuestion.correct_answer && (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            )}
            {showFeedback &&
              option === selectedAnswer &&
              option !== currentQuestion.correct_answer && (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
          </div>
        ))}
      </RadioGroup>

      <div className="flex justify-end pt-4">
        <Button
          onClick={handleAnswer}
          disabled={!selectedAnswer || showFeedback}
          className="flex items-center gap-2"
        >
          {showFeedback ? (
            isCorrect ? (
              "Bonne réponse !"
            ) : (
              "Mauvaise réponse"
            )
          ) : (
            <>
              Valider
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}