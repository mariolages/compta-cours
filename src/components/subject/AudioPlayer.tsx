import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume, VolumeX, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface AudioPlayerProps {
  filePath: string;
  isLocked?: boolean;
}

export function AudioPlayer({ filePath, isLocked = false }: AudioPlayerProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const audioRef = React.useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (isLocked) return;
    
    const loadAudio = async () => {
      try {
        setIsLoading(true);
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
      } finally {
        setIsLoading(false);
      }
    };

    loadAudio();
  }, [filePath, toast, isLocked]);

  const handlePlayPause = () => {
    if (isLocked) {
      toast({
        variant: "destructive",
        title: "Contenu verrouillé",
        description: "Abonnez-vous pour accéder à ce contenu",
      });
      return;
    }

    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Error playing audio:", error);
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Impossible de lire l'audio",
          });
        });
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsLoading(false);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const newMutedState = !isMuted;
      setIsMuted(newMutedState);
      if (newMutedState) {
        audioRef.current.volume = 0;
      } else {
        audioRef.current.volume = volume;
      }
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (value: number[]) => {
    if (isLocked) return;
    
    const newTime = value[0];
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  if (isLoading && !isLocked) {
    return (
      <div className="h-[120px] bg-white p-4 rounded-lg shadow-sm flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="h-[120px] bg-white p-4 rounded-lg shadow-sm space-y-2">
        <div className="flex items-center justify-center gap-2 text-gray-400">
          <Lock className="h-5 w-5" />
          <span>Contenu réservé aux abonnés</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[120px] bg-white p-4 rounded-lg shadow-sm space-y-2">
      <audio
        ref={audioRef}
        src={audioUrl || undefined}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onError={(e) => {
          console.error("Audio error:", e);
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Erreur lors de la lecture de l'audio",
          });
        }}
      />
      
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePlayPause}
          className="h-10 w-10 flex-shrink-0"
          disabled={isLocked || isLoading}
        >
          {isPlaying ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6" />
          )}
        </Button>

        <div className="flex-1 min-w-0">
          <Slider
            value={[currentTime]}
            min={0}
            max={duration || 100}
            step={1}
            onValueChange={handleSeek}
            className="w-full"
            disabled={isLocked || isLoading}
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="h-8 w-8 flex-shrink-0"
            disabled={isLocked || isLoading}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume className="h-4 w-4" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            min={0}
            max={1}
            step={0.1}
            onValueChange={handleVolumeChange}
            className="w-24"
            disabled={isLocked || isLoading}
          />
        </div>
      </div>
    </div>
  );
}