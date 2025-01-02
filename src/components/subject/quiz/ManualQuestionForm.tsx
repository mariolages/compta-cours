import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Save } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Question } from "@/types/quiz";
import { useToast } from "@/components/ui/use-toast";

interface ManualQuestionFormProps {
  questions: Question[];
  onQuestionsChange: (questions: Question[]) => void;
  onSaveQuestion?: (index: number) => void;
}

export function ManualQuestionForm({ questions, onQuestionsChange, onSaveQuestion }: ManualQuestionFormProps) {
  const { toast } = useToast();

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

  const addOption = (questionIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.push("");
    onQuestionsChange(newQuestions);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.splice(optionIndex, 1);
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

  const handleSaveQuestion = (index: number) => {
    const question = questions[index];
    if (!question.question.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "La question ne peut pas être vide",
      });
      return;
    }

    if (question.options.some(o => !o.trim())) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Toutes les options doivent être remplies",
      });
      return;
    }

    if (question.correct_answers.length === 0) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Vous devez sélectionner au moins une bonne réponse",
      });
      return;
    }

    onSaveQuestion?.(index);
  };

  return (
    <ScrollArea className="h-[600px] pr-4">
      <div className="space-y-8">
        {questions.map((question, questionIndex) => (
          <div 
            key={questionIndex} 
            className="space-y-4 p-6 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Question {questionIndex + 1}</h3>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSaveQuestion(questionIndex)}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <Save className="h-4 w-4 mr-1" />
                  Sauvegarder
                </Button>
                {questions.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQuestion(questionIndex)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`question-${questionIndex}`}>Question</Label>
              <Input
                id={`question-${questionIndex}`}
                value={question.question}
                onChange={(e) => updateQuestion(questionIndex, "question", e.target.value)}
                placeholder="Saisissez votre question..."
                className="bg-white"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Options de réponse</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addOption(questionIndex)}
                  className="text-primary hover:text-primary-dark"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter une option
                </Button>
              </div>
              
              {question.options.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-start gap-4">
                  <div className="flex-1">
                    <Input
                      value={option}
                      onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                      placeholder={`Option ${optionIndex + 1}`}
                      className="bg-white"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Checkbox
                      checked={question.correct_answers.includes(option)}
                      onCheckedChange={() => toggleCorrectAnswer(questionIndex, option)}
                      className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                    />
                    <Label className="text-sm text-gray-500">Bonne réponse</Label>
                    {question.options.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(questionIndex, optionIndex)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 p-0 h-6 w-6"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`explanation-${questionIndex}`}>Explication (optionnelle)</Label>
              <Textarea
                id={`explanation-${questionIndex}`}
                value={question.explanation}
                onChange={(e) => updateQuestion(questionIndex, "explanation", e.target.value)}
                placeholder="Expliquez pourquoi ces réponses sont correctes..."
                className="bg-white min-h-[100px]"
              />
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addQuestion}
          className="w-full bg-white hover:bg-gray-50"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une question
        </Button>
      </div>
    </ScrollArea>
  );
}