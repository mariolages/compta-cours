import { useEffect, useRef } from "react";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChatBubble } from "./ChatBubble";
import { ChatInput } from "./ChatInput";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string | null;
  created_at: string;
}

export const ChatWindow = () => {
  const { session } = useSessionContext();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["chat-messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as Message[];
    },
  });

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      const { error } = await supabase.from("chat_messages").insert([
        {
          content,
          sender_id: session?.user?.id,
        },
      ]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-messages"] });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'envoyer le message",
      });
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("chat-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["chat-messages"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="fixed bottom-20 right-8 w-96 h-[500px] bg-[#141413]/90 backdrop-blur-lg rounded-lg shadow-xl border border-gray-800 flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatBubble
            key={message.id}
            content={message.content}
            isCurrentUser={message.sender_id === session?.user?.id}
            timestamp={new Date(message.created_at)}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput
        onSendMessage={(content) => sendMessage.mutate(content)}
        isLoading={sendMessage.isPending}
      />
    </div>
  );
};