import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users } from "lucide-react";
import { ChatList, SelectedChat } from "@/components/chat/ChatList";
import { CreateGroupDialog } from "@/components/chat/CreateGroupDialog";
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
    <div className="chat-container">
      <div className="container mx-auto h-screen p-0">
        <div className={cn(
          "grid h-full",
          isMobile ? "grid-cols-1" : "grid-cols-4"
        )}>
          <div className={cn(
            "chat-sidebar",
            isMobile && selectedChat ? "hidden" : "block"
          )}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBackToDashboard}
                    className="mr-2 text-gray-400 hover:text-white hover:bg-gray-700"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <Users className="h-5 w-5 text-gray-400" />
                  <h2 className="text-lg font-semibold text-white">Messages</h2>
                </div>
                <CreateGroupDialog 
                  onGroupCreated={() => {
                    queryClient.invalidateQueries({ queryKey: ['chat-groups'] });
                  }} 
                />
              </div>
              <ChatList 
                selectedChat={selectedChat}
                onSelectChat={setSelectedChat}
              />
            </div>
          </div>

          <div className={cn(
            "md:col-span-3",
            isMobile && !selectedChat ? "hidden" : "block h-full"
          )}>
            {selectedChat ? (
              <>
                {isMobile && (
                  <Button
                    variant="ghost"
                    className="absolute top-2 left-2 z-10 text-white hover:bg-gray-700"
                    onClick={handleBackToList}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Retour
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