import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Plus, Save } from "lucide-react";
import { useState } from "react";

interface Question {
  question: string;
  options: string[];
  correct_answers: string[];
  explanation?: string;
}

interface QuestionAccordionProps {
  questions: Question[];
  onQuestionsChange: (questions: Question[]) => void;
  onSaveQuestion: (index: number) => void;
}

export function QuestionAccordion({ questions, onQuestionsChange, onSaveQuestion }: QuestionAccordionProps) {
  const [savedQuestions, setSavedQuestions] = useState<number[]>([]);

  const handleQuestionChange = (index: number, field: keyof Question, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    onQuestionsChange(newQuestions);
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    onQuestionsChange(newQuestions);
  };

  const handleSaveQuestion = (index: number) => {
    onSaveQuestion(index);
    setSavedQuestions([...savedQuestions, index]);
    setTimeout(() => {
      setSavedQuestions(savedQuestions.filter(i => i !== index));
    }, 2000);
  };

  const addQuestion = () => {
    onQuestionsChange([
      ...questions,
      { question: "", options: ["", "", ""], correct_answers: [], explanation: "" }
    ]);
  };

  return (
    <div className="space-y-4">
      <Accordion type="single" collapsible className="w-full space-y-4">
        {questions.map((question, index) => (
          <AccordionItem key={index} value={`question-${index}`} className="border rounded-lg p-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-4">
                <span className="text-lg font-medium">
                  Question {index + 1}
                </span>
                {savedQuestions.includes(index) && (
                  <span className="flex items-center gap-2 text-green-600 text-sm">
                    <Check className="h-4 w-4" />
                    Question enregistrée
                  </span>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Question</Label>
                  <Input
                    value={question.question}
                    onChange={(e) => handleQuestionChange(index, "question", e.target.value)}
                    placeholder="Saisissez votre question..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Options de réponse</Label>
                  {question.options.map((option, optionIndex) => (
                    <Input
                      key={optionIndex}
                      value={option}
                      onChange={(e) => handleOptionChange(index, optionIndex, e.target.value)}
                      placeholder={`Option ${optionIndex + 1}`}
                    />
                  ))}
                </div>

                <Button
                  onClick={() => handleSaveQuestion(index)}
                  className="w-full flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Enregistrer la question
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Button
        onClick={addQuestion}
        variant="outline"
        className="w-full flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Ajouter une question
      </Button>
    </div>
  );
}