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
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (containerRef.current) {
      const { scrollHeight, clientHeight } = containerRef.current;
      containerRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: "smooth"
      });
    }
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, []);

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto scroll-smooth"
    >
      <div className="flex-1 px-4 py-2 space-y-2">
        {messages.map((message) => (
          <ChatBubble
            key={message.id}
            content={message.content}
            isCurrentUser={message.sender_id === currentUser?.id}
            timestamp={new Date(message.created_at)}
            read={message.read}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};