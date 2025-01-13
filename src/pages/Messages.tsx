import React from 'react';
import { useMobile } from '@/hooks/use-mobile';
import { MessageList } from '@/components/messages/MessageList';
import { MessageInput } from '@/components/messages/MessageInput';

const Messages = () => {
  const isMobile = useMobile();

  return (
    <div className={`h-screen bg-background ${isMobile ? 'flex flex-col' : 'flex'}`}>
      <MessageList />
    </div>
  );
};

export default Messages;