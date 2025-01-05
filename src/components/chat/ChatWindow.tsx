import { useEffect, useRef } from "react";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChatBubble } from "./ChatBubble";
import { ChatInput } from "./ChatInput";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage } from "@/integrations/supabase/types/tables";
import type { SelectedChat } from "./ChatList";

interface ChatWindowProps {
  selectedChat: SelectedChat;
}

export const ChatWindow = ({ selectedChat }: ChatWindowProps) => {
  const { session } = useSessionContext();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: ["chat-messages", selectedChat.id, selectedChat.participants?.[0]],
    queryFn: async () => {
      let query = supabase
        .from("chat_messages")
        .select("*")
        .order("created_at", { ascending: true });

      if (selectedChat.isGroup) {
        // Pour les groupes, on filtre par les messages destinés au groupe
        query = query.eq("receiver_id", selectedChat.id);
      } else {
        // Pour les messages privés, on récupère les messages entre les deux utilisateurs
        query = query.or(
          `and(sender_id.eq.${session?.user?.id},receiver_id.eq.${selectedChat.participants?.[0]}),` +
          `and(sender_id.eq.${selectedChat.participants?.[0]},receiver_id.eq.${session?.user?.id})`
        );
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id && (!!selectedChat.id || !!selectedChat.participants?.[0]),
  });

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      const { error } = await supabase.from("chat_messages").insert([
        {
          content,
          sender_id: session?.user?.id,
          receiver_id: selectedChat.isGroup ? selectedChat.id : selectedChat.participants?.[0],
        },
      ]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["chat-messages", selectedChat.id, selectedChat.participants?.[0]]
      });
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
          filter: selectedChat.isGroup
            ? `receiver_id=eq.${selectedChat.id}`
            : `or(and(sender_id=eq.${session?.user?.id},receiver_id=eq.${selectedChat.participants?.[0]}),and(sender_id=eq.${selectedChat.participants?.[0]},receiver_id=eq.${session?.user?.id}))`
        },
        (payload) => {
          queryClient.invalidateQueries({ 
            queryKey: ["chat-messages", selectedChat.id, selectedChat.participants?.[0]]
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, selectedChat, session?.user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="bg-[#141413] rounded-lg shadow-lg h-[600px] flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-white font-semibold">
          {selectedChat.name}
        </h3>
      </div>
      
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

      <ChatInput onSendMessage={(content) => sendMessage.mutate(content)} />
    </div>
  );
};