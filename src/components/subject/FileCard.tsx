import { useState } from "react";
import { Card } from "@/components/ui/card";
import { AudioPlayer } from "./AudioPlayer";
import { hasAccessToContent } from "@/utils/access";
import type { File } from "@/types/files";
import { FileCardActions } from "./file-card/FileCardActions";
import { FileCardMenu } from "./file-card/FileCardMenu";
import { FileCardTitle } from "./file-card/FileCardTitle";
import { Button } from "@/components/ui/button";
import { BrainCircuit, FileText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface FileCardProps {
  file: File;
  editingFileId: string | null;
  newTitle: string;
  onRenameClick: (fileId: string, currentTitle: string) => void;
  onRenameSubmit: (fileId: string) => void;
  onRenameCancel: () => void;
  onNewTitleChange: (value: string) => void;
  onDelete: (fileId: string) => void;
  onDownload: (fileId: string, filePath: string, fileName: string) => void;
  hasSubscription?: boolean;
  classCode?: string;
  selectedCategory: string;
}

export function FileCard({
  file,
  editingFileId,
  newTitle,
  onRenameClick,
  onRenameSubmit,
  onRenameCancel,
  onNewTitleChange,
  onDelete,
  onDownload,
  hasSubscription = false,
  classCode,
  selectedCategory,
}: FileCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const isEditing = editingFileId === file.id;
  const isPodcast = file.category?.id === 6;
  const hasAccess = hasAccessToContent(hasSubscription, classCode, selectedCategory, file.title);
  const isTestFile = file.title.toLowerCase().includes("test");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getFileUrl = () => {
    return `https://sxpddyeasmcsnrbtvrgm.supabase.co/storage/v1/object/public/dcg_files/${file.file_path}`;
  };

  const handleGenerateQuiz = async () => {
    setIsGenerating(true);
    try {
      // Télécharger le contenu du fichier
      const { data: fileData, error: downloadError } = await supabase.storage
        .from("dcg_files")
        .download(file.file_path);

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
          title: `Quiz - ${file.title}`,
          description: "Quiz généré automatiquement",
          file_id: file.id,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (quizError) throw quizError;

      // Appeler l'Edge Function pour générer les questions
      const { data: generatedQuestions, error: generationError } = await supabase.functions
        .invoke('generate-with-ai', {
          body: { prompt: `Génère 5 questions de quiz basées sur ce texte: ${text}`, fileContent: text },
        });

      if (generationError) throw generationError;

      // Insérer les questions générées
      const { error: questionsError } = await supabase
        .from("quiz_questions")
        .insert(
          generatedQuestions.map((q: any) => ({
            quiz_id: quiz.id,
            question: q.question,
            options: q.options,
            correct_answer: q.correct_answer,
          }))
        );

      if (questionsError) throw questionsError;

      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      toast({
        title: "Succès",
        description: "Le quiz a été généré avec succès",
      });
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de générer le quiz",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card 
      className={`p-4 hover:shadow-md transition-shadow duration-300 relative ${
        isTestFile ? 'before:absolute before:inset-0 before:bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#f3f4f6_10px,#f3f4f6_20px)] before:opacity-50 before:pointer-events-none before:rounded-lg overflow-hidden' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-4 relative z-10">
        <div className="flex-1 min-w-0">
          <FileCardTitle
            title={file.title}
            isEditing={isEditing}
            hasAccess={hasAccess}
            newTitle={newTitle}
            onNewTitleChange={onNewTitleChange}
            onRenameSubmit={() => onRenameSubmit(file.id)}
            onRenameCancel={onRenameCancel}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateQuiz}
            disabled={isGenerating || !hasAccess}
            className="flex items-center gap-2"
          >
            <BrainCircuit className="h-4 w-4" />
            <span className="hidden sm:inline">Générer un quiz</span>
          </Button>
          <FileCardActions
            hasAccess={hasAccess}
            onOpenExternal={() => window.open(getFileUrl(), '_blank')}
            onDownload={() => onDownload(file.id, file.file_path, file.title)}
          />
          <FileCardMenu
            onRenameClick={() => {
              setIsMenuOpen(false);
              onRenameClick(file.id, file.title);
            }}
            onDelete={() => {
              setIsMenuOpen(false);
              onDelete(file.id);
            }}
            setIsMenuOpen={setIsMenuOpen}
          />
        </div>
      </div>

      {isPodcast && (
        <div className="mt-4 relative z-10">
          <AudioPlayer filePath={file.file_path} isLocked={!hasAccess} />
        </div>
      )}
    </Card>
  );
}