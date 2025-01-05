import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChatMessage } from "@/integrations/supabase/types/tables";
import type { SelectedChat } from "../ChatList";
import { useSessionContext } from "@supabase/auth-helpers-react";

export const useMessages = (selectedChat: SelectedChat) => {
  const { session } = useSessionContext();

  return useQuery<ChatMessage[]>({
    queryKey: ["chat-messages", selectedChat.id, selectedChat.participants?.[0]],
    queryFn: async () => {
      let query = supabase
        .from("chat_messages")
        .select("*")
        .order("created_at", { ascending: true });

      if (selectedChat.isGroup) {
        query = query.eq("receiver_id", selectedChat.id);
      } else {
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

      return data.filter(message => {
        if (selectedChat.isGroup) {
          return message.receiver_id === selectedChat.id;
        } else {
          return (
            (message.sender_id === session?.user?.id && message.receiver_id === selectedChat.participants?.[0]) ||
            (message.sender_id === selectedChat.participants?.[0] && message.receiver_id === session?.user?.id)
          );
        }
      });
    },
    enabled: !!session?.user?.id && (!!selectedChat.id || !!selectedChat.participants?.[0]),
    refetchInterval: 3000, // Actualisation toutes les 3 secondes
  });
};