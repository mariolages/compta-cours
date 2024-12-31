import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, Plus, Save, Trash2 } from "lucide-react";
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

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      const newQuestions = questions.filter((_, i) => i !== index);
      onQuestionsChange(newQuestions);
    }
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
                    <div key={optionIndex} className="flex items-center gap-4">
                      <Input
                        value={option}
                        onChange={(e) => handleOptionChange(index, optionIndex, e.target.value)}
                        placeholder={`Option ${optionIndex + 1}`}
                      />
                      <Checkbox
                        checked={question.correct_answers.includes(option)}
                        onCheckedChange={() => toggleCorrectAnswer(index, option)}
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <Label>Explication (optionnelle)</Label>
                  <Textarea
                    value={question.explanation}
                    onChange={(e) => handleQuestionChange(index, "explanation", e.target.value)}
                    placeholder="Expliquez pourquoi ces réponses sont correctes..."
                  />
                </div>

                <div className="flex justify-between gap-2">
                  {questions.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeQuestion(index)}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Supprimer
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleSaveQuestion(index)}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Enregistrer
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Button
        type="button"
        variant="outline"
        onClick={addQuestion}
        className="w-full flex items-center gap-2 justify-center"
      >
        <Plus className="h-4 w-4" />
        Ajouter une question
      </Button>
    </div>
  );
}