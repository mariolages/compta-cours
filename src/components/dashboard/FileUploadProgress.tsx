import { Progress } from "@/components/ui/progress";

interface FileUploadProgressProps {
  progress: number;
}

export function FileUploadProgress({ progress }: FileUploadProgressProps) {
  return (
    <div className="space-y-2">
      <Progress value={progress} className="w-full" />
      <p className="text-sm text-center text-muted-foreground">
        {Math.round(progress)}% terminé
      </p>
    </div>
  );
}