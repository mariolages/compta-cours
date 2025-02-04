import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, BookOpen } from "lucide-react";
import type { File } from "@/types/files";

interface CreateQuizDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  files: File[];
}

export function CreateQuizDialog({ open, onOpenChange, files }: CreateQuizDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const currentFile = files[0];

  const generateQuestions = (text: string) => {
    // Diviser le texte en paragraphes significatifs
    const paragraphs = text
      .split(/\n\n+/)
      .filter(p => p.trim().length > 100)
      .map(p => p.trim());

    // Générer des questions variées pour chaque paragraphe
    const questions = paragraphs.slice(0, 5).map((paragraph, index) => {
      const questionTypes = [
        "Quelle est la principale idée présentée dans ce passage : ",
        "Que signifie le concept suivant : ",
        "Quel est le point clé abordé dans : ",
        "Comment peut-on expliquer : ",
        "Quelle est la définition de : "
      ];

      // Extraire une phrase clé du paragraphe
      const keyPhrase = paragraph.split('.')[0];
      const questionType = questionTypes[index % questionTypes.length];
      const question = `${questionType}"${keyPhrase.slice(0, 100)}..." ?`;

      // Générer des réponses plausibles
      const correctAnswer = paragraph.split('.')[1]?.trim() || "La réponse correcte basée sur le contenu";
      const incorrectAnswers = [
        "Une réponse incorrecte mais plausible",
        "Une autre interprétation possible mais inexacte",
        "Une réponse qui semble correcte mais ne l'est pas"
      ];

      return {
        question,
        correct_answer: correctAnswer,
        options: JSON.stringify([correctAnswer, ...incorrectAnswers])
      };
    });

    return questions;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFile) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Aucun fichier sélectionné",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Télécharger le contenu du fichier
      const { data: fileData, error: downloadError } = await supabase.storage
        .from("dcg_files")
        .download(currentFile.file_path);

      if (downloadError) throw downloadError;

      // Lire le contenu du fichier
      const text = await fileData.text();
      
      if (text.length < 200) {
        throw new Error("Le contenu du fichier est trop court pour générer un quiz");
      }

      // Créer le quiz
      const { data: quiz, error: quizError } = await supabase
        .from("quizzes")
        .insert({
          title,
          description,
          file_id: currentFile.id,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (quizError) throw quizError;

      // Générer et insérer les questions
      const questions = generateQuestions(text);
      const { error: questionsError } = await supabase
        .from("quiz_questions")
        .insert(
          questions.map(q => ({
            quiz_id: quiz.id,
            ...q
          }))
        );

      if (questionsError) throw questionsError;

      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      toast({
        title: "Succès",
        description: "Le quiz a été créé avec succès",
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating quiz:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de créer le quiz",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Créer un nouveau quiz</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-4">
            <Label htmlFor="title" className="text-base">Titre du quiz</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Quiz sur le chapitre 1"
              className="h-12"
              required
            />
          </div>

          <div className="space-y-4">
            <Label htmlFor="description" className="text-base">Description (optionnelle)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez brièvement le contenu du quiz..."
              className="min-h-[100px] resize-none"
            />
          </div>

          <div className="space-y-4">
            <Label className="text-base">Fichier source</Label>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <BookOpen className="h-5 w-5 text-primary" />
              <p className="text-gray-700">{currentFile?.title || "Aucun fichier sélectionné"}</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="min-w-[100px]"
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="min-w-[100px] bg-primary hover:bg-primary-hover"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Création...
                </div>
              ) : (
                "Créer le quiz"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}