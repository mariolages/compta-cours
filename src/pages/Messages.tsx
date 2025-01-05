import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { ChatBubble } from "@/components/chat/ChatBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Plus } from "lucide-react";
import type { ChatMessage } from '@/integrations/supabase/types/tables';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface SelectedChat {
  id?: string;
  name: string;
  isGroup: boolean;
  participants?: string[];
}

export default function Messages() {
  const navigate = useNavigate();
  const { session } = useSessionContext();
  const [selectedChat, setSelectedChat] = useState<SelectedChat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

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
    if (selectedChat) {
      const fetchMessages = async () => {
        let query = supabase
          .from('chat_messages')
          .select('*')
          .order('created_at', { ascending: true });

        if (selectedChat.isGroup) {
          // Pour les groupes, on filtre par les messages destinés au groupe
          query = query.eq('receiver_id', selectedChat.id);
        } else {
          // Pour les messages privés, on récupère les messages entre les deux utilisateurs
          query = query.or(
            `and(sender_id.eq.${session?.user?.id},receiver_id.eq.${selectedChat.participants?.[0]}),` +
            `and(sender_id.eq.${selectedChat.participants?.[0]},receiver_id.eq.${session?.user?.id})`
          );
        }
        
        const { data, error } = await query;
        
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
            filter: selectedChat.isGroup 
              ? `receiver_id=eq.${selectedChat.id}`
              : `or(and(sender_id=eq.${session?.user?.id},receiver_id=eq.${selectedChat.participants?.[0]}),and(sender_id=eq.${selectedChat.participants?.[0]},receiver_id=eq.${session?.user?.id}))`
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
  }, [selectedChat, session?.user?.id]);

  const handleSendMessage = async (content: string) => {
    if (!selectedChat || !session?.user?.id) return;

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        content,
        sender_id: session.user.id,
        receiver_id: selectedChat.isGroup ? selectedChat.id : selectedChat.participants?.[0]
      });

    if (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleCreateGroup = async () => {
    if (!session?.user?.id || !newGroupName.trim() || selectedParticipants.length === 0) return;

    // Créer un nouveau groupe dans la table chat_groups
    const { data: group, error: groupError } = await supabase
      .from('chat_groups')
      .insert({
        name: newGroupName.trim(),
        created_by: session.user.id,
        participants: [session.user.id, ...selectedParticipants]
      })
      .select()
      .single();

    if (groupError) {
      console.error('Error creating group:', groupError);
      return;
    }

    // Mettre à jour l'interface avec le nouveau groupe
    setSelectedChat({
      id: group.id,
      name: group.name,
      isGroup: true,
      participants: group.participants
    });
    setNewGroupName('');
    setSelectedParticipants([]);
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
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Conversations</h2>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Créer un groupe</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="group-name">Nom du groupe</Label>
                      <Input
                        id="group-name"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder="Entrez le nom du groupe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Participants</Label>
                      {users?.map((user) => (
                        <div key={user.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={user.id}
                            checked={selectedParticipants.includes(user.id)}
                            onCheckedChange={(checked) => {
                              setSelectedParticipants(current =>
                                checked
                                  ? [...current, user.id]
                                  : current.filter(id => id !== user.id)
                              );
                            }}
                          />
                          <Label htmlFor={user.id}>{user.full_name || 'Utilisateur'}</Label>
                        </div>
                      ))}
                    </div>
                    <Button onClick={handleCreateGroup} disabled={!newGroupName.trim() || selectedParticipants.length === 0}>
                      Créer le groupe
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-2">
              {users?.map((user) => (
                <Button
                  key={user.id}
                  variant={selectedChat?.participants?.[0] === user.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setSelectedChat({
                    name: user.full_name || 'Utilisateur',
                    isGroup: false,
                    participants: [user.id]
                  })}
                >
                  {user.full_name || 'Utilisateur'}
                </Button>
              ))}
            </div>
          </div>

          <div className="md:col-span-3">
            {selectedChat ? (
              <div className="bg-[#141413] rounded-lg shadow-lg h-[600px] flex flex-col">
                <div className="p-4 border-b border-gray-800">
                  <h3 className="text-white font-semibold">
                    {selectedChat.name}
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