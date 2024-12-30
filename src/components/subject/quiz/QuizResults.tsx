import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Trophy } from "lucide-react";

interface QuizResultsProps {
  score: number;
  totalQuestions: number;
  answers: {
    question: string;
    selectedAnswer: string;
    correctAnswer: string;
    explanation?: string;
    isCorrect: boolean;
  }[];
  onRetry: () => void;
  onExit: () => void;
}

export function QuizResults({
  score,
  totalQuestions,
  answers,
  onRetry,
  onExit,
}: QuizResultsProps) {
  const percentage = Math.round((score / totalQuestions) * 100);
  
  const getMessage = () => {
    if (percentage >= 80) return "Excellent travail !";
    if (percentage >= 60) return "Bon travail !";
    return "Continuez vos efforts !";
  };

  return (
    <div className="space-y-8">
      <Card className="p-8 text-center">
        <div className="flex justify-center mb-4">
          <Trophy className="h-16 w-16 text-yellow-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">{getMessage()}</h2>
        <p className="text-4xl font-bold text-primary mb-2">
          {score}/{totalQuestions}
        </p>
        <p className="text-gray-600">{percentage}% de réponses correctes</p>
      </Card>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Détail des réponses</h3>
        {answers.map((answer, index) => (
          <Card key={index} className="p-4">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-medium">Question {index + 1}</h4>
                  <p className="text-gray-600">{answer.question}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm ${
                  answer.isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}>
                  {answer.isCorrect ? "Correct" : "Incorrect"}
                </div>
              </div>
              
              <div className="pl-4 border-l-2 space-y-1">
                <p>
                  <span className="text-gray-600">Votre réponse : </span>
                  <span className={answer.isCorrect ? "text-green-600" : "text-red-600"}>
                    {answer.selectedAnswer}
                  </span>
                </p>
                {!answer.isCorrect && (
                  <p>
                    <span className="text-gray-600">Bonne réponse : </span>
                    <span className="text-green-600">{answer.correctAnswer}</span>
                  </p>
                )}
                {answer.explanation && (
                  <p className="text-sm text-gray-600 mt-2">{answer.explanation}</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onExit}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à l'accueil
        </Button>
        <Button onClick={onRetry}>Rejouer le quiz</Button>
      </div>
    </div>
  );
}