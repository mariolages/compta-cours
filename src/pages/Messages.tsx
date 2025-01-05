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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="container mx-auto h-screen p-0 md:p-8">
        <div className={cn(
          "grid h-full",
          isMobile ? "grid-cols-1" : "grid-cols-4 gap-6"
        )}>
          <div className={cn(
            "bg-white md:rounded-lg shadow-lg",
            isMobile && selectedChat ? "hidden" : "block"
          )}>
            {!isMobile && (
              <Button
                variant="ghost"
                className="mb-6 ml-4 mt-4"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au tableau de bord
              </Button>
            )}

            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <h2 className="text-lg font-semibold">Conversations</h2>
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
                    className="absolute top-2 left-2 z-10"
                    onClick={handleBackToList}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Retour
                  </Button>
                )}
                <ChatWindow selectedChat={selectedChat} />
              </>
            ) : (
              <div className="bg-white h-full md:rounded-lg shadow-lg flex items-center justify-center">
                <p className="text-gray-500">
                  Sélectionnez une conversation pour commencer à discuter
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}