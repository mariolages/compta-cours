import React from 'react';
import { useMobile } from "@/hooks/use-mobile";
import { MessageList } from "@/components/messages/MessageList";
import { MessageInput } from "@/components/messages/MessageInput";

const Messages = () => {
  const isMobile = useMobile();

  return (
    <div className={`messages-container ${isMobile ? 'mobile' : 'desktop'}`}>
      <h1 className="text-2xl font-bold">Messages</h1>
      <MessageList />
      <MessageInput />
    </div>
  );
};

export default Messages;
