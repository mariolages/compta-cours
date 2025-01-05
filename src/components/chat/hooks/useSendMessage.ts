import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage } from "@/integrations/supabase/types/tables";
import type { SelectedChat } from "../ChatList";

export const useSendMessage = (selectedChat: SelectedChat) => {
  const { session } = useSessionContext();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
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
      queryClient.setQueryData(
        ["chat-messages", selectedChat.id, selectedChat.participants?.[0]],
        (oldMessages: ChatMessage[] = []) => [...oldMessages, newMessage]
      );
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'envoyer le message",
      });
    },
  });
};