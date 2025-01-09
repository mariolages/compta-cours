import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUploadProgress } from "./FileUploadProgress";

interface FileUploadFormProps {
  subjectId: string;
  categoryId: string;
  isLoading: boolean;
  progress: number;
  defaultSubjectId?: string;
  onSubjectChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onFilesChange: (files: FileList | null) => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function FileUploadForm({
  subjectId,
  categoryId,
  isLoading,
  progress,
  defaultSubjectId,
  onSubjectChange,
  onCategoryChange,
  onFilesChange,
  onCancel,
  onSubmit,
}: FileUploadFormProps) {
  const acceptedFileTypes = categoryId === "6" 
    ? ".mp3,.wav,.m4a,.aac"
    : categoryId === "8" 
      ? ".doc,.docx,.pdf"
      : ".pdf,.doc,.docx,.xls,.xlsx";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="subject">Matière</Label>
        <Select
          value={subjectId}
          onValueChange={onSubjectChange}
          disabled={defaultSubjectId ? true : isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner une matière" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">UE1 - Fondamentaux du droit</SelectItem>
            <SelectItem value="2">UE2 - Droit des sociétés</SelectItem>
            <SelectItem value="3">UE3 - Droit social</SelectItem>
            <SelectItem value="4">UE4 - Droit fiscal</SelectItem>
            <SelectItem value="5">UE5 - Économie contemporaine</SelectItem>
            <SelectItem value="6">UE6 - Finance d'entreprise</SelectItem>
            <SelectItem value="7">UE7 - Management</SelectItem>
            <SelectItem value="8">UE8 - Systèmes d'information de gestion</SelectItem>
            <SelectItem value="9">UE9 - Comptabilité</SelectItem>
            <SelectItem value="10">UE10 - Comptabilité approfondie</SelectItem>
            <SelectItem value="11">UE11 - Contrôle de gestion</SelectItem>
            <SelectItem value="12">UE12 - Anglais des affaires</SelectItem>
            <SelectItem value="13">UE13 - Communication professionnelle</SelectItem>
            <SelectItem value="14">UE14 - Relations professionnelles</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Catégorie</Label>
        <Select
          value={categoryId}
          onValueChange={onCategoryChange}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner une catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">📘 Cours</SelectItem>
            <SelectItem value="2">📄 Exercices</SelectItem>
            <SelectItem value="3">✅ Corrections d'exercices</SelectItem>
            <SelectItem value="4">📂 Sujets d'examen</SelectItem>
            <SelectItem value="5">✅ Corrections de sujets d'examen</SelectItem>
            <SelectItem value="6">🎧 Podcasts</SelectItem>
            <SelectItem value="8">📝 Fiches</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="files">Fichiers</Label>
        <Input
          id="files"
          type="file"
          onChange={(e) => onFilesChange(e.target.files)}
          disabled={isLoading}
          accept={acceptedFileTypes}
          multiple
        />
        {categoryId === "6" && (
          <p className="text-sm text-gray-500">
            Formats acceptés : MP3, WAV, M4A, AAC
          </p>
        )}
        {categoryId === "8" && (
          <p className="text-sm text-gray-500">
            Formats acceptés : DOC, DOCX, PDF
          </p>
        )}
      </div>

      {isLoading && progress > 0 && <FileUploadProgress progress={progress} />}

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Dépôt en cours..." : "Déposer"}
        </Button>
      </div>
    </form>
  );
}