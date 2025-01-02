import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ManualQuestionForm } from "./ManualQuestionForm";
import type { Question } from "@/types/quiz";

interface QuestionAccordionProps {
  questions: Question[];
  onQuestionsChange: (questions: Question[]) => void;
  onSaveQuestion: (index: number) => void;
}

export function QuestionAccordion({ questions, onQuestionsChange, onSaveQuestion }: QuestionAccordionProps) {
  return (
    <Accordion type="single" collapsible className="w-full space-y-4">
      <AccordionItem value="manual" className="border-none">
        <AccordionTrigger className="py-6 px-4 bg-white rounded-lg hover:bg-gray-50 transition-colors">
          Création manuelle des questions
        </AccordionTrigger>
        <AccordionContent className="pt-4">
          <ManualQuestionForm
            questions={questions}
            onQuestionsChange={onQuestionsChange}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}