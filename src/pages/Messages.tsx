import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users } from "lucide-react";
import { ChatList, SelectedChat } from "@/components/chat/ChatList";
import { CreateGroupDialog } from "@/components/chat/CreateGroupDialog";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { useQueryClient } from '@tanstack/react-query';

export default function Messages() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedChat, setSelectedChat] = useState<SelectedChat | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour au tableau de bord
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-4">
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

          <div className="md:col-span-3">
            {selectedChat ? (
              <ChatWindow selectedChat={selectedChat} />
            ) : (
              <div className="bg-white rounded-lg shadow-lg h-[600px] flex items-center justify-center">
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