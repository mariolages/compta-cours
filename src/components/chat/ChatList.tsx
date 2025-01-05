import { useSessionContext } from '@supabase/auth-helpers-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { ChatGroup } from '@/integrations/supabase/types/tables';
import { cn } from "@/lib/utils";

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

  // Récupérer les messages non lus pour chaque conversation
  const { data: unreadMessages } = useQuery({
    queryKey: ['unread-messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('sender_id, receiver_id, read')
        .eq('read', false)
        .eq('receiver_id', session?.user?.id);
      
      if (error) throw error;
      
      // Grouper les messages non lus par expéditeur
      const unreadCounts = data.reduce((acc: Record<string, number>, message) => {
        const senderId = message.sender_id;
        acc[senderId] = (acc[senderId] || 0) + 1;
        return acc;
      }, {});
      
      return unreadCounts;
    },
    enabled: !!session?.user?.id,
    refetchInterval: 5000, // Rafraîchir toutes les 5 secondes
  });

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <h3 className="font-semibold text-sm text-gray-400 px-2">Messages directs</h3>
        {users?.map((user) => {
          const hasUnread = unreadMessages?.[user.id] > 0;
          
          return (
            <Button
              key={user.id}
              variant={selectedChat?.participants?.[0] === user.id ? "default" : "ghost"}
              className={cn(
                "w-full justify-between group",
                hasUnread && "bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30"
              )}
              onClick={() => onSelectChat({
                name: user.full_name || 'Utilisateur',
                isGroup: false,
                participants: [user.id]
              })}
            >
              <span className={cn(
                "text-left",
                hasUnread && "font-semibold text-blue-600 dark:text-blue-400"
              )}>
                {user.full_name || 'Utilisateur'}
              </span>
              {hasUnread && (
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadMessages[user.id]}
                </span>
              )}
            </Button>
          );
        })}
      </div>

      {groups && groups.length > 0 && (
        <div className="space-y-1 mt-4">
          <h3 className="font-semibold text-sm text-gray-400 px-2">Groupes</h3>
          {groups.map((group) => (
            <Button
              key={group.id}
              variant={selectedChat?.id === group.id ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => onSelectChat({
                id: group.id,
                name: group.name,
                isGroup: true,
                participants: group.participants
              })}
            >
              {group.name}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};