import { useEffect, useRef } from "react";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage } from "@/integrations/supabase/types/tables";
import type { SelectedChat } from "./ChatList";

export const useChat = (selectedChat: SelectedChat) => {
  const { session } = useSessionContext();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Requête pour récupérer les messages
  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: ["chat-messages", selectedChat.id, selectedChat.participants?.[0]],
    queryFn: async () => {
      let query = supabase
        .from("chat_messages")
        .select("*")
        .order("created_at", { ascending: true });

      if (selectedChat.isGroup) {
        // Pour les groupes, on récupère tous les messages du groupe
        query = query.eq("receiver_id", selectedChat.id);
      } else {
        // Pour les conversations individuelles, on récupère les messages dans les deux sens
        const currentUserId = session?.user?.id;
        const otherUserId = selectedChat.participants?.[0];
        
        query = query.or(
          `sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`
        ).or(
          `sender_id.eq.${otherUserId},receiver_id.eq.${otherUserId}`
        );
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching messages:", error);
        throw error;
      }

      // Filtrer les messages pour ne garder que ceux de la conversation
      const filteredMessages = data.filter(message => {
        if (selectedChat.isGroup) {
          return message.receiver_id === selectedChat.id;
        } else {
          const isMessageBetweenUsers = (
            (message.sender_id === session?.user?.id && message.receiver_id === selectedChat.participants?.[0]) ||
            (message.sender_id === selectedChat.participants?.[0] && message.receiver_id === session?.user?.id)
          );
          return isMessageBetweenUsers;
        }
      });

      return filteredMessages;
    },
    enabled: !!session?.user?.id && (!!selectedChat.id || !!selectedChat.participants?.[0]),
    refetchOnWindowFocus: false,
  });

  // Mutation pour envoyer un message
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

      if (error) {
        console.error("Error sending message:", error);
        throw error;
      }
      return data;
    },
    onSuccess: (newMessage) => {
      console.log("Message sent successfully:", newMessage);
      queryClient.setQueryData(
        ["chat-messages", selectedChat.id, selectedChat.participants?.[0]],
        (oldMessages: ChatMessage[] = []) => [...oldMessages, newMessage]
      );
    },
    onError: (error) => {
      console.error("Error in mutation:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'envoyer le message",
      });
    },
  });

  // Gestion des mises à jour en temps réel
  useEffect(() => {
    const setupRealtimeSubscription = async () => {
      if (channelRef.current) {
        console.log("Removing existing channel");
        await supabase.removeChannel(channelRef.current);
      }

      const channelId = selectedChat.id || selectedChat.participants?.[0];
      console.log("Creating new channel for:", channelId);
      
      let channel = supabase.channel(`chat-${channelId}`);
      
      // Configuration des événements en temps réel
      channel = channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_messages",
          filter: selectedChat.isGroup
            ? `receiver_id=eq.${selectedChat.id}`
            : `or(and(sender_id=eq.${session?.user?.id},receiver_id=eq.${selectedChat.participants?.[0]}),and(sender_id=eq.${selectedChat.participants?.[0]},receiver_id=eq.${session?.user?.id}))`
        },
        async (payload) => {
          console.log("Realtime event received:", payload);
          
          const currentMessages = queryClient.getQueryData<ChatMessage[]>([
            "chat-messages",
            selectedChat.id,
            selectedChat.participants?.[0],
          ]) || [];

          if (payload.eventType === "INSERT") {
            const newMessage = payload.new as ChatMessage;
            if (!currentMessages.some(msg => msg.id === newMessage.id)) {
              console.log("Adding new message to cache:", newMessage);
              queryClient.setQueryData(
                ["chat-messages", selectedChat.id, selectedChat.participants?.[0]],
                [...currentMessages, newMessage]
              );

              // Marquer automatiquement comme lu si c'est le destinataire
              if (newMessage.receiver_id === session?.user?.id) {
                await supabase
                  .from("chat_messages")
                  .update({ read: true })
                  .eq("id", newMessage.id);
              }
            }
          } else if (payload.eventType === "UPDATE") {
            const updatedMessage = payload.new as ChatMessage;
            console.log("Updating message in cache:", updatedMessage);
            const updatedMessages = currentMessages.map(msg =>
              msg.id === updatedMessage.id ? updatedMessage : msg
            );
            queryClient.setQueryData(
              ["chat-messages", selectedChat.id, selectedChat.participants?.[0]],
              updatedMessages
            );
          }
        }
      );

      // Souscription au canal
      channel.subscribe(async (status) => {
        console.log("Subscription status:", status);
        if (status === "SUBSCRIBED") {
          await markMessagesAsRead();
        }
      });

      channelRef.current = channel;
    };

    setupRealtimeSubscription();

    return () => {
      if (channelRef.current) {
        console.log("Cleaning up channel");
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [queryClient, selectedChat, session?.user?.id]);

  // Marquer les messages comme lus
  const markMessagesAsRead = async () => {
    if (!session?.user?.id || !messages.length) return;

    const unreadMessages = messages.filter(
      msg => !msg.read && msg.sender_id !== session.user?.id
    );

    if (unreadMessages.length > 0) {
      console.log("Marking messages as read:", unreadMessages);
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

  return {
    messages,
    sendMessage,
  };
};