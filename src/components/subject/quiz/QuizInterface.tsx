import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface QuizInterfaceProps {
  quizId: string;
  onClose: () => void;
}

export function QuizInterface({ quizId, onClose }: QuizInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();

  const { data: quiz } = useQuery({
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

  if (!quiz) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const questions = quiz.quiz_questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    if (answer === currentQuestion.correct_answer) {
      setScore(score + 1);
      toast({
        title: "Bonne réponse !",
        description: "Continuez comme ça !",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Mauvaise réponse",
        description: `La bonne réponse était : ${currentQuestion.correct_answer}`,
      });
    }

    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
      }, 1500);
    } else {
      setIsComplete(true);
    }
  };

  if (isComplete) {
    return (
      <Card className="p-6 space-y-4">
        <h2 className="text-2xl font-bold text-center">Quiz terminé !</h2>
        <p className="text-center text-lg">
          Votre score : {score} / {questions.length}
        </p>
        <div className="flex justify-center">
          <Button onClick={onClose}>Fermer</Button>
        </div>
      </Card>
    );
  }

  // Ensure options is properly parsed from JSON if it's a string
  const options = Array.isArray(currentQuestion.options) 
    ? currentQuestion.options 
    : typeof currentQuestion.options === 'string' 
      ? JSON.parse(currentQuestion.options)
      : currentQuestion.options;

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            Question {currentQuestionIndex + 1} / {questions.length}
          </h2>
          <Button variant="outline" onClick={onClose}>
            Quitter
          </Button>
        </div>
        <p className="text-lg">{currentQuestion.question}</p>
      </div>

      <div className="grid gap-3">
        {options.map((option: string, index: number) => (
          <Button
            key={index}
            variant={selectedAnswer === option ? "default" : "outline"}
            className="w-full text-left justify-start p-4 h-auto"
            onClick={() => !selectedAnswer && handleAnswer(option)}
            disabled={!!selectedAnswer}
          >
            {option}
          </Button>
        ))}
      </div>
    </Card>
  );
}