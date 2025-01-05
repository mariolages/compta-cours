import { useEffect, useRef } from "react";
import { ChatMessage } from "@/integrations/supabase/types/tables";
import { ChatBubble } from "./ChatBubble";
import { User } from "@supabase/auth-helpers-react";

interface ChatMessagesProps {
  messages: ChatMessage[];
  currentUser: User | null;
}

export const ChatMessages = ({ messages, currentUser }: ChatMessagesProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial scroll to bottom
  useEffect(() => {
    // Small delay to ensure content is rendered
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto scroll-smooth"
      style={{ height: 'calc(100vh - 160px)' }}
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
      </div>
    </div>
  );
};