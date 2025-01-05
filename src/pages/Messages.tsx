import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { ChatBubble } from "@/components/chat/ChatBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users } from "lucide-react";
import type { ChatMessage } from '@/integrations/supabase/types/tables';

export default function Messages() {
  const navigate = useNavigate();
  const { session } = useSessionContext();
  const [selectedUser, setSelectedUser] = useState<{ id: string; email: string } | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .neq('id', session?.user?.id);
      
      if (error) throw error;
      return profiles;
    },
    enabled: !!session?.user?.id,
  });

  useEffect(() => {
    if (selectedUser) {
      const fetchMessages = async () => {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .or(`sender_id.eq.${session?.user?.id},receiver_id.eq.${session?.user?.id}`)
          .order('created_at', { ascending: true });
        
        if (error) {
          console.error('Error fetching messages:', error);
          return;
        }
        
        setMessages(data || []);
      };

      fetchMessages();

      // Subscribe to new messages
      const channel = supabase
        .channel('messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `sender_id=eq.${session?.user?.id},receiver_id=eq.${selectedUser.id}`
          },
          (payload) => {
            setMessages(current => [...current, payload.new as ChatMessage]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedUser, session?.user?.id]);

  const handleSendMessage = async (content: string) => {
    if (!selectedUser || !session?.user?.id) return;

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        content,
        sender_id: session.user.id,
        receiver_id: selectedUser.id
      });

    if (error) {
      console.error('Error sending message:', error);
    }
  };

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
          {/* Liste des utilisateurs */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Utilisateurs</h2>
            </div>
            <div className="space-y-2">
              {users?.map((user) => (
                <Button
                  key={user.id}
                  variant={selectedUser?.id === user.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setSelectedUser(user)}
                >
                  {user.full_name || 'Utilisateur'}
                </Button>
              ))}
            </div>
          </div>

          {/* Zone de chat */}
          <div className="md:col-span-3">
            {selectedUser ? (
              <div className="bg-[#141413] rounded-lg shadow-lg h-[600px] flex flex-col">
                <div className="p-4 border-b border-gray-800">
                  <h3 className="text-white font-semibold">
                    {selectedUser.full_name || 'Conversation'}
                  </h3>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <ChatBubble
                      key={message.id}
                      content={message.content}
                      isCurrentUser={message.sender_id === session?.user?.id}
                      timestamp={new Date(message.created_at)}
                    />
                  ))}
                </div>

                <ChatInput onSendMessage={handleSendMessage} />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg h-[600px] flex items-center justify-center">
                <p className="text-gray-500">
                  Sélectionnez un utilisateur pour démarrer une conversation
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}