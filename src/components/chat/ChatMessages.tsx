import { useEffect, useRef } from "react";
import { ChatMessage } from "@/integrations/supabase/types/tables";
import { ChatBubble } from "./ChatBubble";
import { User } from "@supabase/auth-helpers-react";

interface ChatMessagesProps {
  messages: ChatMessage[];
  currentUser: User | null;
}

export const ChatMessages = ({ messages, currentUser }: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <ChatBubble
          key={message.id}
          content={message.content}
          isCurrentUser={message.sender_id === currentUser?.id}
          timestamp={new Date(message.created_at)}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};