import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MessageCircle } from "lucide-react";
import { ProfileMenu } from "./ProfileMenu";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { User } from '@supabase/auth-helpers-react';
import type { Profile } from '@/types/admin';

interface DashboardNavProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedClassId: number | null;
  onBackClick: () => void;
  profile?: Profile | null;
  user?: User | null;
}

export function DashboardNav({
  searchQuery,
  onSearchChange,
  selectedClassId,
  onBackClick,
  profile,
  user
}: DashboardNavProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const queryClient = useQueryClient();

  // Requête pour obtenir les messages non lus
  const { data: unreadMessages } = useQuery({
    queryKey: ['unread-messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('id')
        .eq('receiver_id', user?.id)
        .eq('read', false);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (unreadMessages) {
      setUnreadCount(unreadMessages.length);
    }
  }, [unreadMessages]);

  // Écouter les nouveaux messages en temps réel
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('unread-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        () => {
          // Invalider le cache pour forcer une nouvelle requête
          queryClient.invalidateQueries({ queryKey: ['unread-messages'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  return (
    <div className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 gap-4">
        {selectedClassId && (
          <Button
            variant="ghost"
            onClick={onBackClick}
            className="mr-2"
          >
            ← Retour
          </Button>
        )}
        
        <div className="flex-1 flex gap-4">
          <form className="flex-1 flex items-center space-x-2">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-8"
              />
            </div>
          </form>
          
          <Link to="/messages" className="relative">
            <Button variant="outline" size="icon" className="relative">
              <MessageCircle className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </Link>
        </div>

        <ProfileMenu profile={profile} user={user} />
      </div>
    </div>
  );
}