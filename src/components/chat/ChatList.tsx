import { useSessionContext } from '@supabase/auth-helpers-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import type { ChatGroup } from '@/integrations/supabase/types/tables';
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { useState } from 'react';

interface ChatListProps {
  selectedChat: SelectedChat | null;
  onSelectChat: (chat: SelectedChat) => void;
}

export interface SelectedChat {
  id?: string;
  name: string;
  isGroup: boolean;
  participants?: string[];
}

export const ChatList = ({ selectedChat, onSelectChat }: ChatListProps) => {
  const { session } = useSessionContext();
  const [searchQuery, setSearchQuery] = useState('');

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

  const { data: groups } = useQuery({
    queryKey: ['chat-groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_groups')
        .select('*')
        .contains('participants', [session?.user?.id]);
      
      if (error) throw error;
      return data as ChatGroup[];
    },
    enabled: !!session?.user?.id,
  });

  const { data: unreadMessages } = useQuery({
    queryKey: ['unread-messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('sender_id, receiver_id, read')
        .eq('read', false)
        .eq('receiver_id', session?.user?.id);
      
      if (error) throw error;
      
      const unreadCounts = data.reduce((acc: Record<string, number>, message) => {
        const senderId = message.sender_id;
        acc[senderId] = (acc[senderId] || 0) + 1;
        return acc;
      }, {});
      
      return unreadCounts;
    },
    enabled: !!session?.user?.id,
    refetchInterval: 5000,
  });

  const filteredUsers = users?.filter(user => 
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroups = groups?.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#1C1C1E]">
      <div className="p-4 border-b border-gray-800">
        <div className="relative">
          <Input
            placeholder="Rechercher un contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#2C2C2E] border-none text-white placeholder-gray-400 rounded-full"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1 p-2">
          {filteredUsers?.map((user) => {
            const hasUnread = unreadMessages?.[user.id] > 0;
            
            return (
              <Button
                key={user.id}
                variant={selectedChat?.participants?.[0] === user.id ? "default" : "ghost"}
                className={cn(
                  "w-full justify-between group hover:bg-[#2C2C2E] rounded-xl transition-colors duration-200",
                  selectedChat?.participants?.[0] === user.id ? "bg-[#2C2C2E]" : "",
                  hasUnread && "bg-blue-500/10 hover:bg-blue-500/20"
                )}
                onClick={() => onSelectChat({
                  name: user.full_name || 'Utilisateur',
                  isGroup: false,
                  participants: [user.id]
                })}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                    {user.full_name?.[0].toUpperCase()}
                  </div>
                  <span className={cn(
                    "text-left text-white",
                    hasUnread && "font-semibold"
                  )}>
                    {user.full_name || 'Utilisateur'}
                  </span>
                </div>
                {hasUnread && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    {unreadMessages[user.id]}
                  </span>
                )}
              </Button>
            );
          })}
        </div>

        {filteredGroups && filteredGroups.length > 0 && (
          <div className="space-y-1 p-2 mt-4">
            <h3 className="text-sm text-gray-400 px-2 mb-2">Groupes</h3>
            {filteredGroups.map((group) => (
              <Button
                key={group.id}
                variant={selectedChat?.id === group.id ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start hover:bg-[#2C2C2E] rounded-xl transition-colors duration-200",
                  selectedChat?.id === group.id ? "bg-[#2C2C2E]" : ""
                )}
                onClick={() => onSelectChat({
                  id: group.id,
                  name: group.name,
                  isGroup: true,
                  participants: group.participants
                })}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {group.name[0].toUpperCase()}
                  </div>
                  <span className="text-white">{group.name}</span>
                </div>
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};