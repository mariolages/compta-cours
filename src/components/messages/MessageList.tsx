import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

export const MessageList = () => {
  const [messages, setMessages] = React.useState<Message[]>([]);

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500">Pas de messages pour le moment</p>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="bg-white p-4 rounded-lg shadow">
              <p>{message.content}</p>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
};