import { useSessionContext } from '@supabase/auth-helpers-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
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
        const otherUserId = message.sender_id === session?.user?.id 
          ? message.receiver_id 
          : message.sender_id;
        
        // If this user is already in our list, skip it
        if (acc.some(chat => chat.id === otherUserId)) {
          return acc;
        }

        // Get the user profile from the joined profiles data
        const userProfile = message.profiles?.id === otherUserId
          ? message.profiles
          : { id: otherUserId, full_name: 'Utilisateur' };
        
        acc.push(userProfile);
        return acc;
      }, []);

      return uniqueChats || [];
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
            placeholder="Rechercher..."
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
                variant="ghost"
                className={cn(
                  "w-full justify-start group hover:bg-[#2C2C2E] rounded-xl p-3 transition-colors duration-200",
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
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                      <span className="text-lg text-white font-medium">
                        {(user.full_name || 'U')[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex flex-col items-start">
                      <span className={cn(
                        "text-white text-sm",
                        hasUnread && "font-semibold"
                      )}>
                        {user.full_name || 'Utilisateur'}
                      </span>
                    </div>
                  </div>
                  {hasUnread && (
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      {unreadMessages[user.id]}
                    </span>
                  )}
                </div>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};