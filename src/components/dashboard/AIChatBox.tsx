import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send, Book, Brain, HelpCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { useSessionContext } from '@supabase/auth-helpers-react';

export function AIChatBox() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const { toast } = useToast();
  const { session } = useSessionContext();

  // Fetch user's files
  const { data: files = [] } = useQuery({
    queryKey: ['user-files'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('files')
        .select(`
          id,
          title,
          file_path,
          subject:subject_id (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    try {
      let fileContent = '';
      
      // If a file is selected, download its content
      if (selectedFile) {
        const selectedFileData = files.find(f => f.id === selectedFile);
        if (selectedFileData) {
          const { data, error: downloadError } = await supabase.storage
            .from('dcg_files')
            .download(selectedFileData.file_path);

          if (downloadError) throw downloadError;
          fileContent = await data.text();
        }
      }

      const { data, error } = await supabase.functions.invoke('generate-with-ai', {
        body: { 
          prompt,
          fileContent,
          mode: 'chat'
        }
      });

      if (error) throw error;

      setResponse(data.generatedText);
      setPrompt('');
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de générer une réponse. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-4 bg-white rounded-lg shadow-lg">
      <div className="space-y-4">
        <h3 className="font-medium">Assistant IA</h3>
        <p className="text-sm text-gray-500">
          Posez vos questions sur n'importe quel sujet lié à vos cours.
        </p>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Sélectionner un fichier (optionnel)
          </label>
          <Select value={selectedFile} onValueChange={setSelectedFile}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir un fichier pour le contexte" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Aucun fichier</SelectItem>
              {files.map((file: any) => (
                <SelectItem key={file.id} value={file.id}>
                  {file.title} ({file.subject?.name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {response && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="whitespace-pre-wrap">{response}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-2">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={selectedFile 
              ? "Posez une question sur ce document..." 
              : "Ex: Peux-tu m'expliquer le concept de débit/crédit en comptabilité ?"}
            className="min-h-[100px]"
          />
          <Button 
            type="submit" 
            disabled={isLoading || !prompt.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Envoyer
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}