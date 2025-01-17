import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from '@tanstack/react-query';

interface FavoriteButtonProps {
  fileId: string;
  initialIsFavorite?: boolean;
}

export function FavoriteButton({ fileId, initialIsFavorite = false }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const toggleFavorite = async () => {
    setIsLoading(true);
    try {
      if (isFavorite) {
        // Supprimer des favoris
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('file_id', fileId);

        if (error) throw error;

        toast({
          title: "Retiré des favoris",
          description: "Le fichier a été retiré de vos favoris",
        });
      } else {
        // Ajouter aux favoris
        const { error } = await supabase
          .from('favorites')
          .insert([{ file_id: fileId }]);

        if (error) throw error;

        toast({
          title: "Ajouté aux favoris",
          description: "Le fichier a été ajouté à vos favoris",
        });
      }

      setIsFavorite(!isFavorite);
      // Invalider le cache des favoris
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleFavorite}
      disabled={isLoading}
      className="relative"
    >
      <AnimatePresence>
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Heart
            className={`h-5 w-5 transition-colors ${
              isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500'
            }`}
          />
        </motion.div>
      </AnimatePresence>
    </Button>
  );
}