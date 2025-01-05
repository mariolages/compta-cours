import { useSessionContext } from "@supabase/auth-helpers-react";
import { ChatInput } from "./ChatInput";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { useChat } from "./useChat";
import type { SelectedChat } from "./ChatList";

interface ChatWindowProps {
  selectedChat: SelectedChat;
}

export const ChatWindow = ({ selectedChat }: ChatWindowProps) => {
  const { session } = useSessionContext();
  const { messages, sendMessage } = useChat(selectedChat);

  return (
    <div className="bg-[#141413] rounded-lg shadow-lg h-[600px] flex flex-col">
      <ChatHeader name={selectedChat.name} />
      <ChatMessages messages={messages} currentUser={session?.user} />
      <ChatInput onSendMessage={(content) => sendMessage.mutate(content)} />
    </div>
  );
};