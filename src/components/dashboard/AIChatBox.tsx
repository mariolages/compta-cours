import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send, Book, Brain, HelpCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AIChatBox() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent, mode: 'chat' | 'summary' | 'quiz') => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-with-ai', {
        body: { 
          prompt: prompt,
          mode: mode 
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
      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            Assistant
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <Book className="w-4 h-4" />
            Résumé
          </TabsTrigger>
          <TabsTrigger value="quiz" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Quiz
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat">
          <div className="space-y-4">
            <h3 className="font-medium">Assistant IA</h3>
            <p className="text-sm text-gray-500">
              Posez vos questions sur n'importe quel sujet lié à vos cours.
            </p>
            {response && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="whitespace-pre-wrap">{response}</p>
              </div>
            )}
            <form onSubmit={(e) => handleSubmit(e, 'chat')} className="space-y-2">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: Peux-tu m'expliquer le concept de débit/crédit en comptabilité ?"
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
        </TabsContent>

        <TabsContent value="summary">
          <div className="space-y-4">
            <h3 className="font-medium">Générateur de résumés</h3>
            <p className="text-sm text-gray-500">
              Collez un texte de cours pour obtenir un résumé clair et concis.
            </p>
            {response && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="whitespace-pre-wrap">{response}</p>
              </div>
            )}
            <form onSubmit={(e) => handleSubmit(e, 'summary')} className="space-y-2">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Collez votre texte ici..."
                className="min-h-[200px]"
              />
              <Button 
                type="submit" 
                disabled={isLoading || !prompt.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Génération du résumé...
                  </>
                ) : (
                  <>
                    <Book className="mr-2 h-4 w-4" />
                    Générer un résumé
                  </>
                )}
              </Button>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="quiz">
          <div className="space-y-4">
            <h3 className="font-medium">Générateur de quiz</h3>
            <p className="text-sm text-gray-500">
              Collez un texte de cours pour générer automatiquement des questions de quiz.
            </p>
            {response && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="whitespace-pre-wrap">{response}</p>
              </div>
            )}
            <form onSubmit={(e) => handleSubmit(e, 'quiz')} className="space-y-2">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Collez votre texte de cours ici..."
                className="min-h-[200px]"
              />
              <Button 
                type="submit" 
                disabled={isLoading || !prompt.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Génération des questions...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Générer des questions
                  </>
                )}
              </Button>
            </form>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}