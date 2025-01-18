import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  difficulty: number;
}

interface FlashcardSectionProps {
  flashcards: Flashcard[];
  onAddFlashcard?: () => void;
}

export const FlashcardSection = ({ flashcards, onAddFlashcard }: FlashcardSectionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleNext = () => {
    setShowAnswer(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrevious = () => {
    setShowAnswer(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  if (!flashcards.length) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Flashcards</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <p className="text-muted-foreground mb-4">Pas encore de flashcards</p>
          <Button onClick={onAddFlashcard}>
            <Plus className="mr-2 h-4 w-4" />
            Créer une flashcard
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Flashcards</CardTitle>
          <Button variant="outline" size="sm" onClick={onAddFlashcard}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative min-h-[200px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex + (showAnswer ? '-answer' : '-question')}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
            >
              <div className="text-lg font-medium mb-4">
                {showAnswer ? flashcards[currentIndex].answer : flashcards[currentIndex].question}
              </div>
              <Button
                variant="ghost"
                onClick={() => setShowAnswer(!showAnswer)}
                className="mb-4"
              >
                {showAnswer ? 'Voir la question' : 'Voir la réponse'}
              </Button>
              <div className="flex justify-between w-full mt-4">
                <Button variant="outline" onClick={handlePrevious}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {currentIndex + 1} / {flashcards.length}
                </span>
                <Button variant="outline" onClick={handleNext}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
};