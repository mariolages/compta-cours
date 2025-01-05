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

  useEffect(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channelId = selectedChat.id || selectedChat.participants?.[0];
    const channel = supabase
      .channel(`chat-${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
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
            if (!currentMessages.some(msg => msg.id === newMessage.id)) {
              queryClient.setQueryData(
                ["chat-messages", selectedChat.id, selectedChat.participants?.[0]],
                [...currentMessages, newMessage]
              );
            }
          } else if (payload.eventType === "UPDATE") {
            const updatedMessage = payload.new as ChatMessage;
            const updatedMessages = currentMessages.map(msg =>
              msg.id === updatedMessage.id ? updatedMessage : msg
            );
            queryClient.setQueryData(
              ["chat-messages", selectedChat.id, selectedChat.participants?.[0]],
              updatedMessages
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

  return {
    messages,
    sendMessage,
  };
};