import React from 'react';
import { ChatList } from "@/components/chat/ChatList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { useState } from "react";
import type { SelectedChat } from "@/components/chat/ChatList";

export const MessageList = () => {
  const [selectedChat, setSelectedChat] = useState<SelectedChat | null>(null);

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#1C1C1E]">
      <div className="w-80 border-r border-gray-800 p-4 overflow-y-auto">
        <ChatList selectedChat={selectedChat} onSelectChat={setSelectedChat} />
      </div>
      {selectedChat ? (
        <div className="flex-1">
          <ChatWindow selectedChat={selectedChat} />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          Sélectionnez une conversation pour commencer
        </div>
      )}
    </div>
  );
};