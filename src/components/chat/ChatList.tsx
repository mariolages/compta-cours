import { useSessionContext } from '@supabase/auth-helpers-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { ChatGroup } from '@/integrations/supabase/types/tables';

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

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <h3 className="font-semibold text-sm text-gray-400 px-2">Messages directs</h3>
        {users?.map((user) => (
          <Button
            key={user.id}
            variant={selectedChat?.participants?.[0] === user.id ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => onSelectChat({
              name: user.full_name || 'Utilisateur',
              isGroup: false,
              participants: [user.id]
            })}
          >
            {user.full_name || 'Utilisateur'}
          </Button>
        ))}
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