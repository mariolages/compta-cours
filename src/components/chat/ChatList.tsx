import { useSessionContext } from '@supabase/auth-helpers-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Search, MessageSquare } from "lucide-react";
import { useState } from 'react';
import { useSearch } from '@/hooks/use-search';

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
  const [showSearch, setShowSearch] = useState(false);

  // Get recent conversations
  const { data: recentChats } = useQuery({
    queryKey: ['recent-chats'],
    queryFn: async () => {
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select(`
          id,
          sender_id,
          receiver_id,
          created_at,
          profiles!chat_messages_sender_id_fkey (
            id,
            full_name
          )
        `)
        .or(`sender_id.eq.${session?.user?.id},receiver_id.eq.${session?.user?.id}`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Get unique conversations
      const uniqueChats = messages?.reduce((acc: any[], message) => {
        const otherUser = message.sender_id === session?.user?.id 
          ? { id: message.receiver_id }
          : message.profiles;
        
        if (!acc.some(chat => chat.id === otherUser.id)) {
          acc.push(otherUser);
        }
        return acc;
      }, []);

      return uniqueChats;
    },
    enabled: !!session?.user?.id,
  });

  // Search functionality
  const { 
    query: searchQuery,
    setQuery: setSearchQuery,
    results: searchResults,
  } = useSearch({
    table: 'profiles',
    columns: ['full_name'],
  });

  // Get unread messages count
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

  const displayedUsers = showSearch ? searchResults : recentChats;

  return (
    <div className="flex flex-col h-full bg-[#1C1C1E]">
      <div className="p-4 border-b border-gray-800">
        <div className="relative">
          <Input
            placeholder="Rechercher un contact..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearch(true);
            }}
            onFocus={() => setShowSearch(true)}
            className="pl-10 bg-[#2C2C2E] border-none text-white placeholder-gray-400 rounded-full"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1 p-2">
          {displayedUsers?.map((user) => {
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
                onClick={() => {
                  onSelectChat({
                    name: user.full_name || 'Utilisateur',
                    isGroup: false,
                    participants: [user.id]
                  });
                  setShowSearch(false);
                  setSearchQuery('');
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                    <MessageSquare className="h-5 w-5" />
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
      </div>
    </div>
  );
};