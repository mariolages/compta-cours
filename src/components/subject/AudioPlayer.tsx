import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface AudioPlayerProps {
  filePath: string;
}

export function AudioPlayer({ filePath }: AudioPlayerProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadAudio = async () => {
      try {
        const { data: { publicUrl } } = supabase
          .storage
          .from('dcg_files')
          .getPublicUrl(filePath);

        setAudioUrl(publicUrl);
      } catch (error) {
        console.error("Error loading audio:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger le fichier audio",
        });
      }
    };

    loadAudio();
  }, [filePath, toast]);

  if (!audioUrl) {
    return <div className="animate-pulse bg-gray-200 h-12 rounded-md" />;
  }

  return (
    <audio
      controls
      className="w-full mt-2"
      src={audioUrl}
    >
      Votre navigateur ne supporte pas la lecture audio.
    </audio>
  );
}