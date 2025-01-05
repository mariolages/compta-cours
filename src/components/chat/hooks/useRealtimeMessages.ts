import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { ChatMessage } from "@/integrations/supabase/types/tables";
import type { SelectedChat } from "../ChatList";

export const useRealtimeMessages = (selectedChat: SelectedChat) => {
  const { session } = useSessionContext();
  const queryClient = useQueryClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    const setupRealtimeSubscription = async () => {
      if (channelRef.current) {
        await supabase.removeChannel(channelRef.current);
      }

      const channelId = selectedChat.id || selectedChat.participants?.[0];
      let channel = supabase.channel(`chat-${channelId}`);
      
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

              if (newMessage.receiver_id === session?.user?.id) {
                await supabase
                  .from("chat_messages")
                  .update({ read: true })
                  .eq("id", newMessage.id);
              }
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
      );

      channel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          markMessagesAsRead();
        }
      });

      channelRef.current = channel;
    };

    setupRealtimeSubscription();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [queryClient, selectedChat, session?.user?.id]);

  const markMessagesAsRead = async () => {
    const currentMessages = queryClient.getQueryData<ChatMessage[]>([
      "chat-messages",
      selectedChat.id,
      selectedChat.participants?.[0],
    ]) || [];

    if (!session?.user?.id || !currentMessages.length) return;

    const unreadMessages = currentMessages.filter(
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

  return { markMessagesAsRead };
};