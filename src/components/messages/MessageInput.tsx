import React from 'react';
import { ChatInput } from "@/components/chat/ChatInput";

export const MessageInput = () => {
  const handleSendMessage = (message: string) => {
    console.log('Message sent:', message);
  };

  return <ChatInput onSendMessage={handleSendMessage} />;
};