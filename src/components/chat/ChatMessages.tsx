import { useEffect, useRef } from "react";
import { ChatMessage } from "@/integrations/supabase/types/tables";
import { ChatBubble } from "./ChatBubble";
import { User } from "@supabase/auth-helpers-react";
import { AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ChatMessagesProps {
  messages: ChatMessage[];
  currentUser: User | null;
}

export const ChatMessages = ({ messages, currentUser }: ChatMessagesProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch user profiles for displaying names
  const { data: profiles } = useQuery({
    queryKey: ['chat-profiles'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name');
      return data || [];
    }
  });

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, []);

  const getSenderName = (senderId: string) => {
    const profile = profiles?.find(p => p.id === senderId);
    return profile?.full_name || 'Utilisateur';
  };

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto scroll-smooth"
      style={{ height: 'calc(100vh - 160px)' }}
    >
      <div className="flex-1 px-4 py-2 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => {
            const isCurrentUser = message.sender_id === currentUser?.id;
            const showName = !isCurrentUser && (
              index === 0 || 
              messages[index - 1]?.sender_id !== message.sender_id
            );

            return (
              <ChatBubble
                key={message.id}
                content={message.content}
                isCurrentUser={isCurrentUser}
                timestamp={new Date(message.created_at)}
                read={message.read}
                senderName={showName ? getSenderName(message.sender_id) : undefined}
              />
            );
          })}
          {messages.length > 0 && messages[messages.length - 1]?.sender_id !== currentUser?.id && (
            <ChatBubble
              key="typing"
              content=""
              isCurrentUser={false}
              timestamp={new Date()}
              isTyping={true}
              senderName={getSenderName(messages[messages.length - 1]?.sender_id)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};