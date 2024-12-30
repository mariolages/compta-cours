import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Upload } from "lucide-react";
import Papa from 'papaparse';

interface FileImportFormProps {
  onQuestionsImported: (questions: any[]) => void;
}

export function FileImportForm({ onQuestionsImported }: FileImportFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    try {
      Papa.parse(file, {
        complete: (results) => {
          const questions = results.data.slice(1).map((row: any) => ({
            question: row[0],
            options: [row[1], row[2], row[3]],
            correct_answers: row[4].split(',').map((index: string) => row[parseInt(index)]),
            explanation: row[5] || ''
          }));

          onQuestionsImported(questions);
          toast({
            title: "Succès",
            description: `${questions.length} questions importées avec succès`,
          });
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Impossible de lire le fichier CSV",
          });
        },
        header: true,
      });
    } catch (error) {
      console.error('Error importing file:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de l'importation",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="file">Importer un fichier CSV</Label>
        <Input
          id="file"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          disabled={isLoading}
        />
        <p className="text-sm text-muted-foreground">
          Format attendu : Question, Option 1, Option 2, Option 3, Indices des bonnes réponses (ex: "1,3"), Explication (optionnelle)
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Importation en cours...</span>
        </div>
      )}
    </div>
  );
}