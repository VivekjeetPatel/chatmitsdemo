import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserFilters } from '@/components/InterestFilterModal';
import { toast } from 'sonner';

interface MatchResult {
  success: boolean;
  matched: boolean;
  session?: {
    id: string;
    user1_id: string;
    user2_id: string;
    status: string;
  };
  matchScore?: number;
  queuePosition?: number;
  message?: string;
}

export const useMatchmaking = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [userId] = useState(() => crypto.randomUUID());
  const [sessionId] = useState(() => crypto.randomUUID());

  const findMatch = async (filters: UserFilters) => {
    setIsSearching(true);
    setMatchResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('find-match', {
        body: {
          userId,
          sessionId,
          filters
        }
      });

      if (error) throw error;

      setMatchResult(data);

      if (data.matched) {
        toast.success(`Match found! Score: ${(data.matchScore * 100).toFixed(0)}%`);
      } else {
        toast.info(data.message || 'Searching for a match...');
      }

      return data;
    } catch (error) {
      console.error('Error finding match:', error);
      toast.error('Failed to find match');
      return null;
    } finally {
      setIsSearching(false);
    }
  };

  // Real-time subscription for match detection
  useEffect(() => {
    if (!isSearching || matchResult?.matched) return;

    console.log('Setting up real-time match detection for user:', userId);

    // Subscribe to matching_queue changes
    const queueChannel = supabase
      .channel(`matching-queue-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matching_queue',
          filter: `user_id=eq.${userId}`
        },
        async (payload: any) => {
          console.log('Queue update received:', payload.new);
          
          if (payload.new.status === 'matched' && payload.new.matched_with) {
            // Get the session
            const { data: session, error } = await (supabase as any)
              .from('chat_sessions')
              .select('*')
              .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
              .eq('status', 'active')
              .order('started_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            if (session && !error) {
              console.log('Match found! Session:', session);
              setMatchResult({
                success: true,
                matched: true,
                session
              });
              toast.success('Match found!');
              setIsSearching(false);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Queue subscription status:', status);
      });

    return () => {
      console.log('Cleaning up match detection for user:', userId);
      supabase.removeChannel(queueChannel);
    };
  }, [isSearching, matchResult, userId]);

  return {
    findMatch,
    isSearching,
    matchResult,
    userId,
    sessionId
  };
};
