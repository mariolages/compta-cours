import { useMessages } from "./hooks/useMessages";
import { useSendMessage } from "./hooks/useSendMessage";
import { useRealtimeMessages } from "./hooks/useRealtimeMessages";
import type { SelectedChat } from "./ChatList";

export const useChat = (selectedChat: SelectedChat) => {
  const { data: messages = [] } = useMessages(selectedChat);
  const sendMessage = useSendMessage(selectedChat);
  useRealtimeMessages(selectedChat);

  return {
    messages,
    sendMessage,
  };
};