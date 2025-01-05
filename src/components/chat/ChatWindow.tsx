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
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: ["chat-messages", selectedChat.id, selectedChat.participants?.[0]],
    queryFn: async () => {
      let query = supabase
        .from("chat_messages")
        .select("*")
        .order("created_at", { ascending: true });

      if (selectedChat.isGroup) {
        query = query.eq("receiver_id", selectedChat.id);
      } else {
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
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      const newMessage = {
        content,
        sender_id: session?.user?.id,
        receiver_id: selectedChat.isGroup ? selectedChat.id : selectedChat.participants?.[0],
        read: false,
      };

      const { data, error } = await supabase
        .from("chat_messages")
        .insert([newMessage])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (newMessage) => {
      // Mettre à jour le cache immédiatement
      const currentMessages = queryClient.getQueryData<ChatMessage[]>([
        "chat-messages",
        selectedChat.id,
        selectedChat.participants?.[0],
      ]) || [];
      
      if (!currentMessages.some(msg => msg.id === newMessage.id)) {
        queryClient.setQueryData(
          ["chat-messages", selectedChat.id, selectedChat.participants?.[0]],
          [...currentMessages, newMessage]
        );
      }
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'envoyer le message",
      });
    },
  });

  // Écoute des changements en temps réel avec gestion optimisée
  useEffect(() => {
    // Nettoyer l'ancien channel s'il existe
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channelId = selectedChat.id || selectedChat.participants?.[0];
    const channel = supabase
      .channel(`chat-${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "*", // Écouter tous les événements (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "chat_messages",
          filter: selectedChat.isGroup
            ? `receiver_id=eq.${selectedChat.id}`
            : `or(and(sender_id=eq.${session?.user?.id},receiver_id=eq.${selectedChat.participants?.[0]}),and(sender_id=eq.${selectedChat.participants?.[0]},receiver_id=eq.${session?.user?.id}))`
        },
        (payload) => {
          console.log("Realtime event received:", payload);
          const currentMessages = queryClient.getQueryData<ChatMessage[]>([
            "chat-messages",
            selectedChat.id,
            selectedChat.participants?.[0],
          ]) || [];

          if (payload.eventType === "INSERT") {
            const newMessage = payload.new as ChatMessage;
            // Ne pas ajouter le message si c'est nous qui l'avons envoyé ou s'il existe déjà
            if (newMessage.sender_id !== session?.user?.id && 
                !currentMessages.some(msg => msg.id === newMessage.id)) {
              queryClient.setQueryData(
                ["chat-messages", selectedChat.id, selectedChat.participants?.[0]],
                [...currentMessages, newMessage]
              );
            }
          } else if (payload.eventType === "UPDATE") {
            const updatedMessage = payload.new as ChatMessage;
            queryClient.setQueryData(
              ["chat-messages", selectedChat.id, selectedChat.participants?.[0]],
              currentMessages.map(msg => 
                msg.id === updatedMessage.id ? updatedMessage : msg
              )
            );
          }
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        console.log("Cleaning up channel");
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [queryClient, selectedChat, session?.user?.id]);

  // Scroll automatique vers le bas à chaque nouveau message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Marquer les messages comme lus quand on les voit
  useEffect(() => {
    const markMessagesAsRead = async () => {
      if (!session?.user?.id || messages.length === 0) return;

      const unreadMessages = messages.filter(
        msg => !msg.read && msg.sender_id !== session.user?.id
      );

      if (unreadMessages.length > 0) {
        const { error } = await supabase
          .from("chat_messages")
          .update({ read: true })
          .in(
            'id',
            unreadMessages.map(msg => msg.id)
          );

        if (error) {
          console.error("Error marking messages as read:", error);
        }
      }
    };

    markMessagesAsRead();
  }, [messages, session?.user?.id]);

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