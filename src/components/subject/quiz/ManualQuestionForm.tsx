import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import type { Question } from "@/types/quiz";

interface ManualQuestionFormProps {
  questions: Question[];
  onQuestionsChange: (questions: Question[]) => void;
}

export function ManualQuestionForm({ questions, onQuestionsChange }: ManualQuestionFormProps) {
  const addQuestion = () => {
    onQuestionsChange([
      ...questions,
      { question: "", options: ["", "", ""], correct_answers: [], explanation: "" }
    ]);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    onQuestionsChange(newQuestions);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    onQuestionsChange(newQuestions);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    onQuestionsChange(newQuestions);
  };

  const toggleCorrectAnswer = (questionIndex: number, option: string) => {
    const newQuestions = [...questions];
    const currentAnswers = newQuestions[questionIndex].correct_answers;
    
    if (currentAnswers.includes(option)) {
      newQuestions[questionIndex].correct_answers = currentAnswers.filter(a => a !== option);
    } else {
      newQuestions[questionIndex].correct_answers = [...currentAnswers, option];
    }
    
    onQuestionsChange(newQuestions);
  };

  return (
    <div className="space-y-8">
      {questions.map((question, questionIndex) => (
        <div key={questionIndex} className="space-y-4 p-4 border rounded-lg bg-gray-50/50 hover:bg-white transition-colors">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Question {questionIndex + 1}</h3>
            {questions.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeQuestion(questionIndex)}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label>Question</Label>
            <Input
              value={question.question}
              onChange={(e) => updateQuestion(questionIndex, "question", e.target.value)}
              placeholder="Saisissez votre question..."
              className="bg-white"
            />
          </div>

          <div className="space-y-4">
            <Label>Options de réponse</Label>
            {question.options.map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center gap-4">
                <Input
                  value={option}
                  onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                  placeholder={`Option ${optionIndex + 1}`}
                  className="bg-white"
                />
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={question.correct_answers.includes(option)}
                    onCheckedChange={() => toggleCorrectAnswer(questionIndex, option)}
                    className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                  />
                  <Label className="text-sm text-gray-500">Bonne réponse</Label>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Explication (optionnelle)</Label>
            <Textarea
              value={question.explanation}
              onChange={(e) => updateQuestion(questionIndex, "explanation", e.target.value)}
              placeholder="Expliquez pourquoi ces réponses sont correctes..."
              className="bg-white"
            />
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        className="w-full bg-white hover:bg-gray-50"
        onClick={addQuestion}
      >
        <Plus className="h-4 w-4 mr-2" />
        Ajouter une question
      </Button>
    </div>
  );
}