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
    <div className="flex flex-col h-full">
      <ChatHeader name={selectedChat.name} />
      <div className="flex-1 overflow-hidden flex flex-col">
        <ChatMessages messages={messages} currentUser={session?.user} />
        <ChatInput onSendMessage={(content) => sendMessage.mutate(content)} />
      </div>
    </div>
  );
};