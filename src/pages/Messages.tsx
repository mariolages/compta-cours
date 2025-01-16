import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ChatList, SelectedChat } from "@/components/chat/ChatList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { useQueryClient } from '@tanstack/react-query';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export default function Messages() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedChat, setSelectedChat] = useState<SelectedChat | null>(null);
  const isMobile = useIsMobile();

  const handleBackToList = () => {
    setSelectedChat(null);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="h-screen bg-[#1C1C1E]">
      <div className="h-full">
        <div className={cn(
          "grid h-full",
          isMobile ? "grid-cols-1" : "grid-cols-[350px_1fr]"
        )}>
          <div className={cn(
            "h-full border-r border-gray-800",
            isMobile && selectedChat ? "hidden" : "block"
          )}>
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-gray-800 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackToDashboard}
                  className="text-white hover:bg-[#2C2C2E]"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h2 className="text-lg font-semibold text-white">Messages</h2>
              </div>
              <div className="flex-1 overflow-hidden">
                <ChatList 
                  selectedChat={selectedChat}
                  onSelectChat={setSelectedChat}
                />
              </div>
            </div>
          </div>

          <div className={cn(
            isMobile && !selectedChat ? "hidden" : "block h-full"
          )}>
            {selectedChat ? (
              <>
                {isMobile && (
                  <Button
                    variant="ghost"
                    className="absolute top-4 left-4 z-10 text-white/90 hover:text-white hover:bg-[#2C2C2E] rounded-lg px-3 py-2 transition-colors duration-200"
                    onClick={handleBackToList}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <ChatWindow selectedChat={selectedChat} />
              </>
            ) : (
              <div className="h-full flex items-center justify-center bg-[#1C1C1E] text-gray-400">
                <p>Sélectionnez une conversation pour commencer</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}