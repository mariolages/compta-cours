import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface QuizSettingsProps {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  timeLimit: number | null;
  setTimeLimit: (value: number | null) => void;
  shuffleQuestions: boolean;
  setShuffleQuestions: (value: boolean) => void;
  shuffleAnswers: boolean;
  setShuffleAnswers: (value: boolean) => void;
}

export function QuizSettings({
  title,
  setTitle,
  description,
  setDescription,
  timeLimit,
  setTimeLimit,
  shuffleQuestions,
  setShuffleQuestions,
  shuffleAnswers,
  setShuffleAnswers,
}: QuizSettingsProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Titre du quiz</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Quiz sur le chapitre 1"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description (optionnelle)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Décrivez brièvement le contenu du quiz..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="timeLimit">Limite de temps (minutes)</Label>
          <Input
            id="timeLimit"
            type="number"
            value={timeLimit || ""}
            onChange={(e) => setTimeLimit(e.target.value ? parseInt(e.target.value) : null)}
            placeholder="Optionnel"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="shuffleQuestions">Mélanger les questions</Label>
            <Switch
              id="shuffleQuestions"
              checked={shuffleQuestions}
              onCheckedChange={setShuffleQuestions}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="shuffleAnswers">Mélanger les réponses</Label>
            <Switch
              id="shuffleAnswers"
              checked={shuffleAnswers}
              onCheckedChange={setShuffleAnswers}
            />
          </div>
        </div>
      </div>
    </div>
  );
}