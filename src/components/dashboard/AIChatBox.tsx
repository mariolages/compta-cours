import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { useSessionContext } from '@supabase/auth-helpers-react';
import { Button } from "../ui/button";

export function AIChatBox() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string>("no-file");
  const { toast } = useToast();
  const { session } = useSessionContext();

  const { data: files } = useQuery({
    queryKey: ["user-files"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("files")
        .select(`
          id,
          title,
          file_path,
          subject:subject_id(name)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching files:", error);
        return [];
      }

      return data;
    },
    enabled: !!session,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setIsLoading(true);

    try {
      let fileContent = "";
      if (selectedFileId && selectedFileId !== "no-file") {
        const file = files?.find((f) => f.id === selectedFileId);
        if (file) {
          const { data, error } = await supabase.storage
            .from("dcg_files")
            .download(file.file_path);

          if (!error && data) {
            fileContent = await data.text();
          }
        }
      }

      const response = await supabase.functions.invoke("generate-with-ai", {
        body: { prompt: input, fileContent },
      });

      if (response.error) throw response.error;

      const aiMessage = {
        role: "assistant",
        content: response.data.generatedText,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération de la réponse",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6">
        <div className="mb-4">
          <Select value={selectedFileId} onValueChange={setSelectedFileId}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir un fichier pour le contexte" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no-file">Aucun fichier</SelectItem>
              {files?.map((file: any) => (
                <SelectItem key={file.id} value={file.id}>
                  {file.title} ({file.subject?.name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {messages.map((message, i) => (
            <div
              key={i}
              className={`flex ${
                message.role === "assistant" ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] ${
                  message.role === "assistant"
                    ? "bg-muted text-muted-foreground"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-4">
          <div className="flex gap-4">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez votre question..."
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}